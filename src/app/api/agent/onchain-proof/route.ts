import { NextResponse } from "next/server";
import { createPublicClient, erc20Abi, formatUnits, getAddress, http, parseAbi } from "viem";
import { celoSepolia } from "viem/chains";

export const dynamic = "force-dynamic";

const CONTRACT = getAddress(
  process.env.NEXT_PUBLIC_CHAMASCORE_CONTRACT ||
    "0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5",
);
const CIRCLE_ID = BigInt(process.env.NEXT_PUBLIC_CHAMASCORE_CIRCLE_ID || "2");
const USDC = getAddress(
  process.env.NEXT_PUBLIC_CHAMASCORE_USDC ||
    "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
);
const DEMO_WALLET = getAddress(
  process.env.CHAMASCORE_DEMO_WALLET ||
    "0xE6df1c1EcC9cEe37B09172366B92a7eDc026b603",
);

const circleAbi = parseAbi([
  "function getCircle(uint256 circleId) view returns (address organizer, address token, uint256 contributionAmount, uint256 currentRound, bool active, string metadataURI)",
  "function getMembers(uint256 circleId) view returns (address[] members)",
  "function hasContributed(uint256 circleId, uint256 round, address member) view returns (bool)",
  "function roundTotal(uint256 circleId, uint256 round) view returns (uint256)",
]);

const proofLinks = {
  contract:
    "https://celo-sepolia.blockscout.com/address/0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5",
  circleCreated:
    "https://celo-sepolia.blockscout.com/tx/0xb662ae355bb0d7f23da82b8014adcb90726ea9803c58603d77af0c4aa9c72276",
  approval:
    "https://celo-sepolia.blockscout.com/tx/0x4993feda85b6668fcaff9a297d96692a14cbe121f8415905efba401d15ad8067",
  contribution:
    "https://celo-sepolia.blockscout.com/tx/0xbbc9525edb99a84c8aab79bbcb19e637d747df703757913e0f90c937baa2f258",
};

const client = createPublicClient({
  chain: celoSepolia,
  transport: http(process.env.CELO_SEPOLIA_RPC_URL || undefined),
});

export async function GET() {
  try {
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
      source: "celo-sepolia-live-read",
      generatedAt: new Date().toISOString(),
      network: "celo-sepolia",
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
      submissionNote:
        "For the final public demo, create a fresh circle after deployment so metadataURI points to the public /agent.json URL instead of localhost.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        source: "celo-sepolia-live-read",
        error: error instanceof Error ? error.message : "Unknown onchain proof error",
      },
      { status: 500 },
    );
  }
}
