import { NextResponse } from "next/server";
import { AGENT_NAME, AGENT_VERSION } from "@/lib/agent-metadata";
import { demoCircleId } from "@/lib/demo-proof";
import { readLiveCircleReport, summarizeReport } from "@/lib/live-circle";

export const dynamic = "force-dynamic";

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: number | string | null;
  method?: string;
  params?: {
    message?: {
      messageId?: string;
      parts?: Array<{ kind?: string; text?: string; data?: unknown }>;
    };
  };
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

function extractCircleId(text: string): number | undefined {
  const match = text.match(/circle\s*#?\s*(\d+)/i);
  return match ? Number(match[1]) : undefined;
}

export async function POST(request: Request) {
  let body: JsonRpcRequest;
  try {
    body = (await request.json()) as JsonRpcRequest;
  } catch {
    return rpcError(null, -32700, "Parse error");
  }

  const { id, method, params } = body;

  if (method !== "message/send") {
    return rpcError(
      id,
      -32601,
      `Method not supported: ${method}. This agent supports message/send.`,
    );
  }

  const text =
    params?.message?.parts
      ?.filter((part) => part.kind === "text" && typeof part.text === "string")
      .map((part) => part.text)
      .join("\n") ?? "";

  try {
    const circleId = extractCircleId(text) ?? demoCircleId;
    const report = await readLiveCircleReport(circleId);

    return rpcResult(id, {
      kind: "message",
      role: "agent",
      messageId: crypto.randomUUID(),
      contextId: crypto.randomUUID(),
      parts: [
        { kind: "text", text: summarizeReport(report) },
        { kind: "data", data: { report } },
      ],
      metadata: { agent: AGENT_NAME, version: AGENT_VERSION },
    });
  } catch (error) {
    return rpcError(
      id,
      -32000,
      error instanceof Error ? error.message : "Live circle read failed",
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      protocol: "a2a",
      agent: AGENT_NAME,
      version: AGENT_VERSION,
      hint: "POST A2A JSON-RPC message/send to this endpoint. Agent card at /.well-known/agent-card.json",
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
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
