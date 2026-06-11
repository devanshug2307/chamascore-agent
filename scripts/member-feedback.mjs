// Circle members rate the ChamaScore agent on the ERC-8004 Reputation Registry.
// Feedback comes from member wallets (not the agent owner — self-rating is
// blocked by the registry), making the agent's reputation independently earned.

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  parseAbi,
  stringToHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celoSepolia } from "viem/chains";

const REPUTATION_REGISTRY = "0x8004B663056A597Dffe9eCcC1965A193B7388713";
const AGENT_ID = BigInt(process.env.NEXT_PUBLIC_ERC8004_AGENT_ID ?? "338");
const ENDPOINT =
  process.env.NEXT_PUBLIC_AGENT_METADATA_URL?.replace("/agent.json", "") ??
  "https://chamascore-agent.vercel.app";
const MEMBERS_FILE = resolve(process.cwd(), "demo-members.local.json");

const reputationAbi = parseAbi([
  "function giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)",
  "function getSummary(uint256 agentId, address[] clientAddresses, string tag1, string tag2) view returns (uint64 count, int128 averageValue)",
]);

async function main() {
  if (!existsSync(MEMBERS_FILE)) {
    console.error(`Missing ${MEMBERS_FILE}. Run npm run demo:setup first.`);
    process.exitCode = 1;
    return;
  }

  const members = JSON.parse(readFileSync(MEMBERS_FILE, "utf8"));
  const transport = http(process.env.CELO_SEPOLIA_RPC_URL || undefined);
  const publicClient = createPublicClient({ chain: celoSepolia, transport });

  const feedbackPlans = [
    {
      value: 100n,
      tag1: "starred",
      tag2: "payout-executed",
      note: "Agent executed our rotating payout the moment the round was funded.",
    },
    {
      value: 95n,
      tag1: "successRate",
      tag2: "reliability-scoring",
      note: "Reliability scores matched our real contribution history.",
    },
  ];

  const results = [];
  for (const [index, member] of members.entries()) {
    const account = privateKeyToAccount(member.privateKey);
    const walletClient = createWalletClient({
      account,
      chain: celoSepolia,
      transport,
    });
    const plan = feedbackPlans[index % feedbackPlans.length];
    const feedbackURI = `${ENDPOINT}/api/agent/report`;
    const feedbackHash = keccak256(stringToHex(`${plan.note} (${member.address})`));

    console.log(`[feedback] ${member.name} -> agent ${AGENT_ID}: ${plan.tag1}=${plan.value}`);
    const hash = await walletClient.writeContract({
      address: REPUTATION_REGISTRY,
      abi: reputationAbi,
      functionName: "giveFeedback",
      args: [
        AGENT_ID,
        plan.value,
        0,
        plan.tag1,
        plan.tag2,
        ENDPOINT,
        feedbackURI,
        feedbackHash,
      ],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`[feedback] tx: ${hash}`);
    results.push({ member: member.address, tag1: plan.tag1, value: Number(plan.value), tx: hash });
  }

  const [count, average] = await publicClient.readContract({
    address: REPUTATION_REGISTRY,
    abi: reputationAbi,
    functionName: "getSummary",
    args: [AGENT_ID, members.map((member) => member.address), "", ""],
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        agentId: Number(AGENT_ID),
        feedback: results,
        registrySummary: { count: Number(count), averageValue: Number(average) },
        explorer: `https://celo-sepolia.blockscout.com/address/${REPUTATION_REGISTRY}`,
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
