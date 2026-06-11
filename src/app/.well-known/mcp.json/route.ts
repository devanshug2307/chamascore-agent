import { NextResponse } from "next/server";
import {
  AGENT_DESCRIPTION,
  AGENT_NAME,
  AGENT_VERSION,
  BASE_URL,
  MCP_ENDPOINT,
} from "@/lib/agent-metadata";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      name: AGENT_NAME,
      description: AGENT_DESCRIPTION,
      version: AGENT_VERSION,
      protocol: "mcp",
      protocolVersion: "2025-06-18",
      transport: "streamable-http",
      endpoint: MCP_ENDPOINT,
      url: MCP_ENDPOINT,
      homepage: BASE_URL,
      capabilities: {
        tools: true,
        resources: false,
        prompts: false,
      },
      tools: [
        {
          name: "get_circle_report",
          description:
            "Live-read a ChamaScore savings circle from the Celo blockchain and return member reliability scores, funding status, and payout readiness.",
        },
        {
          name: "get_onchain_proof",
          description:
            "Return verifiable onchain proof links (contract, transactions, explorer URLs) for the active demo circle.",
        },
        {
          name: "get_agent_info",
          description:
            "Return the agent's ERC-8004 identity, registration metadata, endpoints, and capabilities.",
        },
      ],
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
      },
    },
  );
}
