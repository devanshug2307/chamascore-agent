import { NextResponse } from "next/server";
import { runChamaScoreAgent, sampleCircle, type CircleConfig } from "@/lib/chamascore";

const contractAddress = "0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5";
const circleId = 2;
const proofLinks = {
  contract: `https://celo-sepolia.blockscout.com/address/${contractAddress}`,
  circleCreated:
    "https://celo-sepolia.blockscout.com/tx/0xb662ae355bb0d7f23da82b8014adcb90726ea9803c58603d77af0c4aa9c72276",
  approval:
    "https://celo-sepolia.blockscout.com/tx/0x4993feda85b6668fcaff9a297d96692a14cbe121f8415905efba401d15ad8067",
  contribution:
    "https://celo-sepolia.blockscout.com/tx/0xbbc9525edb99a84c8aab79bbcb19e637d747df703757913e0f90c937baa2f258",
};

function buildAgentPayload(config: CircleConfig, source: string) {
  const report = runChamaScoreAgent(config);
  const riskFlags = report.memberScores
    .filter((member) => member.status === "late" || member.reliability === "risk")
    .map((member) => ({
      member: member.name,
      wallet: member.wallet,
      score: member.score,
      reason:
        member.status === "late"
          ? "Late contribution in the current round"
          : "Reliability score below risk threshold",
      recommendedSeverity: member.reliability === "risk" ? 3 : 2,
    }));

  return {
    generatedAt: new Date().toISOString(),
    source,
    network: "celo-sepolia",
    contractAddress,
    circleId,
    report,
    payoutDecision: report.readyForPayout
      ? {
          decision: "prepare-payout",
          reason: "All expected contributions are collected.",
        }
      : {
          decision: "hold-payout",
          reason: "The round is not fully funded yet.",
        },
    riskFlags,
    recommendedTransactions: [
      {
        label: "Approve USDC",
        contract: "USDC",
        purpose: "Allow ChamaScoreCircle to pull the fixed contribution amount.",
      },
      {
        label: "Contribute",
        contract: "ChamaScoreCircle",
        functionName: "contribute",
        args: [circleId],
        purpose: "Record a member contribution for the active round.",
      },
      ...riskFlags.map((flag) => ({
        label: `Record risk flag for ${flag.member}`,
        contract: "ChamaScoreCircle",
        functionName: "recordRiskFlag",
        args: [circleId, flag.wallet, flag.reason, flag.recommendedSeverity],
        purpose: "Turn the agent's risk finding into onchain reputation evidence.",
      })),
    ],
    scorePolicy: {
      base: "paid rounds divided by total observed rounds",
      penalties: {
        lateRound: 8,
        missedRound: 22,
        currentLate: 12,
        currentPending: 4,
      },
      reliabilityBands: {
        excellent: "88-100",
        steady: "72-87",
        watch: "52-71",
        risk: "0-51",
      },
    },
    proofLinks,
  };
}

export async function GET() {
  return NextResponse.json(buildAgentPayload(sampleCircle, "celo-sepolia-demo-circle"));
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<CircleConfig>;
  const config: CircleConfig = {
    ...sampleCircle,
    ...body,
    members: body.members?.length ? body.members : sampleCircle.members,
  };

  return NextResponse.json(buildAgentPayload(config, "submitted-circle"));
}
