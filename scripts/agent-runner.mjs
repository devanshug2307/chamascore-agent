// ChamaScore autonomous agent runner.
// One pass per invocation (designed for cron): scans every circle on the
// ChamaScoreCircle contract, scores members, then ACTS onchain:
//   - executes the rotating payout when a round is fully funded
//   - records a risk flag for members still pending while the majority paid
// Every action is a real Celo transaction, logged to artifacts/agent-runs/.

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  createPublicClient,
  createWalletClient,
  formatUnits,
  http,
  parseAbi,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  BLOCKSCOUT,
  CHAIN,
  NETWORK,
  RPC_URL,
  TX_OPTS,
  contractAddress,
  loadDeployments,
} from "./lib/network.mjs";

const CONTRACT = contractAddress();

const circleAbi = parseAbi([
  "function nextCircleId() view returns (uint256)",
  "function getCircle(uint256 circleId) view returns (address organizer, address token, uint256 contributionAmount, uint256 currentRound, bool active, string metadataURI)",
  "function getMembers(uint256 circleId) view returns (address[] members)",
  "function hasContributed(uint256 circleId, uint256 round, address member) view returns (bool)",
  "function roundTotal(uint256 circleId, uint256 round) view returns (uint256)",
  "function executePayout(uint256 circleId)",
  "function recordRiskFlag(uint256 circleId, address member, string reason, uint8 severity)",
  "event RiskFlagRecorded(uint256 indexed circleId, address indexed member, string reason, uint8 severity)",
]);

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

  const account = privateKeyToAccount(
    privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`,
  );
  const transport = http(RPC_URL);
  const publicClient = createPublicClient({ chain: CHAIN, transport });
  const walletClient = createWalletClient({ account, chain: CHAIN, transport });

  const run = {
    agent: "ChamaScore Agent",
    startedAt: new Date().toISOString(),
    network: NETWORK === "mainnet" ? "celo" : "celo-sepolia",
    contract: CONTRACT,
    operator: account.address,
    circles: [],
    actions: [],
  };

  const read = (functionName, args) =>
    publicClient.readContract({ address: CONTRACT, abi: circleAbi, functionName, args });

  const nextCircleId = await read("nextCircleId", []);
  console.log(`[runner] scanning ${nextCircleId} circle(s) on ${run.network}`);

  // Existing risk flags (dedupe by circle+member+reason)
  const deployBlock = loadDeployments()[NETWORK]?.deployBlock;
  const riskLogs = await publicClient.getLogs({
    address: CONTRACT,
    event: circleAbi.find((e) => e.type === "event" && e.name === "RiskFlagRecorded"),
    fromBlock: deployBlock ? BigInt(deployBlock) : 0n,
    toBlock: "latest",
  });
  const flaggedKeys = new Set(
    riskLogs.map(
      (log) =>
        `${log.args.circleId}:${log.args.member?.toLowerCase()}:${log.args.reason}`,
    ),
  );

  for (let id = 0n; id < nextCircleId; id++) {
    const [organizer, , contributionAmount, currentRound, active] =
      await read("getCircle", [id]);
    if (!active) continue;

    const members = await read("getMembers", [id]);
    const paid = [];
    const pending = [];
    for (const member of members) {
      const has = await read("hasContributed", [id, currentRound, member]);
      (has ? paid : pending).push(member);
    }
    const roundTotal = await read("roundTotal", [id, currentRound]);
    const expected = contributionAmount * BigInt(members.length);

    const circleState = {
      circleId: Number(id),
      round: Number(currentRound),
      members: members.length,
      paid: paid.length,
      pending: pending.map((m) => m),
      collected: formatUnits(roundTotal, 6),
      expected: formatUnits(expected, 6),
    };
    run.circles.push(circleState);
    console.log(
      `[runner] circle ${id} round ${currentRound}: ${circleState.collected}/${circleState.expected} collected, ${pending.length} pending`,
    );

    const isOrganizer = organizer.toLowerCase() === account.address.toLowerCase();
    if (!isOrganizer) continue;

    // Decision 1: round fully funded -> execute rotating payout
    if (roundTotal >= expected) {
      const recipient = members[Number(currentRound) % members.length];
      console.log(`[runner] circle ${id}: round funded, executing payout to ${recipient}`);
      const hash = await walletClient.writeContract({
        address: CONTRACT,
        abi: circleAbi,
        functionName: "executePayout",
        args: [id],
        ...TX_OPTS,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      run.actions.push({
        type: "payout",
        circleId: Number(id),
        round: Number(currentRound),
        recipient,
        amount: formatUnits(expected, 6),
        tx: hash,
        explorer: `${BLOCKSCOUT}/tx/${hash}`,
      });
      continue;
    }

    // Decision 2: majority paid but some pending -> record risk flag once
    if (paid.length > pending.length && pending.length > 0) {
      for (const member of pending) {
        const reason = `round ${currentRound}: pending while majority contributed`;
        const key = `${id}:${member.toLowerCase()}:${reason}`;
        if (flaggedKeys.has(key)) continue;
        console.log(`[runner] circle ${id}: flagging ${member} (${reason})`);
        const hash = await walletClient.writeContract({
          address: CONTRACT,
          abi: circleAbi,
          functionName: "recordRiskFlag",
          args: [id, member, reason, 1],
          ...TX_OPTS,
        });
        await publicClient.waitForTransactionReceipt({ hash });
        run.actions.push({
          type: "risk-flag",
          circleId: Number(id),
          round: Number(currentRound),
          member,
          reason,
          tx: hash,
          explorer: `${BLOCKSCOUT}/tx/${hash}`,
        });
      }
    }
  }

  run.finishedAt = new Date().toISOString();
  run.summary = `${run.circles.length} active circle(s) scanned, ${run.actions.length} onchain action(s) executed`;

  const outDir = resolve(process.cwd(), "artifacts/agent-runs");
  mkdirSync(outDir, { recursive: true });
  const stamp = run.startedAt.replace(/[:.]/g, "-");
  const outPath = resolve(outDir, `run-${stamp}.json`);
  writeFileSync(outPath, `${JSON.stringify(run, null, 2)}\n`);

  // Maintain a rolling public log served by the app
  const publicLogPath = resolve(process.cwd(), "public/agent-runs.json");
  const history = existsSync(publicLogPath)
    ? JSON.parse(readFileSync(publicLogPath, "utf8"))
    : [];
  history.unshift(run);
  writeFileSync(publicLogPath, `${JSON.stringify(history.slice(0, 50), null, 2)}\n`);

  console.log(JSON.stringify(run, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
