import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celoSepolia } from "viem/chains";

const IDENTITY_REGISTRY = "0x8004A818BFB912233c491871b3d84c89A494BD9e";
const AGENT_URI =
  process.env.NEXT_PUBLIC_AGENT_METADATA_URL ??
  "https://chamascore-agent.vercel.app/agent.json";

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
  const value = match?.[1]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function updateEnvLocal(updates) {
  const envPath = resolve(process.cwd(), ".env.local");
  const current = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  const lines = current.split("\n").filter(Boolean);
  const map = new Map(
    lines.map((line) => {
      const idx = line.indexOf("=");
      return idx === -1 ? [line, ""] : [line.slice(0, idx), line.slice(idx + 1)];
    }),
  );

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
      [
        "Missing CHAMASCORE_PRIVATE_KEY.",
        "Add your MetaMask demo wallet key to chamascore/.env.local:",
        "  CHAMASCORE_PRIVATE_KEY=0x...",
        "Then rerun: npm run register:erc8004",
      ].join("\n"),
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

  const registryAbi = parseAbi([
    "function register(string agentURI) external returns (uint256 agentId)",
    "function balanceOf(address owner) view returns (uint256)",
  ]);

  console.log("Registering ChamaScore on ERC-8004 Identity Registry...");
  console.log("Network: Celo Sepolia");
  console.log("Registry:", IDENTITY_REGISTRY);
  console.log("Agent URI:", AGENT_URI);

  const balanceBefore = await publicClient.readContract({
    address: IDENTITY_REGISTRY,
    abi: registryAbi,
    functionName: "balanceOf",
    args: [account.address],
  });

  const hash = await walletClient.writeContract({
    address: IDENTITY_REGISTRY,
    abi: registryAbi,
    functionName: "register",
    args: [AGENT_URI],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const balanceAfter = await publicClient.readContract({
    address: IDENTITY_REGISTRY,
    abi: registryAbi,
    functionName: "balanceOf",
    args: [account.address],
  });

  const transferLog = receipt.logs.find(
    (log) =>
      log.address.toLowerCase() === IDENTITY_REGISTRY.toLowerCase() &&
      log.topics[0] ===
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  );
  const agentId = transferLog?.topics[3]
    ? BigInt(transferLog.topics[3]).toString()
    : balanceAfter.toString();

  const blockscoutTx = `https://celo-sepolia.blockscout.com/tx/${hash}`;
  const blockscoutRegistry = `https://celo-sepolia.blockscout.com/address/${IDENTITY_REGISTRY}`;

  updateEnvLocal({
    NEXT_PUBLIC_ERC8004_AGENT_ID: agentId,
    NEXT_PUBLIC_ERC8004_REGISTRY_TX: hash,
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        wallet: account.address,
        agentId,
        agentURI: AGENT_URI,
        registrationTx: hash,
        blockscoutTx,
        blockscoutRegistry,
        tokensBefore: balanceBefore.toString(),
        tokensAfter: balanceAfter.toString(),
        nextSteps: [
          "Open https://8004scan.io and search for your wallet or agent ID.",
          "Copy the public 8004scan profile URL into SUBMISSION.md and your X post.",
          "Only add the 8004scan-rank track after the agent is visible on 8004scan.",
        ],
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
