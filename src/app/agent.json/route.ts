import { NextResponse } from "next/server";
import {
  A2A_CARD_URL,
  AGENT_DESCRIPTION,
  AGENT_NAME,
  AGENT_SKILLS,
  AGENT_VERSION,
  AGENT_WALLET,
  BASE_URL,
  CHAIN_CAIP2,
  CHAIN_ID,
  ERC8004_AGENT_ID,
  ERC8004_IDENTITY_REGISTRY,
  ERC8004_REPUTATION_REGISTRY,
  MCP_ENDPOINT,
} from "@/lib/agent-metadata";
import {
  demoCircleId,
  demoContractAddress,
  demoProofTransactions,
  demoUsdcAddress,
  getDemoProofLinks,
} from "@/lib/demo-proof";

export const dynamic = "force-dynamic";

export async function GET() {
  const proofLinks = getDemoProofLinks();

  return NextResponse.json(
    {
      // ERC-8004 registration-v1
      type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
      name: AGENT_NAME,
      description: AGENT_DESCRIPTION,
      version: AGENT_VERSION,
      image: `${BASE_URL}/chamascore-icon.svg`,
      url: BASE_URL,
      owner: AGENT_WALLET,
      active: true,
      endpoints: [
        {
          name: "A2A",
          type: "a2a",
          endpoint: A2A_CARD_URL,
          url: A2A_CARD_URL,
          version: "0.3.0",
        },
        {
          name: "MCP",
          type: "mcp",
          endpoint: MCP_ENDPOINT,
          url: MCP_ENDPOINT,
          version: "2025-06-18",
        },
        {
          name: "agentWallet",
          type: "wallet",
          endpoint: `${CHAIN_CAIP2}:${AGENT_WALLET}`,
          address: AGENT_WALLET,
          chainId: CHAIN_ID,
        },
      ],
      registrations: [
        {
          agentId: ERC8004_AGENT_ID,
          agentRegistry: `${CHAIN_CAIP2}:${ERC8004_IDENTITY_REGISTRY}`,
          agentAddress: `${CHAIN_CAIP2}:${AGENT_WALLET}`,
        },
      ],
      trustModels: ["reputation"],
      supportedTrust: ["reputation"],
      selfVerification: {
        provider: "self.xyz",
        selfAgentId: 74,
        agentAddress: "0x8a87EEa23aDE3B6A1894844861dc6e30D035FAcC",
        linkedHumanAddress: AGENT_WALLET,
        network: "testnet",
        status: "completed",
      },
      reputationRegistry: `${CHAIN_CAIP2}:${ERC8004_REPUTATION_REGISTRY}`,
      skills: AGENT_SKILLS.map((skill) => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        tags: [...skill.tags],
      })),

      // ChamaScore-specific metadata (kept for judges and existing integrations)
      category: "real-world-payments",
      chain: "celo",
      networks: ["celo-sepolia"],
      plannedNetworks: ["celo-mainnet"],
      capabilities: [
        "stablecoin contribution monitoring",
        "member reliability scoring",
        "late-payer detection",
        "autonomous rotating payout execution",
        "onchain risk flag recording",
        "live Celo proof reads",
        "ERC-8004 reputation publishing",
        "A2A message/send agent queries",
        "MCP tool access for any LLM",
        "MiniPay-compatible payment actions",
      ],
      legacyEndpoints: {
        report: "/api/agent/report",
        onchainProof: "/api/agent/onchain-proof",
        actions: "/api/agent/actions",
        a2a: "/api/a2a",
        mcp: "/api/mcp",
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
          payout: demoProofTransactions.payout,
          blockscout: proofLinks,
        },
      },
      submission: {
        hackathon: "celo-onchain-agents",
        tracks: ["best-agent", "most-activity"],
      },
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
      },
    },
  );
}
