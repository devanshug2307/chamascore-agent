const BLOCKSCOUT = "https://celo-sepolia.blockscout.com";

export const demoContractAddress =
  process.env.NEXT_PUBLIC_CHAMASCORE_CONTRACT ??
  "0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5";

export const demoCircleId = Number(
  process.env.NEXT_PUBLIC_CHAMASCORE_CIRCLE_ID ?? "4",
);

export const demoWalletAddress = "0xE6df1c1EcC9cEe37B09172366B92a7eDc026b603";

export const demoUsdcAddress = "0x01C5C0122039549AD1493B8220cABEdD739BC44E";

export const demoAgentMetadataUrl =
  process.env.NEXT_PUBLIC_AGENT_METADATA_URL ??
  "https://chamascore-agent.vercel.app/agent.json";

export const demoProofTransactions = {
  circleCreated:
    process.env.NEXT_PUBLIC_PROOF_CIRCLE_CREATED_TX ??
    "0x2456fb9d981743043892200efdd25e19a9408ff4df3032666943237d88be24ab",
  approval:
    process.env.NEXT_PUBLIC_PROOF_APPROVAL_TX ??
    "0x05bb548239750b97f13c6661f5dd81fa140a3dbfcf568895ac2e9886c4cb9031",
  contribution:
    process.env.NEXT_PUBLIC_PROOF_CONTRIBUTION_TX ??
    "0x01da3da0640490f6c3ca0073f9b7d10c4d1146e955df27bb02408158d3aca705",
  riskFlag:
    process.env.NEXT_PUBLIC_PROOF_RISK_FLAG_TX ??
    "0xe29aedb6135c3f89c76e8bb378191abd98eec3f5f8e538a459320e7ae0586775",
  payout:
    process.env.NEXT_PUBLIC_PROOF_PAYOUT_TX ??
    "0xcd50eb7e89869bfd1204f3d07d1f0cfd096fd9724ad416897be6776356dfc52f",
} as const;

export function blockscoutTxUrl(hash: string) {
  return `${BLOCKSCOUT}/tx/${hash}`;
}

export function blockscoutAddressUrl(address: string) {
  return `${BLOCKSCOUT}/address/${address}`;
}

export function isRecordedTxHash(hash: string | undefined) {
  return Boolean(hash && !/^0x0+$/.test(hash));
}

export function getDemoProofLinks() {
  const links: Record<string, string> = {
    contract: blockscoutAddressUrl(demoContractAddress),
    circleCreated: blockscoutTxUrl(demoProofTransactions.circleCreated),
  };

  if (isRecordedTxHash(demoProofTransactions.approval)) {
    links.approval = blockscoutTxUrl(demoProofTransactions.approval);
  }

  if (isRecordedTxHash(demoProofTransactions.contribution)) {
    links.contribution = blockscoutTxUrl(demoProofTransactions.contribution);
  }

  if (isRecordedTxHash(demoProofTransactions.riskFlag)) {
    links.riskFlag = blockscoutTxUrl(demoProofTransactions.riskFlag);
  }

  if (isRecordedTxHash(demoProofTransactions.payout)) {
    links.payout = blockscoutTxUrl(demoProofTransactions.payout);
  }

  return links;
}

export function getDemoProofUiItems() {
  const items = [
    {
      label: "Contract",
      value: `${demoContractAddress.slice(0, 6)}...${demoContractAddress.slice(-4)}`,
      href: blockscoutAddressUrl(demoContractAddress),
    },
    {
      label: `Circle ${demoCircleId}`,
      value: "Created",
      href: blockscoutTxUrl(demoProofTransactions.circleCreated),
    },
  ] as Array<{ label: string; value: string; href: string }>;

  if (isRecordedTxHash(demoProofTransactions.approval)) {
    items.push({
      label: "USDC approval",
      value: "0.5 USDC",
      href: blockscoutTxUrl(demoProofTransactions.approval),
    });
  }

  if (isRecordedTxHash(demoProofTransactions.contribution)) {
    items.push({
      label: "Contribution",
      value: "Confirmed",
      href: blockscoutTxUrl(demoProofTransactions.contribution),
    });
  }

  if (isRecordedTxHash(demoProofTransactions.riskFlag)) {
    items.push({
      label: "Risk flag",
      value: "Recorded",
      href: blockscoutTxUrl(demoProofTransactions.riskFlag),
    });
  }

  if (isRecordedTxHash(demoProofTransactions.payout)) {
    items.push({
      label: "Agent payout",
      value: "Executed",
      href: blockscoutTxUrl(demoProofTransactions.payout),
    });
  }

  return items;
}
