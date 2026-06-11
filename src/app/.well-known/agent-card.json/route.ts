import { NextResponse } from "next/server";
import {
  A2A_ENDPOINT,
  AGENT_DESCRIPTION,
  AGENT_NAME,
  AGENT_SKILLS,
  AGENT_VERSION,
  AGENT_WALLET,
  BASE_URL,
  CHAIN_CAIP2,
  ERC8004_AGENT_ID,
  ERC8004_IDENTITY_REGISTRY,
} from "@/lib/agent-metadata";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      protocolVersion: "0.3.0",
      name: AGENT_NAME,
      description: AGENT_DESCRIPTION,
      url: A2A_ENDPOINT,
      preferredTransport: "JSONRPC",
      version: AGENT_VERSION,
      provider: {
        organization: "ChamaScore",
        url: BASE_URL,
      },
      iconUrl: `${BASE_URL}/chamascore-icon.svg`,
      documentationUrl: `${BASE_URL}`,
      capabilities: {
        streaming: false,
        pushNotifications: false,
        stateTransitionHistory: false,
      },
      defaultInputModes: ["text/plain", "application/json"],
      defaultOutputModes: ["application/json", "text/plain"],
      skills: AGENT_SKILLS.map((skill) => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        tags: [...skill.tags],
        examples: [
          skill.id === "score-circle"
            ? "Score circle 3 and tell me if it is ready for payout."
            : skill.id === "flag-risk"
              ? "Which members of circle 3 are late this round?"
              : skill.id === "execute-payout"
                ? "Is the current round funded enough to execute the payout?"
                : "How do members publish feedback about this agent?",
        ],
      })),
      registrations: [
        {
          agentId: ERC8004_AGENT_ID,
          agentRegistry: `${CHAIN_CAIP2}:${ERC8004_IDENTITY_REGISTRY}`,
          agentAddress: `${CHAIN_CAIP2}:${AGENT_WALLET}`,
        },
      ],
      trustModels: ["reputation"],
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
      },
    },
  );
}
