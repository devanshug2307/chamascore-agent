import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const DEMO_WALLET = "0xE6df1c1EcC9cEe37B09172366B92a7eDc026b603";
const API = "https://app.ai.self.xyz";

function loadWallet() {
  if (process.env.CHAMASCORE_DEMO_WALLET) {
    return process.env.CHAMASCORE_DEMO_WALLET;
  }

  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    return DEMO_WALLET;
  }

  const match = readFileSync(envPath, "utf8").match(/^CHAMASCORE_DEMO_WALLET=(.+)$/m);
  return match?.[1]?.trim() || DEMO_WALLET;
}

async function startRegistration(humanAddress) {
  const response = await fetch(`${API}/api/agent/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "linked",
      network: "testnet",
      humanAddress,
    }),
  });

  if (!response.ok) {
    throw new Error(`register failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function pollStatus(sessionToken) {
  const response = await fetch(`${API}/api/agent/register/status`, {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`status failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

function saveSession(data) {
  const outPath = resolve(process.cwd(), "self-registration-session.json");
  writeFileSync(outPath, `${JSON.stringify(data, null, 2)}\n`);
  return outPath;
}

async function main() {
  const humanAddress = loadWallet();
  const args = process.argv.slice(2);

  if (args[0] === "status") {
    const sessionPath = resolve(process.cwd(), "self-registration-session.json");
    if (!existsSync(sessionPath)) {
      console.error("No session file. Run: npm run register:self");
      process.exitCode = 1;
      return;
    }

    const saved = JSON.parse(readFileSync(sessionPath, "utf8"));
    const status = await pollStatus(saved.sessionToken);
    console.log(JSON.stringify(status, null, 2));
    return;
  }

  console.log("Starting Self Agent ID registration on Celo Sepolia testnet...");
  const data = await startRegistration(humanAddress);
  const sessionPath = saveSession({
    sessionToken: data.sessionToken,
    scanUrl: data.scanUrl,
    deepLink: data.deepLink,
    agentAddress: data.agentAddress,
    stage: data.stage,
    expiresAt: data.expiresAt,
    humanAddress,
    createdAt: new Date().toISOString(),
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        stage: data.stage,
        agentAddress: data.agentAddress,
        scanUrl: data.scanUrl,
        deepLink: data.deepLink,
        sessionFile: sessionPath,
        humanInstructions: data.humanInstructions,
        nextSteps: [
          "Open scanUrl in your browser OR open deepLink on your phone.",
          "Scan with the Self mobile app (use mock passport on testnet).",
          "Then run: npm run register:self:status",
          "When stage is complete, save the Self profile link for Celo Builders.",
        ],
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
