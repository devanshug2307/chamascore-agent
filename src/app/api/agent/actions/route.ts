import { NextResponse } from "next/server";
import { getAddress } from "viem";
import { CHAIN_ID, NETWORK_LABEL } from "@/lib/agent-metadata";
import {
  encodeApprove,
  encodeContribution,
  encodeCreateUsdcCircle,
  getAgentMetadataUrl,
  encodeRiskFlag,
} from "@/lib/celo";

import {
  demoCircleId,
  demoContractAddress,
} from "@/lib/demo-proof";

const contractAddress = getAddress(demoContractAddress);
const circleId = BigInt(demoCircleId);
const demoOrganizer = getAddress("0xE6df1c1EcC9cEe37B09172366B92a7eDc026b603");
const riskTarget = getAddress("0x19A12f8b9e8eF0A1443B86F842cC3901d9C09a91");

export async function GET() {
  const approval = encodeApprove("USDC", CHAIN_ID, contractAddress, 0.5);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    network: NETWORK_LABEL,
    contractAddress,
    circleId: Number(circleId),
    publicMetadataUrl: getAgentMetadataUrl(),
    actions: [
      {
        id: "create-public-metadata-circle",
        label: "Create fresh public-metadata circle",
        transaction: {
          to: contractAddress,
          data: encodeCreateUsdcCircle(CHAIN_ID, demoOrganizer),
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
        label: `Contribute to Circle ${demoCircleId}`,
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
