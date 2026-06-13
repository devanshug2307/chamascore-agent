import { NextResponse } from "next/server";
import { erc20Abi, formatUnits, getAddress, parseAbi } from "viem";
import { NETWORK_LABEL } from "@/lib/agent-metadata";
import { getPublicClient } from "@/lib/live-circle";
import {
  demoAgentMetadataUrl,
  demoCircleId,
  demoContractAddress,
  demoUsdcAddress,
  demoWalletAddress,
  getDemoProofLinks,
} from "@/lib/demo-proof";

export const dynamic = "force-dynamic";

const CONTRACT = getAddress(demoContractAddress);
const CIRCLE_ID = BigInt(demoCircleId);
const USDC = getAddress(demoUsdcAddress);
const DEMO_WALLET = getAddress(demoWalletAddress);

const circleAbi = parseAbi([
  "function getCircle(uint256 circleId) view returns (address organizer, address token, uint256 contributionAmount, uint256 currentRound, bool active, string metadataURI)",
  "function getMembers(uint256 circleId) view returns (address[] members)",
  "function hasContributed(uint256 circleId, uint256 round, address member) view returns (bool)",
  "function roundTotal(uint256 circleId, uint256 round) view returns (uint256)",
]);

const proofLinks = getDemoProofLinks();

export async function GET() {
  try {
    const client = getPublicClient();
    const [organizer, token, contributionAmount, currentRound, active, metadataURI] =
      await client.readContract({
        address: CONTRACT,
        abi: circleAbi,
        functionName: "getCircle",
        args: [CIRCLE_ID],
      });

    const [members, hasContributed, roundTotal, demoWalletUsdcBalance] =
      await Promise.all([
        client.readContract({
          address: CONTRACT,
          abi: circleAbi,
          functionName: "getMembers",
          args: [CIRCLE_ID],
        }),
        client.readContract({
          address: CONTRACT,
          abi: circleAbi,
          functionName: "hasContributed",
          args: [CIRCLE_ID, currentRound, DEMO_WALLET],
        }),
        client.readContract({
          address: CONTRACT,
          abi: circleAbi,
          functionName: "roundTotal",
          args: [CIRCLE_ID, currentRound],
        }),
        client.readContract({
          address: USDC,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [DEMO_WALLET],
        }),
      ]);

    return NextResponse.json({
      ok: true,
      source: `${NETWORK_LABEL}-live-read`,
      generatedAt: new Date().toISOString(),
      network: NETWORK_LABEL,
      contract: CONTRACT,
      circleId: Number(CIRCLE_ID),
      circle: {
        organizer,
        token,
        contributionAmount: `${formatUnits(contributionAmount, 6)} USDC`,
        currentRound: Number(currentRound),
        active,
        metadataURI,
        members,
      },
      proof: {
        demoWallet: DEMO_WALLET,
        hasContributed,
        roundTotal: `${formatUnits(roundTotal, 6)} USDC`,
        demoWalletUsdcBalance: `${formatUnits(demoWalletUsdcBalance, 6)} USDC`,
        links: proofLinks,
      },
      submissionNote: metadataURI.includes("localhost")
        ? `Active circle metadata still points to localhost. Expected ${demoAgentMetadataUrl}.`
        : "Circle metadata URI is public and ready for judges.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        source: `${NETWORK_LABEL}-live-read`,
        error: error instanceof Error ? error.message : "Unknown onchain proof error",
      },
      { status: 500 },
    );
  }
}
