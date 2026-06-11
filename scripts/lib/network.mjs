// Shared network config for ChamaScore scripts.
// CHAMASCORE_NETWORK=mainnet switches every script to Celo mainnet, where gas
// is paid in USDC via Celo fee abstraction (CIP-64 feeCurrency) so the agent
// treasury stays single-token.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { getAddress } from "viem";
import { celo, celoSepolia } from "viem/chains";

export const NETWORK =
  process.env.CHAMASCORE_NETWORK === "mainnet" ? "mainnet" : "sepolia";
export const IS_MAINNET = NETWORK === "mainnet";
export const CHAIN = IS_MAINNET ? celo : celoSepolia;
export const RPC_URL = IS_MAINNET
  ? process.env.CELO_RPC_URL || "https://forno.celo.org"
  : process.env.CELO_SEPOLIA_RPC_URL || undefined;
export const BLOCKSCOUT = IS_MAINNET
  ? "https://celo.blockscout.com"
  : "https://celo-sepolia.blockscout.com";

export const USDC = getAddress(
  process.env.NEXT_PUBLIC_CHAMASCORE_USDC ??
    (IS_MAINNET
      ? "0xcebA9300f2b948710d2653dD7B07f33A8B32118C"
      : "0x01C5C0122039549AD1493B8220cABEdD739BC44E"),
);

// 6-decimal tokens must use the FeeCurrencyAdapter as feeCurrency, not the token.
export const TX_OPTS = IS_MAINNET
  ? { feeCurrency: getAddress("0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B") }
  : {};

export const IDENTITY_REGISTRY = getAddress(
  process.env.NEXT_PUBLIC_ERC8004_IDENTITY_REGISTRY ??
    (IS_MAINNET
      ? "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"
      : "0x8004A818BFB912233c491871b3d84c89A494BD9e"),
);
export const REPUTATION_REGISTRY = getAddress(
  process.env.NEXT_PUBLIC_ERC8004_REPUTATION_REGISTRY ??
    (IS_MAINNET
      ? "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63"
      : "0x8004B663056A597Dffe9eCcC1965A193B7388713"),
);

const DEPLOYMENTS_FILE = resolve(process.cwd(), "deployments.json");

export function loadDeployments() {
  return existsSync(DEPLOYMENTS_FILE)
    ? JSON.parse(readFileSync(DEPLOYMENTS_FILE, "utf8"))
    : {};
}

export function saveDeployment(updates) {
  const all = loadDeployments();
  all[NETWORK] = { ...all[NETWORK], ...updates };
  writeFileSync(DEPLOYMENTS_FILE, `${JSON.stringify(all, null, 2)}\n`);
  return all[NETWORK];
}

export function contractAddress() {
  if (process.env.NEXT_PUBLIC_CHAMASCORE_CONTRACT) {
    return getAddress(process.env.NEXT_PUBLIC_CHAMASCORE_CONTRACT);
  }
  const deployed = loadDeployments()[NETWORK]?.contract;
  if (deployed) return getAddress(deployed);
  if (!IS_MAINNET) return getAddress("0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5");
  throw new Error(
    "No mainnet contract found. Run: CHAMASCORE_NETWORK=mainnet npm run deploy:contract",
  );
}

export function agentId() {
  if (process.env.NEXT_PUBLIC_ERC8004_AGENT_ID) {
    return BigInt(process.env.NEXT_PUBLIC_ERC8004_AGENT_ID);
  }
  const registered = loadDeployments()[NETWORK]?.agentId;
  if (registered !== undefined) return BigInt(registered);
  if (!IS_MAINNET) return 338n;
  throw new Error(
    "No mainnet agent ID found. Run: CHAMASCORE_NETWORK=mainnet npm run register:erc8004",
  );
}
