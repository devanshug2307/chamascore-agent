import { NextResponse } from "next/server";
import { runChamaScoreAgent, sampleCircle, type CircleConfig } from "@/lib/chamascore";
import { demoCircleId, demoContractAddress, getDemoProofLinks } from "@/lib/demo-proof";

const contractAddress = demoContractAddress;
const circleId = demoCircleId;
const proofLinks = getDemoProofLinks();

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
