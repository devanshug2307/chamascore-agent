import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "ChamaScore Agent",
    description:
      "A Celo onchain agent that scores savings-circle contribution reliability, flags risk, prepares payout actions, and publishes portable reputation for chamas and stokvels.",
    category: "real-world-payments",
    chain: "celo",
    networks: ["celo-sepolia"],
    plannedNetworks: ["celo-mainnet"],
    capabilities: [
      "stablecoin contribution monitoring",
      "member reliability scoring",
      "late-payer detection",
      "payout readiness reports",
      "onchain risk flag recording",
      "encoded transaction action planning",
      "live Celo Sepolia proof reads",
      "ERC-8004 feedback preparation",
      "MiniPay-compatible payment actions",
    ],
    endpoints: {
      report: "/api/agent/report",
      onchainProof: "/api/agent/onchain-proof",
      actions: "/api/agent/actions",
    },
    deployment: {
      network: "celo-sepolia",
      contractAddress: "0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5",
      activeCircleId: 2,
      token: {
        symbol: "USDC",
        address: "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
        contributionAmount: "0.5",
      },
      proof: {
        circleCreated:
          "0xb662ae355bb0d7f23da82b8014adcb90726ea9803c58603d77af0c4aa9c72276",
        approval:
          "0x4993feda85b6668fcaff9a297d96692a14cbe121f8415905efba401d15ad8067",
        contribution:
          "0xbbc9525edb99a84c8aab79bbcb19e637d747df703757913e0f90c937baa2f258",
        blockscout: {
          contract:
            "https://celo-sepolia.blockscout.com/address/0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5",
          circleCreated:
            "https://celo-sepolia.blockscout.com/tx/0xb662ae355bb0d7f23da82b8014adcb90726ea9803c58603d77af0c4aa9c72276",
          approval:
            "https://celo-sepolia.blockscout.com/tx/0x4993feda85b6668fcaff9a297d96692a14cbe121f8415905efba401d15ad8067",
          contribution:
            "https://celo-sepolia.blockscout.com/tx/0xbbc9525edb99a84c8aab79bbcb19e637d747df703757913e0f90c937baa2f258",
        },
      },
    },
    submission: {
      hackathon: "celo-onchain-agents",
      tracks: ["best-agent"],
    },
  });
}
