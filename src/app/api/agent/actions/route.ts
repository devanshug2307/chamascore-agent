import { NextResponse } from "next/server";
import { getAddress } from "viem";
import {
  encodeApprove,
  encodeContribution,
  encodeCreateUsdcCircle,
  encodeRiskFlag,
  supportedChains,
} from "@/lib/celo";

const contractAddress = getAddress(
  process.env.NEXT_PUBLIC_CHAMASCORE_CONTRACT ||
    "0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5",
);
const circleId = BigInt(process.env.NEXT_PUBLIC_CHAMASCORE_CIRCLE_ID || "2");
const demoOrganizer = getAddress("0xE6df1c1EcC9cEe37B09172366B92a7eDc026b603");
const riskTarget = getAddress("0x19A12f8b9e8eF0A1443B86F842cC3901d9C09a91");

export async function GET() {
  const approval = encodeApprove("USDC", supportedChains.sepolia.id, contractAddress, 0.5);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    network: "celo-sepolia",
    contractAddress,
    circleId: Number(circleId),
    publicMetadataUrl:
      process.env.NEXT_PUBLIC_AGENT_METADATA_URL ||
      "https://chamascore-agent.vercel.app/agent.json",
    actions: [
      {
        id: "create-public-metadata-circle",
        label: "Create fresh public-metadata circle",
        transaction: {
          to: contractAddress,
          data: encodeCreateUsdcCircle(supportedChains.sepolia.id, demoOrganizer),
        },
        reason:
          "Create a fresh circle whose metadataURI points to the public Vercel /agent.json URL.",
      },
      {
        id: "approve-usdc",
        label: "Approve 0.5 USDC",
        transaction: approval,
        reason: "Permit the ChamaScore contract to collect the fixed contribution.",
      },
      {
        id: "contribute",
        label: "Contribute to Circle 2",
        transaction: {
          to: contractAddress,
          data: encodeContribution(circleId),
        },
        reason: "Record a member contribution for the active round.",
      },
      {
        id: "record-risk-flag",
        label: "Record late-payment risk flag",
        transaction: {
          to: contractAddress,
          data: encodeRiskFlag(
            circleId,
            riskTarget,
            "ChamaScore late-payment review: Amina",
            2,
          ),
        },
        reason: "Turn the agent's late-payer finding into onchain reputation evidence.",
      },
    ],
  });
}
