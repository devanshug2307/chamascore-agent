// Deploys ChamaScoreCircle to the network selected by CHAMASCORE_NETWORK.
// On mainnet, the deployment transaction pays gas in USDC (fee abstraction),
// so the deployer wallet only needs USDC — no CELO balance required.

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createPublicClient, createWalletClient, formatUnits, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  BLOCKSCOUT,
  CHAIN,
  NETWORK,
  RPC_URL,
  TX_OPTS,
  USDC,
  saveDeployment,
} from "./lib/network.mjs";

const ABI_PATH = resolve(
  process.cwd(),
  "artifacts/contracts_ChamaScoreCircle_sol_ChamaScoreCircle.abi",
);
const BIN_PATH = resolve(
  process.cwd(),
  "artifacts/contracts_ChamaScoreCircle_sol_ChamaScoreCircle.bin",
);

function loadPrivateKey() {
  if (process.env.CHAMASCORE_PRIVATE_KEY) return process.env.CHAMASCORE_PRIVATE_KEY;
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return undefined;
  const match = readFileSync(envPath, "utf8").match(/^CHAMASCORE_PRIVATE_KEY=(.+)$/m);
  return match?.[1]?.trim();
}

async function main() {
  const privateKey = loadPrivateKey();
  if (!privateKey) {
    console.error("Missing CHAMASCORE_PRIVATE_KEY (env or .env.local).");
    process.exitCode = 1;
    return;
  }

  if (!existsSync(ABI_PATH) || !existsSync(BIN_PATH)) {
    console.log("[deploy] artifacts missing, compiling...");
    execSync("npm run compile:contracts", { stdio: "inherit" });
  }
  const abi = JSON.parse(readFileSync(ABI_PATH, "utf8"));
  const bytecode = `0x${readFileSync(BIN_PATH, "utf8").trim()}`;

  const account = privateKeyToAccount(
    privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`,
  );
  const transport = http(RPC_URL);
  const publicClient = createPublicClient({ chain: CHAIN, transport });
  const walletClient = createWalletClient({ account, chain: CHAIN, transport });

  const [celoBalance, usdcBalance] = await Promise.all([
    publicClient.getBalance({ address: account.address }),
    publicClient.readContract({
      address: USDC,
      abi: [
        {
          name: "balanceOf",
          type: "function",
          stateMutability: "view",
          inputs: [{ type: "address" }],
          outputs: [{ type: "uint256" }],
        },
      ],
      functionName: "balanceOf",
      args: [account.address],
    }),
  ]);

  console.log(`[deploy] network: ${NETWORK} (chain ${CHAIN.id})`);
  console.log(`[deploy] deployer: ${account.address}`);
  console.log(`[deploy] CELO: ${formatUnits(celoBalance, 18)} | USDC: ${formatUnits(usdcBalance, 6)}`);
  if (TX_OPTS.feeCurrency) {
    console.log(`[deploy] gas paid in USDC via fee adapter ${TX_OPTS.feeCurrency}`);
  }

  const hash = await walletClient.deployContract({ abi, bytecode, ...TX_OPTS });
  console.log(`[deploy] tx: ${hash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success" || !receipt.contractAddress) {
    console.error("[deploy] deployment failed", receipt.status);
    process.exitCode = 1;
    return;
  }

  const record = saveDeployment({
    contract: receipt.contractAddress,
    deployTx: hash,
    deployBlock: Number(receipt.blockNumber),
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        network: NETWORK,
        ...record,
        explorer: `${BLOCKSCOUT}/address/${receipt.contractAddress}`,
        next: [
          `CHAMASCORE_NETWORK=${NETWORK} npm run register:erc8004`,
          `CHAMASCORE_NETWORK=${NETWORK} npm run demo:setup`,
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
