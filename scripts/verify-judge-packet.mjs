const baseUrl = process.env.CHAMASCORE_BASE_URL || "http://localhost:3000";

async function readJson(path) {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
  return response.json();
}

function check(condition, label, details = undefined) {
  return {
    label,
    ok: Boolean(condition),
    ...(details === undefined ? {} : { details }),
  };
}

async function main() {
  const [metadata, report, actions, proof] = await Promise.all([
    readJson("/agent.json"),
    readJson("/api/agent/report"),
    readJson("/api/agent/actions"),
    readJson("/api/agent/onchain-proof"),
  ]);

  const checks = [
    check(metadata.name === "ChamaScore Agent", "agent metadata name"),
    check(
      metadata.endpoints?.report === "/api/agent/report" &&
        metadata.endpoints?.onchainProof === "/api/agent/onchain-proof" &&
        metadata.endpoints?.actions === "/api/agent/actions",
      "agent metadata exposes report, proof, and actions endpoints",
      metadata.endpoints,
    ),
    check(report.network === "celo-sepolia", "report network is Celo Sepolia"),
    check(report.riskFlags?.length > 0, "report includes risk flags"),
    check(
      report.recommendedTransactions?.some(
        (transaction) => transaction.functionName === "recordRiskFlag",
      ),
      "report recommends recordRiskFlag transaction",
    ),
    check(
      actions.actions?.some((action) => action.id === "record-risk-flag"),
      "actions endpoint returns encoded risk flag action",
    ),
    check(proof.ok === true, "live onchain proof endpoint succeeds"),
    check(proof.proof?.hasContributed === true, "demo wallet has contributed"),
    check(proof.proof?.roundTotal === "0.5 USDC", "round total is 0.5 USDC"),
    check(
      typeof proof.circle?.metadataURI === "string" &&
        !proof.circle.metadataURI.includes("localhost"),
      "circle metadata URI is public",
      proof.circle?.metadataURI,
    ),
  ];

  const ok = checks.every((item) => item.ok);

  console.log(
    JSON.stringify(
      {
        ok,
        baseUrl,
        generatedAt: new Date().toISOString(),
        checks,
        note: ok
          ? "Judge packet is ready."
          : "Fix failed checks before final submission. A localhost metadata URI means deploy the app and create a fresh circle with NEXT_PUBLIC_AGENT_METADATA_URL set.",
      },
      null,
      2,
    ),
  );

  if (!ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Judge packet verification failed:");
  console.error(error);
  process.exitCode = 1;
});
