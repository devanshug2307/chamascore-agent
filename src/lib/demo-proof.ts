const BLOCKSCOUT = "https://celo-sepolia.blockscout.com";

export const demoContractAddress =
  process.env.NEXT_PUBLIC_CHAMASCORE_CONTRACT ??
  "0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5";

export const demoCircleId = Number(
  process.env.NEXT_PUBLIC_CHAMASCORE_CIRCLE_ID ?? "3",
);

export const demoWalletAddress = "0xE6df1c1EcC9cEe37B09172366B92a7eDc026b603";

export const demoUsdcAddress = "0x01C5C0122039549AD1493B8220cABEdD739BC44E";

export const demoAgentMetadataUrl =
  process.env.NEXT_PUBLIC_AGENT_METADATA_URL ??
  "https://chamascore-agent.vercel.app/agent.json";

export const demoProofTransactions = {
  circleCreated:
    process.env.NEXT_PUBLIC_PROOF_CIRCLE_CREATED_TX ??
    "0xb92cad2604b08f8b65324ee05f4ecff59c0c05d905ac6ac06e3c1ac25a5b12c1",
  approval:
    process.env.NEXT_PUBLIC_PROOF_APPROVAL_TX ??
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  contribution:
    process.env.NEXT_PUBLIC_PROOF_CONTRIBUTION_TX ??
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  riskFlag:
    process.env.NEXT_PUBLIC_PROOF_RISK_FLAG_TX ??
    "0x0000000000000000000000000000000000000000000000000000000000000000",
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

  return items;
}
