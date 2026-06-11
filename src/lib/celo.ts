import { encodeFunctionData, erc20Abi, parseUnits, type Address } from "viem";
import { celo, celoSepolia } from "viem/chains";

export const supportedChains = {
  mainnet: celo,
  sepolia: celoSepolia,
} as const;

export type SupportedChainId = 42220 | 11142220;

export type StableTokenSymbol = "USDm" | "USDC" | "USDT";

export type TokenConfig = {
  symbol: StableTokenSymbol;
  decimals: number;
  mainnet: Address;
  sepolia: Address;
};

export const stableTokens: Record<StableTokenSymbol, TokenConfig> = {
  USDm: {
    symbol: "USDm",
    decimals: 18,
    mainnet: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    sepolia: "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
  },
  USDC: {
    symbol: "USDC",
    decimals: 6,
    mainnet: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
    sepolia: "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
  },
  USDT: {
    symbol: "USDT",
    decimals: 6,
    mainnet: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
    sepolia: "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
  },
};

export const chamaScoreContractAbi = [
  {
    type: "function",
    name: "createCircle",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "contributionAmount", type: "uint256" },
      { name: "members", type: "address[]" },
      { name: "metadataURI", type: "string" },
    ],
    outputs: [{ name: "circleId", type: "uint256" }],
  },
  {
    type: "function",
    name: "contribute",
    stateMutability: "nonpayable",
    inputs: [{ name: "circleId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "executePayout",
    stateMutability: "nonpayable",
    inputs: [{ name: "circleId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "recordRiskFlag",
    stateMutability: "nonpayable",
    inputs: [
      { name: "circleId", type: "uint256" },
      { name: "member", type: "address" },
      { name: "reason", type: "string" },
      { name: "severity", type: "uint8" },
    ],
    outputs: [],
  },
] as const;

export function normalizeChainId(value: string | number | bigint): number {
  if (typeof value === "string") {
    return value.startsWith("0x") ? Number.parseInt(value, 16) : Number(value);
  }
  return Number(value);
}

export function isSupportedMiniPayChain(chainId?: number) {
  return chainId === supportedChains.mainnet.id || chainId === supportedChains.sepolia.id;
}

export function getTokenAddress(symbol: StableTokenSymbol, chainId: number) {
  if (
    symbol === "USDC" &&
    chainId === supportedChains.sepolia.id &&
    process.env.NEXT_PUBLIC_CHAMASCORE_USDC
  ) {
    return process.env.NEXT_PUBLIC_CHAMASCORE_USDC as Address;
  }

  const token = stableTokens[symbol];
  return chainId === supportedChains.mainnet.id ? token.mainnet : token.sepolia;
}

export function encodeApprove(
  symbol: StableTokenSymbol,
  chainId: number,
  spender: Address,
  amount: number,
) {
  const token = stableTokens[symbol];
  return {
    to: getTokenAddress(symbol, chainId),
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, parseUnits(amount.toString(), token.decimals)],
    }),
  };
}

export function encodeContribution(circleId: bigint) {
  return encodeFunctionData({
    abi: chamaScoreContractAbi,
    functionName: "contribute",
    args: [circleId],
  });
}

export function encodeRiskFlag(
  circleId: bigint,
  member: Address,
  reason: string,
  severity: 1 | 2 | 3,
) {
  return encodeFunctionData({
    abi: chamaScoreContractAbi,
    functionName: "recordRiskFlag",
    args: [circleId, member, reason, severity],
  });
}

export function getAgentMetadataUrl() {
  if (process.env.NEXT_PUBLIC_AGENT_METADATA_URL) {
    return process.env.NEXT_PUBLIC_AGENT_METADATA_URL;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/agent.json`;
  }

  return "https://chamascore-agent.vercel.app/agent.json";
}

export function encodeCreateUsdcCircle(chainId: number, organizer: Address) {
  return encodeFunctionData({
    abi: chamaScoreContractAbi,
    functionName: "createCircle",
    args: [
      getTokenAddress("USDC", chainId).toLowerCase() as Address,
      parseUnits("0.5", stableTokens.USDC.decimals),
      [
        organizer.toLowerCase() as Address,
        "0x19a12f8b9e8ef0a1443b86f842cc3901d9c09a91" as Address,
      ],
      getAgentMetadataUrl(),
    ],
  });
}
