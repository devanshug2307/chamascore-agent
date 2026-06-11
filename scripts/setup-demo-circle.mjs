// Creates a fully-functional demo circle with real member wallets:
//   1. generates (or reloads) member wallets -> demo-members.local.json
//   2. funds them with gas + test USDC from the demo wallet
//   3. creates a new circle (demo wallet = organizer/agent operator)
//   4. every member approves + contributes for the current round
// Run again with CONTRIBUTE_ONLY=1 to fund the next round of an existing circle.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  createPublicClient,
  createWalletClient,
  erc20Abi,
  http,
  parseAbi,
  parseEther,
  parseUnits,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  CHAIN,
  IS_MAINNET,
  RPC_URL,
  TX_OPTS,
  USDC,
  contractAddress,
} from "./lib/network.mjs";

const CONTRACT = contractAddress();
const METADATA_URI =
  process.env.NEXT_PUBLIC_AGENT_METADATA_URL ??
  "https://chamascore-agent.vercel.app/agent.json";
const CONTRIBUTION = parseUnits(process.env.CONTRIBUTION_USDC ?? "0.5", 6);
const MEMBER_GAS = parseEther("0.08");
const MEMBER_USDC = parseUnits(
  process.env.MEMBER_USDC_AMOUNT ?? (IS_MAINNET ? "2" : "3"),
  6,
);
const MEMBERS_FILE = resolve(process.cwd(), "demo-members.local.json");
const CONTRIBUTE_ONLY = process.env.CONTRIBUTE_ONLY === "1";
const SKIP_MEMBERS = new Set(
  (process.env.SKIP_MEMBERS ?? "").split(",").map((name) => name.trim()).filter(Boolean),
);
const CIRCLE_ID = process.env.DEMO_CIRCLE_ID
  ? BigInt(process.env.DEMO_CIRCLE_ID)
  : undefined;

const circleAbi = parseAbi([
  "function createCircle(address token, uint256 contributionAmount, address[] members, string metadataURI) returns (uint256)",
  "function contribute(uint256 circleId)",
  "function nextCircleId() view returns (uint256)",
  "function hasContributed(uint256 circleId, uint256 round, address member) view returns (bool)",
  "function getCircle(uint256 circleId) view returns (address organizer, address token, uint256 contributionAmount, uint256 currentRound, bool active, string metadataURI)",
]);

function loadPrivateKey() {
  if (process.env.CHAMASCORE_PRIVATE_KEY) return process.env.CHAMASCORE_PRIVATE_KEY;
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return undefined;
  const match = readFileSync(envPath, "utf8").match(/^CHAMASCORE_PRIVATE_KEY=(.+)$/m);
  return match?.[1]?.trim();
}

function loadOrCreateMembers() {
  if (existsSync(MEMBERS_FILE)) {
    return JSON.parse(readFileSync(MEMBERS_FILE, "utf8"));
  }
  const members = [1, 2].map((index) => {
    const privateKey = generatePrivateKey();
    return {
      name: `member-${index}`,
      privateKey,
      address: privateKeyToAccount(privateKey).address,
    };
  });
  writeFileSync(MEMBERS_FILE, `${JSON.stringify(members, null, 2)}\n`);
  console.log(`[setup] generated member wallets -> ${MEMBERS_FILE} (gitignored)`);
  return members;
}

async function main() {
  const privateKey = loadPrivateKey();
  if (!privateKey) {
    console.error("Missing CHAMASCORE_PRIVATE_KEY (env or .env.local).");
    process.exitCode = 1;
    return;
  }

  const organizer = privateKeyToAccount(
    privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`,
  );
  const transport = http(RPC_URL);
  const publicClient = createPublicClient({ chain: CHAIN, transport });
  const organizerClient = createWalletClient({
    account: organizer,
    chain: CHAIN,
    transport,
  });

  const members = loadOrCreateMembers();
  const memberAccounts = members.map((member) =>
    privateKeyToAccount(member.privateKey),
  );
  const allMemberAddresses = [
    organizer.address,
    ...memberAccounts.map((account) => account.address),
  ];

  const txs = [];
  const send = async (label, fn) => {
    const hash = await fn();
    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`[setup] ${label}: ${hash}`);
    txs.push({ label, tx: hash });
    return hash;
  };

  // 1. Fund member wallets if needed.
  // On mainnet members pay gas in USDC (fee abstraction) — no native CELO needed.
  for (const account of memberAccounts) {
    const [gas, usdc] = await Promise.all([
      publicClient.getBalance({ address: account.address }),
      publicClient.readContract({
        address: USDC,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [account.address],
      }),
    ]);
    if (!IS_MAINNET && gas < parseEther("0.02")) {
      await send(`fund gas -> ${account.address}`, () =>
        organizerClient.sendTransaction({
          to: account.address,
          value: MEMBER_GAS,
        }),
      );
    }
    if (usdc < CONTRIBUTION) {
      await send(`fund USDC -> ${account.address}`, () =>
        organizerClient.writeContract({
          address: USDC,
          abi: erc20Abi,
          functionName: "transfer",
          args: [account.address, MEMBER_USDC],
          ...TX_OPTS,
        }),
      );
    }
  }

  // 2. Create circle (or reuse)
  let circleId = CIRCLE_ID;
  if (!CONTRIBUTE_ONLY && circleId === undefined) {
    const before = await publicClient.readContract({
      address: CONTRACT,
      abi: circleAbi,
      functionName: "nextCircleId",
    });
    await send(`create circle ${before}`, () =>
      organizerClient.writeContract({
        address: CONTRACT,
        abi: circleAbi,
        functionName: "createCircle",
        args: [USDC, CONTRIBUTION, allMemberAddresses, METADATA_URI],
        ...TX_OPTS,
      }),
    );
    circleId = before;
  }
  if (circleId === undefined) {
    console.error("Set DEMO_CIRCLE_ID when using CONTRIBUTE_ONLY=1");
    process.exitCode = 1;
    return;
  }

  const [, , , currentRound] = await publicClient.readContract({
    address: CONTRACT,
    abi: circleAbi,
    functionName: "getCircle",
    args: [circleId],
  });

  // 3. Every member approves + contributes for the current round
  const contributors = [
    { name: "organizer", account: organizer, client: organizerClient },
    ...members.map((member, index) => ({
      name: member.name,
      account: memberAccounts[index],
      client: createWalletClient({
        account: memberAccounts[index],
        chain: CHAIN,
        transport,
      }),
    })),
  ];

  for (const contributor of contributors) {
    if (SKIP_MEMBERS.has(contributor.name)) {
      console.log(`[setup] skipping ${contributor.name} (SKIP_MEMBERS)`);
      continue;
    }
    const already = await publicClient.readContract({
      address: CONTRACT,
      abi: circleAbi,
      functionName: "hasContributed",
      args: [circleId, currentRound, contributor.account.address],
    });
    if (already) {
      console.log(`[setup] ${contributor.name} already contributed round ${currentRound}`);
      continue;
    }
    await send(`${contributor.name} approve USDC`, () =>
      contributor.client.writeContract({
        address: USDC,
        abi: erc20Abi,
        functionName: "approve",
        args: [CONTRACT, CONTRIBUTION],
        ...TX_OPTS,
      }),
    );
    await send(`${contributor.name} contribute circle ${circleId}`, () =>
      contributor.client.writeContract({
        address: CONTRACT,
        abi: circleAbi,
        functionName: "contribute",
        args: [circleId],
        ...TX_OPTS,
      }),
    );
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        circleId: Number(circleId),
        round: Number(currentRound),
        members: allMemberAddresses,
        metadataURI: METADATA_URI,
        transactions: txs,
        next: "Run `npm run agent:run` — the agent will detect the funded round and execute the payout autonomously.",
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
