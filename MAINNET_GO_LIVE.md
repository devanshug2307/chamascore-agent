# ChamaScore — Mainnet Go-Live Runbook

**Why this exists:** The hackathon organizers confirmed (Telegram, multiple times) that
**onchain activity must be on Celo mainnet — testnet does not count for any track.**
The current demo is fully working but on **Celo Sepolia**, so it does not yet qualify.
This runbook flips ChamaScore to **Celo mainnet (chain 42220)** with the same verified
flow. The code is already network-aware: every script and every app endpoint switches on
`CHAMASCORE_NETWORK=mainnet` (scripts) and `NEXT_PUBLIC_CHAIN_ID=42220` (the Vercel app).

**Time:** ~30 min of commands + ~15 min docs/post/submit.
**Real cost:** a few cents of gas. The CELO/USDC you send stays in wallets you control.

---

## 0. Prerequisites (only you can do these)

1. **Fund the agent operator wallet on Celo mainnet:**
   `0xE6df1c1EcC9cEe37B09172366B92a7eDc026b603`
   - **~0.5 CELO** (gas — the script also forwards 0.08 CELO to each of 2 member wallets)
   - **~6 USDC** (mainnet USDC `0xcebA9300f2b948710d2653dD7B07f33A8B32118C`)
   - How: buy CELO + USDC on an exchange that supports the **Celo network** (e.g. Coinbase,
     Binance) and withdraw to the wallet **on Celo**, or bridge via Squid/Mento, or on-ramp
     in MiniPay. Double-check the network is **Celo**, not Ethereum.
   - *Alternative (no CELO):* fund ~8 USDC only and prefix every command below with
     `CHAMASCORE_GAS=usdc` — gas is paid in USDC via Celo fee abstraction (CIP-64).
     Native CELO gas (the default) is the more battle-tested path; prefer it unless you
     can't get CELO.
2. **Confirm the private key is present:** `chamascore/.env.local` already contains
   `CHAMASCORE_PRIVATE_KEY` for that wallet. (Never print or commit it — it's gitignored.)
3. Verify funding landed:
   ```bash
   cd chamascore
   node -e "import('viem').then(async v=>{const c=v.createPublicClient({chain:(await import('viem/chains')).celo,transport:v.http()});const w='0xE6df1c1EcC9cEe37B09172366B92a7eDc026b603';const bal=await c.getBalance({address:w});const u=await c.readContract({address:'0xcebA9300f2b948710d2653dD7B07f33A8B32118C',abi:v.erc20Abi,functionName:'balanceOf',args:[w]});console.log('CELO',v.formatUnits(bal,18),'| USDC',v.formatUnits(u,6))})"
   ```

> **Do not export `NEXT_PUBLIC_CHAMASCORE_CONTRACT` / `NEXT_PUBLIC_ERC8004_AGENT_ID` in your
> shell.** The scripts read mainnet addresses from `deployments.json` (written by the deploy
> step). A stray testnet env var would override them. Running the npm scripts plainly (node
> does not auto-load `.env.local` except for the private key) is correct.

---

## 1. Deploy + register + run the full lifecycle on mainnet

All from `chamascore/`. Each command prints the tx hashes you'll need for Vercel + docs.

```bash
cd chamascore

# 1. Compile (deploy auto-compiles if artifacts are missing, but be explicit)
npm run compile:contracts

# 2. Deploy ChamaScoreCircle to mainnet -> writes deployments.json {mainnet:{contract,...}}
CHAMASCORE_NETWORK=mainnet npm run deploy:contract

# 3. Register the agent on the mainnet ERC-8004 Identity Registry
#    -> writes agentId to deployments.json. Note the agentId + registration tx.
CHAMASCORE_NETWORK=mainnet npm run register:erc8004

# 4. Create the circle + fund 2 member wallets + everyone contributes round 0
CHAMASCORE_NETWORK=mainnet npm run demo:setup
#    Note the circleId from the JSON output (call it <ID> below).

# 5. Agent executes the round-0 payout autonomously
CHAMASCORE_NETWORK=mainnet npm run agent:run

# 6. Round 1 with a late payer (creates an autonomous onchain risk flag):
CHAMASCORE_NETWORK=mainnet CONTRIBUTE_ONLY=1 DEMO_CIRCLE_ID=<ID> SKIP_MEMBERS=member-2 npm run demo:setup
CHAMASCORE_NETWORK=mainnet npm run agent:run          # records the risk flag

# 7. Late member recovers, agent pays out round 1:
CHAMASCORE_NETWORK=mainnet CONTRIBUTE_ONLY=1 DEMO_CIRCLE_ID=<ID> npm run demo:setup
CHAMASCORE_NETWORK=mainnet npm run agent:run          # executes round-1 payout

# 8. Independent member wallets rate the agent on the mainnet Reputation Registry
CHAMASCORE_NETWORK=mainnet npm run demo:feedback
```

Collect from the outputs (also saved in `deployments.json`):
`mainnet contract`, `agentId`, `registration tx`, `circle-created tx`, `approval tx`,
`contribution tx`, `payout tx (round 0)`, `risk-flag tx`, `payout tx (round 1)`.

---

## 2. Flip the live Vercel app to mainnet

Vercel → project → **Settings → Environment Variables** (Production). Set:

```text
NEXT_PUBLIC_CHAIN_ID=42220                # ← THE flip: server now reads/labels mainnet
NEXT_PUBLIC_CHAMASCORE_CONTRACT=<mainnet contract>
NEXT_PUBLIC_CHAMASCORE_CIRCLE_ID=<ID>
NEXT_PUBLIC_CHAMASCORE_USDC=0xcebA9300f2b948710d2653dD7B07f33A8B32118C
NEXT_PUBLIC_ERC8004_AGENT_ID=<mainnet agentId>
NEXT_PUBLIC_ERC8004_IDENTITY_REGISTRY=0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
NEXT_PUBLIC_ERC8004_REPUTATION_REGISTRY=0x8004BAa17C55a88189AE136b182e5fdA19dE9b63
NEXT_PUBLIC_ERC8004_REGISTRY_TX=<registration tx>
NEXT_PUBLIC_PROOF_CIRCLE_CREATED_TX=<circle-created tx>
NEXT_PUBLIC_PROOF_APPROVAL_TX=<approval tx>
NEXT_PUBLIC_PROOF_CONTRIBUTION_TX=<contribution tx>
NEXT_PUBLIC_PROOF_PAYOUT_TX=<payout tx round 0>
NEXT_PUBLIC_PROOF_RISK_FLAG_TX=<risk-flag tx>
# optional: CELO_RPC_URL=<paid mainnet RPC>   (forno default works without this)
```

Then **Redeploy** (Deployments → ⋯ → Redeploy, or push a commit).

`NEXT_PUBLIC_CHAIN_ID=42220` is the one that matters most: without it the server keeps
reading Sepolia even with a mainnet contract address set.

---

## 3. Keep the cron transacting on mainnet (Track 2 — Most Activity)

GitHub repo → **Settings → Secrets and variables → Actions**:

- **Variables** tab → add `CHAMASCORE_NETWORK = mainnet`
- **Secrets** tab → (optional) add `CELO_RPC_URL` if you use a paid RPC

The workflow already reads these (`.github/workflows/agent-cron.yml`). Until the variable is
set it stays on Sepolia, so nothing breaks before the flip. After it's set, every 6-hour
pass transacts on mainnet and commits `public/agent-runs.json`. Keep funding member rounds
daily (`CONTRIBUTE_ONLY=1 DEMO_CIRCLE_ID=<ID>` then `agent:run`) so activity stays fresh
through the deadline — judges weight consistent onchain activity.

---

## 4. Verify mainnet end-to-end

```bash
# Onchain state on mainnet
CHAMASCORE_NETWORK=mainnet npm run verify:demo

# Live endpoints (expects network "celo" + the new agentId)
CHAMASCORE_NETWORK=mainnet NEXT_PUBLIC_ERC8004_AGENT_ID=<mainnet agentId> \
  CHAMASCORE_BASE_URL=https://chamascore-agent.vercel.app npm run verify:judge
```

Both must be fully green. Then open `https://chamascore-agent.vercel.app/agent.json` and
confirm `"networks": ["celo"]`, `deployment.network: "celo"`, and the mainnet `agentId`.
Open `https://8004scan.io/agents/celo/<agentId>` and confirm the agent is visible.

---

## 5. Update the submission docs to mainnet (one-shot — do last)

Replace testnet values with mainnet ones in: `SUBMISSION.md`, `JUDGE_PACKET.md`,
`SOCIAL_POST.md`, `README.md`. Specifically:
- Network: `celo-sepolia` → `celo`
- 8004scan link: `https://8004scan.io/agents/celo-sepolia/338` → `.../agents/celo/<agentId>`
- Blockscout host: `celo-sepolia.blockscout.com` → `celo.blockscout.com`
- All tx hashes + contract address → the mainnet ones from step 1
- Tracks: add `8004scan-rank` → `["best-agent", "most-activity", "8004scan-rank"]`

(Claude can do this in one pass once you paste the step-1 outputs.)

---

## 6. Register, post, submit (only you — external accounts)

1. **X/Twitter:** post the text in `SOCIAL_POST.md` (swap the 8004scan link to the mainnet
   one), tagging `@CeloDevs` + `@Celo`, `#CeloAgents`. Save the public post URL.
2. **Telegram:** confirm you're in `t.me/realworldagentshackathon`.
3. **Demo video:** record per `DEMO_SCRIPT.md` (now showing mainnet). Upload, save URL.
4. **Submit once** via the Celo Builders skill (`celo-onchain-agents`) using `SUBMISSION.md`.
   Submissions **cannot be edited after publishing** — review everything first.

**Deadline: June 15, 2026, 09:00 GMT.**

---

## Rollback / safety notes

- Nothing here touches the Sepolia deployment; it stays live as historical proof.
- If a mainnet script fails mid-way, it's idempotent enough to re-run: `demo:setup` skips
  members who already contributed, `agent:run` dedupes risk flags and only pays funded
  rounds. Re-run the same command after topping up gas/USDC.
- The app only shows mainnet after `NEXT_PUBLIC_CHAIN_ID=42220` + redeploy, so you can do
  all of step 1 before touching production.
</content>
