import { NextResponse } from "next/server";
import {
  demoCircleId,
  demoContractAddress,
  demoProofTransactions,
  demoUsdcAddress,
  getDemoProofLinks,
} from "@/lib/demo-proof";

export async function GET() {
  const proofLinks = getDemoProofLinks();

  return NextResponse.json({
    name: "ChamaScore Agent",
    description:
      "A Celo onchain agent that scores savings-circle contribution reliability, flags risk, prepares payout actions, and publishes portable reputation for chamas and stokvels.",
    category: "real-world-payments",
    chain: "celo",
    networks: ["celo-sepolia"],
    plannedNetworks: ["celo-mainnet"],
    capabilities: [
      "stablecoin contribution monitoring",
      "member reliability scoring",
      "late-payer detection",
      "payout readiness reports",
      "onchain risk flag recording",
      "encoded transaction action planning",
      "live Celo Sepolia proof reads",
      "ERC-8004 feedback preparation",
      "MiniPay-compatible payment actions",
    ],
    endpoints: {
      report: "/api/agent/report",
      onchainProof: "/api/agent/onchain-proof",
      actions: "/api/agent/actions",
    },
    deployment: {
      network: "celo-sepolia",
      contractAddress: demoContractAddress,
      activeCircleId: demoCircleId,
      token: {
        symbol: "USDC",
        address: demoUsdcAddress,
        contributionAmount: "0.5",
      },
      proof: {
        circleCreated: demoProofTransactions.circleCreated,
        approval: demoProofTransactions.approval,
        contribution: demoProofTransactions.contribution,
        riskFlag: demoProofTransactions.riskFlag,
        blockscout: proofLinks,
      },
    },
    submission: {
      hackathon: "celo-onchain-agents",
      tracks: ["best-agent"],
    },
  });
}
