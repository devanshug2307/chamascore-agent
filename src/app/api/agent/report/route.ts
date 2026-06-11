import { NextResponse } from "next/server";
import { runChamaScoreAgent, sampleCircle, type CircleConfig } from "@/lib/chamascore";

export async function GET() {
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    source: "sample-circle",
    report: runChamaScoreAgent(sampleCircle),
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<CircleConfig>;
  const config: CircleConfig = {
    ...sampleCircle,
    ...body,
    members: body.members?.length ? body.members : sampleCircle.members,
  };

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    source: "submitted-circle",
    report: runChamaScoreAgent(config),
  });
}
