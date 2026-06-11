import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  createPublicClient,
  createWalletClient,
  formatUnits,
  getAddress,
  http,
  parseAbi,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celoSepolia } from "viem/chains";

const CONTRACT = getAddress("0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5");
const USDC = getAddress("0x01C5C0122039549AD1493B8220cABEdD739BC44E");
const RISK_TARGET = getAddress("0x19A12f8b9e8eF0A1443B86F842cC3901d9C09a91");
const CIRCLE_ID = BigInt(process.env.NEXT_PUBLIC_CHAMASCORE_CIRCLE_ID || "3");
const CONTRIBUTION = parseUnits("0.5", 6);

function loadPrivateKey() {
  if (process.env.CHAMASCORE_PRIVATE_KEY) {
    return process.env.CHAMASCORE_PRIVATE_KEY;
  }

  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    return undefined;
  }

  const match = readFileSync(envPath, "utf8").match(
    /^CHAMASCORE_PRIVATE_KEY=(.+)$/m,
  );
  return match?.[1]?.trim();
}

function updateEnvLocal(updates) {
  const envPath = resolve(process.cwd(), ".env.local");
  const current = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  const lines = current.split("\n").filter(Boolean);
  const map = new Map(lines.map((line) => line.split("=")).map(([k, ...v]) => [k, v.join("=")]));

  for (const [key, value] of Object.entries(updates)) {
    map.set(key, value);
  }

  writeFileSync(
    envPath,
    `${Array.from(map.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join("\n")}\n`,
  );
}

async function main() {
  const privateKey = loadPrivateKey();
  if (!privateKey) {
    console.error(
      "Missing CHAMASCORE_PRIVATE_KEY. Add it to .env.local or the environment, then rerun:\n  npm run complete:circle3",
    );
    process.exitCode = 1;
    return;
  }

  const account = privateKeyToAccount(
    privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`,
  );
  const transport = http(process.env.CELO_SEPOLIA_RPC_URL || undefined);
  const publicClient = createPublicClient({ chain: celoSepolia, transport });
  const walletClient = createWalletClient({
    account,
    chain: celoSepolia,
    transport,
  });

  const erc20Abi = parseAbi([
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
  ]);
  const circleAbi = parseAbi([
    "function contribute(uint256 circleId)",
    "function recordRiskFlag(uint256 circleId, address member, string reason, uint8 severity)",
    "function hasContributed(uint256 circleId, uint256 round, address member) view returns (bool)",
  ]);

  const allowance = await publicClient.readContract({
    address: USDC,
    abi: erc20Abi,
    functionName: "allowance",
    args: [account.address, CONTRACT],
  });

  const alreadyContributed = await publicClient.readContract({
    address: CONTRACT,
    abi: circleAbi,
    functionName: "hasContributed",
    args: [CIRCLE_ID, 0n, account.address],
  });

  const result = {
    circleId: Number(CIRCLE_ID),
    wallet: account.address,
    approvalTx: null,
    contributionTx: null,
    riskFlagTx: null,
  };

  if (allowance < CONTRIBUTION) {
    const approvalHash = await walletClient.writeContract({
      address: USDC,
      abi: erc20Abi,
      functionName: "approve",
      args: [CONTRACT, CONTRIBUTION],
    });
    await publicClient.waitForTransactionReceipt({ hash: approvalHash });
    result.approvalTx = approvalHash;
    console.log("approval:", approvalHash);
  } else {
    console.log("approval already sufficient");
  }

  if (!alreadyContributed) {
    const contributionHash = await walletClient.writeContract({
      address: CONTRACT,
      abi: circleAbi,
      functionName: "contribute",
      args: [CIRCLE_ID],
    });
    await publicClient.waitForTransactionReceipt({ hash: contributionHash });
    result.contributionTx = contributionHash;
    console.log("contribution:", contributionHash);
  } else {
    console.log("contribution already recorded");
  }

  const riskFlagHash = await walletClient.writeContract({
    address: CONTRACT,
    abi: circleAbi,
    functionName: "recordRiskFlag",
    args: [CIRCLE_ID, RISK_TARGET, "ChamaScore late-payment review: Amina", 2],
  });
  await publicClient.waitForTransactionReceipt({ hash: riskFlagHash });
  result.riskFlagTx = riskFlagHash;
  console.log("risk flag:", riskFlagHash);

  const balance = await publicClient.readContract({
    address: USDC,
    abi: parseAbi(["function balanceOf(address) view returns (uint256)"]),
    functionName: "balanceOf",
    args: [account.address],
  });

  updateEnvLocal({
    NEXT_PUBLIC_CHAMASCORE_CIRCLE_ID: String(CIRCLE_ID),
    NEXT_PUBLIC_AGENT_METADATA_URL: "https://chamascore-agent.vercel.app/agent.json",
    ...(result.approvalTx
      ? { NEXT_PUBLIC_PROOF_APPROVAL_TX: result.approvalTx }
      : {}),
    ...(result.contributionTx
      ? { NEXT_PUBLIC_PROOF_CONTRIBUTION_TX: result.contributionTx }
      : {}),
    NEXT_PUBLIC_PROOF_RISK_FLAG_TX: result.riskFlagTx,
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        ...result,
        usdcBalance: `${formatUnits(balance, 6)} USDC`,
        note: "Updated .env.local proof tx hashes. Redeploy Vercel with the same NEXT_PUBLIC_* values.",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
