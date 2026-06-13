export const AGENT_NAME = "ChamaScore Agent";

export const AGENT_DESCRIPTION =
  "A Celo onchain agent that scores savings-circle contribution reliability, flags risk, executes rotating payouts, and publishes portable ERC-8004 reputation for chamas, stokvels, and susus.";

export const AGENT_VERSION = "1.0.0";

export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://chamascore-agent.vercel.app";

export const AGENT_WALLET =
  process.env.NEXT_PUBLIC_AGENT_WALLET ??
  "0xE6df1c1EcC9cEe37B09172366B92a7eDc026b603";

export const CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID ?? "11142220",
);

// Celo mainnet chain id is 42220; Celo Sepolia is 11142220.
export const IS_MAINNET = CHAIN_ID === 42220;

// Single source of truth for the human-readable network label and explorer
// base used across agent.json, the REST/MCP endpoints, and the dashboard proof
// links. Flipping NEXT_PUBLIC_CHAIN_ID=42220 switches every surface to mainnet.
export const NETWORK_LABEL = IS_MAINNET ? "celo" : "celo-sepolia";
export const BLOCKSCOUT_BASE = IS_MAINNET
  ? "https://celo.blockscout.com"
  : "https://celo-sepolia.blockscout.com";

export const CHAIN_CAIP2 = `eip155:${CHAIN_ID}`;

export const ERC8004_IDENTITY_REGISTRY =
  process.env.NEXT_PUBLIC_ERC8004_IDENTITY_REGISTRY ??
  "0x8004A818BFB912233c491871b3d84c89A494BD9e";

export const ERC8004_REPUTATION_REGISTRY =
  process.env.NEXT_PUBLIC_ERC8004_REPUTATION_REGISTRY ??
  "0x8004B663056A597Dffe9eCcC1965A193B7388713";

export const ERC8004_AGENT_ID = Number(
  process.env.NEXT_PUBLIC_ERC8004_AGENT_ID ?? "338",
);

export const A2A_CARD_URL = `${BASE_URL}/.well-known/agent-card.json`;
export const A2A_ENDPOINT = `${BASE_URL}/api/a2a`;
export const MCP_DESCRIPTOR_URL = `${BASE_URL}/.well-known/mcp.json`;
export const MCP_ENDPOINT = `${BASE_URL}/api/mcp`;
export const REGISTRATION_URL = `${BASE_URL}/agent.json`;

export const AGENT_SKILLS = [
  {
    id: "score-circle",
    name: "Score a savings circle",
    description:
      "Reads live circle state from the ChamaScoreCircle contract on Celo, scores each member's contribution reliability (0-100), and reports payout readiness.",
    tags: ["payments", "reputation", "savings", "celo", "stablecoins"],
  },
  {
    id: "flag-risk",
    name: "Flag late or risky members",
    description:
      "Detects members who have not contributed in the current round and records an onchain risk flag event so future circles can inspect reliability history.",
    tags: ["risk", "trust", "onchain"],
  },
  {
    id: "execute-payout",
    name: "Execute rotating payout",
    description:
      "When a round is fully funded, executes the rotating stablecoin payout to the next recipient in the circle.",
    tags: ["payments", "automation", "stablecoins"],
  },
  {
    id: "publish-reputation",
    name: "Publish portable reputation",
    description:
      "Prepares ERC-8004 Reputation Registry feedback so circle members can rate the agent and reliability evidence becomes portable across the Celo ecosystem.",
    tags: ["erc-8004", "reputation", "identity"],
  },
] as const;
