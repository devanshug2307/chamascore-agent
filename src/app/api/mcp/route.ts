import { NextResponse } from "next/server";
import {
  A2A_CARD_URL,
  AGENT_DESCRIPTION,
  AGENT_NAME,
  AGENT_SKILLS,
  AGENT_VERSION,
  AGENT_WALLET,
  CHAIN_CAIP2,
  ERC8004_AGENT_ID,
  ERC8004_IDENTITY_REGISTRY,
  ERC8004_REPUTATION_REGISTRY,
  MCP_ENDPOINT,
  REGISTRATION_URL,
} from "@/lib/agent-metadata";
import { demoCircleId } from "@/lib/demo-proof";
import { readLiveCircleReport, summarizeReport } from "@/lib/live-circle";

export const dynamic = "force-dynamic";

const PROTOCOL_VERSION = "2025-06-18";

const TOOLS = [
  {
    name: "get_circle_report",
    description:
      "Live-read a ChamaScore savings circle from the Celo blockchain and return member reliability scores, funding status, and payout readiness.",
    inputSchema: {
      type: "object",
      properties: {
        circleId: {
          type: "number",
          description: `Circle ID to score. Defaults to the active demo circle (${demoCircleId}).`,
        },
      },
    },
  },
  {
    name: "get_onchain_proof",
    description:
      "Return verifiable onchain proof (live contract state and explorer links) for the active demo circle.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_agent_info",
    description:
      "Return the agent's ERC-8004 identity, registration metadata, endpoints, and capabilities.",
    inputSchema: { type: "object", properties: {} },
  },
] as const;

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: number | string | null;
  method?: string;
  params?: Record<string, unknown>;
};

function rpcResult(id: number | string | null | undefined, result: unknown) {
  return NextResponse.json(
    { jsonrpc: "2.0", id: id ?? null, result },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
}

function rpcError(
  id: number | string | null | undefined,
  code: number,
  message: string,
) {
  return NextResponse.json(
    { jsonrpc: "2.0", id: id ?? null, error: { code, message } },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
}

function agentInfo() {
  return {
    name: AGENT_NAME,
    description: AGENT_DESCRIPTION,
    version: AGENT_VERSION,
    erc8004: {
      agentId: ERC8004_AGENT_ID,
      identityRegistry: `${CHAIN_CAIP2}:${ERC8004_IDENTITY_REGISTRY}`,
      reputationRegistry: `${CHAIN_CAIP2}:${ERC8004_REPUTATION_REGISTRY}`,
      agentWallet: `${CHAIN_CAIP2}:${AGENT_WALLET}`,
      registrationURI: REGISTRATION_URL,
    },
    endpoints: {
      a2aCard: A2A_CARD_URL,
      mcp: MCP_ENDPOINT,
      registration: REGISTRATION_URL,
    },
    skills: AGENT_SKILLS,
  };
}

async function callTool(name: string, args: Record<string, unknown>) {
  if (name === "get_circle_report") {
    const circleId =
      typeof args.circleId === "number" ? args.circleId : undefined;
    const report = await readLiveCircleReport(circleId);
    return {
      content: [
        { type: "text", text: summarizeReport(report) },
        { type: "text", text: JSON.stringify(report, null, 2) },
      ],
      isError: false,
    };
  }

  if (name === "get_onchain_proof") {
    const report = await readLiveCircleReport();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              network: report.network,
              contract: report.contract,
              circleId: report.circleId,
              currentRound: report.currentRound,
              collectedThisRound: report.collectedThisRound,
              explorer:
                report.network === "celo"
                  ? `https://celo.blockscout.com/address/${report.contract}`
                  : `https://celo-sepolia.blockscout.com/address/${report.contract}`,
            },
            null,
            2,
          ),
        },
      ],
      isError: false,
    };
  }

  if (name === "get_agent_info") {
    return {
      content: [{ type: "text", text: JSON.stringify(agentInfo(), null, 2) }],
      isError: false,
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}

export async function POST(request: Request) {
  let body: JsonRpcRequest;
  try {
    body = (await request.json()) as JsonRpcRequest;
  } catch {
    return rpcError(null, -32700, "Parse error");
  }

  const { id, method, params } = body;

  if (!method) {
    return rpcError(id, -32600, "Invalid request: missing method");
  }

  if (method === "initialize") {
    return rpcResult(id, {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: AGENT_NAME, version: AGENT_VERSION },
      instructions:
        "ChamaScore scores savings-circle reliability on Celo. Use get_circle_report for live member scores, get_onchain_proof for verifiable transactions, get_agent_info for ERC-8004 identity.",
    });
  }

  if (method === "notifications/initialized" || method.startsWith("notifications/")) {
    return new NextResponse(null, {
      status: 202,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  if (method === "ping") {
    return rpcResult(id, {});
  }

  if (method === "tools/list") {
    return rpcResult(id, { tools: TOOLS });
  }

  if (method === "tools/call") {
    const name = typeof params?.name === "string" ? params.name : "";
    const args =
      params && typeof params.arguments === "object" && params.arguments !== null
        ? (params.arguments as Record<string, unknown>)
        : {};
    try {
      return rpcResult(id, await callTool(name, args));
    } catch (error) {
      return rpcResult(id, {
        content: [
          {
            type: "text",
            text: error instanceof Error ? error.message : "Tool call failed",
          },
        ],
        isError: true,
      });
    }
  }

  return rpcError(id, -32601, `Method not found: ${method}`);
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      protocol: "mcp",
      protocolVersion: PROTOCOL_VERSION,
      transport: "streamable-http",
      server: { name: AGENT_NAME, version: AGENT_VERSION },
      tools: TOOLS.map((tool) => tool.name),
      hint: "POST JSON-RPC 2.0 messages to this endpoint (initialize, tools/list, tools/call).",
    },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id, MCP-Protocol-Version",
    },
  });
}
