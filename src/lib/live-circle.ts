import {
  createPublicClient,
  formatUnits,
  getAddress,
  http,
  parseAbi,
  type Address,
} from "viem";
import { celo, celoSepolia } from "viem/chains";
import { CHAIN_ID } from "@/lib/agent-metadata";
import { demoCircleId, demoContractAddress } from "@/lib/demo-proof";
import { scoreMember, type MemberScore } from "@/lib/chamascore";

const circleAbi = parseAbi([
  "function getCircle(uint256 circleId) view returns (address organizer, address token, uint256 contributionAmount, uint256 currentRound, bool active, string metadataURI)",
  "function getMembers(uint256 circleId) view returns (address[] members)",
  "function hasContributed(uint256 circleId, uint256 round, address member) view returns (bool)",
  "function roundTotal(uint256 circleId, uint256 round) view returns (uint256)",
]);

export type LiveMemberScore = MemberScore & { address: Address };

export type LiveCircleReport = {
  network: string;
  contract: Address;
  circleId: number;
  organizer: Address;
  token: Address;
  contributionAmount: string;
  currentRound: number;
  active: boolean;
  metadataURI: string;
  collectedThisRound: string;
  expectedThisRound: string;
  readyForPayout: boolean;
  nextPayoutRecipient: Address;
  memberScores: LiveMemberScore[];
};

export function getChain() {
  return CHAIN_ID === celo.id ? celo : celoSepolia;
}

export function getPublicClient() {
  const chain = getChain();
  const rpcUrl =
    chain.id === celo.id
      ? process.env.CELO_RPC_URL
      : process.env.CELO_SEPOLIA_RPC_URL;
  return createPublicClient({ chain, transport: http(rpcUrl || undefined) });
}

export async function readLiveCircleReport(
  circleIdInput?: number,
): Promise<LiveCircleReport> {
  const client = getPublicClient();
  const contract = getAddress(demoContractAddress);
  const circleId = BigInt(circleIdInput ?? demoCircleId);

  const [organizer, token, contributionAmount, currentRound, active, metadataURI] =
    await client.readContract({
      address: contract,
      abi: circleAbi,
      functionName: "getCircle",
      args: [circleId],
    });

  const members = await client.readContract({
    address: contract,
    abi: circleAbi,
    functionName: "getMembers",
    args: [circleId],
  });

  const roundNumbers = Array.from(
    { length: Number(currentRound) + 1 },
    (_, round) => BigInt(round),
  );

  const contributionMatrix = await Promise.all(
    members.map((member) =>
      Promise.all(
        roundNumbers.map((round) =>
          client.readContract({
            address: contract,
            abi: circleAbi,
            functionName: "hasContributed",
            args: [circleId, round, member],
          }),
        ),
      ),
    ),
  );

  const roundTotal = await client.readContract({
    address: contract,
    abi: circleAbi,
    functionName: "roundTotal",
    args: [circleId, currentRound],
  });

  const memberScores: LiveMemberScore[] = members.map((member, index) => {
    const history = contributionMatrix[index];
    const pastRounds = history.slice(0, -1);
    const paidPastRounds = pastRounds.filter(Boolean).length;
    const missedPastRounds = pastRounds.length - paidPastRounds;
    const paidCurrentRound = history[history.length - 1];

    const scored = scoreMember({
      id: member.toLowerCase(),
      name: `${member.slice(0, 6)}...${member.slice(-4)}`,
      wallet: member,
      proof: "onchain-member",
      paidRounds: paidPastRounds + (paidCurrentRound ? 1 : 0),
      lateRounds: 0,
      missedRounds: missedPastRounds,
      status: paidCurrentRound ? "paid" : "pending",
    });

    return { ...scored, address: member };
  });

  const decimals = 6;
  const expected = contributionAmount * BigInt(members.length);
  const readyForPayout = roundTotal >= expected && active;
  const nextPayoutRecipient =
    members[Number(currentRound) % members.length];

  return {
    network: getChain().id === celo.id ? "celo" : "celo-sepolia",
    contract,
    circleId: Number(circleId),
    organizer,
    token,
    contributionAmount: formatUnits(contributionAmount, decimals),
    currentRound: Number(currentRound),
    active,
    metadataURI,
    collectedThisRound: formatUnits(roundTotal, decimals),
    expectedThisRound: formatUnits(expected, decimals),
    readyForPayout,
    nextPayoutRecipient,
    memberScores,
  };
}

export function summarizeReport(report: LiveCircleReport): string {
  const memberLines = report.memberScores
    .map(
      (member) =>
        `- ${member.name}: score ${member.score}/100 (${member.reliability}), ${
          member.status === "paid" ? "paid this round" : "pending this round"
        }`,
    )
    .join("\n");

  return [
    `ChamaScore live report for circle ${report.circleId} on ${report.network}.`,
    `Round ${report.currentRound}: ${report.collectedThisRound}/${report.expectedThisRound} USDC collected.`,
    report.readyForPayout
      ? `Round is fully funded — payout ready for ${report.nextPayoutRecipient}.`
      : `Round not yet funded — waiting on pending members.`,
    `Member reliability:`,
    memberLines,
    `Verified onchain at ${report.contract} (${report.network}).`,
  ].join("\n");
}
