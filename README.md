# ChamaScore Agent

ChamaScore is an autonomous Celo onchain agent for savings-circle trust. It watches USDC contributions on its own contract, **executes rotating payouts on its own**, **records onchain risk flags** for late payers, and **earns ERC-8004 reputation from real member wallets** — turning chama/stokvel/susu payment behavior into portable, verifiable trust.

It is not another custody app. It is the portable reliability layer for the savings groups millions of people already run on WhatsApp.

## Live Proof (Celo Sepolia)

| What | Where |
| --- | --- |
| ERC-8004 agent | [#338 on 8004scan](https://8004scan.io/agents/celo-sepolia/338) — registration tx [`0x66c4...d422`](https://celo-sepolia.blockscout.com/tx/0x66c4fae715acadddcf6b05a82e3bb8e93f7635293b53913102779abd4e61d422) |
| Circle contract | [`0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5`](https://celo-sepolia.blockscout.com/address/0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5) |
| Active circle | #4 — 3 members, 0.5 USDC per round, 2 completed rounds |
| Autonomous payout (round 0) | [`0xcd50...c52f`](https://celo-sepolia.blockscout.com/tx/0xcd50eb7e89869bfd1204f3d07d1f0cfd096fd9724ad416897be6776356dfc52f) |
| Autonomous risk flag (round 1) | [`0xe29a...6775`](https://celo-sepolia.blockscout.com/tx/0xe29aedb6135c3f89c76e8bb378191abd98eec3f5f8e538a459320e7ae0586775) |
| Autonomous payout (round 1) | [`0x9075...99ed`](https://celo-sepolia.blockscout.com/tx/0x9075de0f2c0d1da02d3d913eb4ad51ed75eaf6d149274b61b6df7d9ac73c99ed) |
| Member reputation | 4 ratings, avg **97/100** on the [Reputation Registry](https://celo-sepolia.blockscout.com/address/0x8004B663056A597Dffe9eCcC1965A193B7388713) — from independent member wallets (operator self-rating is blocked) |
| Live demo | https://chamascore-agent.vercel.app |

## How the Agent Acts

Each pass (`npm run agent:run`, also on a 6-hour GitHub Actions cron) scans every circle on the contract and decides onchain:

1. **Round fully funded → execute payout.** Sends the pooled USDC to the rotating recipient (`members[round % n]`).
2. **Majority paid, someone pending → record risk flag.** Emits a durable `RiskFlagRecorded` event as reputation evidence (deduped against past flags).
3. **Log everything.** Every run is written to `artifacts/agent-runs/` and served publicly at [`/agent-runs.json`](https://chamascore-agent.vercel.app/agent-runs.json).

Member scores in the app are derived from real contract history (contributions per round, risk flags) — not sample data.

## Agent-to-Agent Endpoints

Other agents can query ChamaScore directly:

- **A2A** (protocol 0.3.0): [`/.well-known/agent-card.json`](https://chamascore-agent.vercel.app/.well-known/agent-card.json) → JSON-RPC `message/send` at `/api/a2a` (ask about any circle, e.g. "score circle 4")
- **MCP** (Streamable HTTP): [`/.well-known/mcp.json`](https://chamascore-agent.vercel.app/.well-known/mcp.json) → `/api/mcp` with tools `get_circle_report`, `get_onchain_proof`, `get_agent_info`
- **ERC-8004 registration file**: [`/agent.json`](https://chamascore-agent.vercel.app/agent.json)
- Legacy REST: `/api/agent/report`, `/api/agent/actions`, `/api/agent/onchain-proof`

## Local Development

```bash
npm install
npm run dev        # app on http://localhost:3000
npm run typecheck
npm run lint
```

## Running the Agent

```bash
# .env.local needs CHAMASCORE_PRIVATE_KEY (agent operator wallet)
npm run agent:run        # one autonomous pass: scan, payout, flag, log
```

Demo lifecycle scripts:

```bash
npm run demo:setup       # generate+fund member wallets, create circle, everyone contributes
CONTRIBUTE_ONLY=1 DEMO_CIRCLE_ID=4 npm run demo:setup            # fund the next round
CONTRIBUTE_ONLY=1 DEMO_CIRCLE_ID=4 SKIP_MEMBERS=member-2 npm run demo:setup  # simulate a late payer
npm run demo:feedback    # member wallets rate the agent on the ERC-8004 Reputation Registry
```

Member wallets are stored in `demo-members.local.json` (gitignored).

## Contract

`contracts/ChamaScoreCircle.sol` — circles, USDC contributions, rotating payouts (`executePayout`), and onchain risk-flag events (`recordRiskFlag`).

```bash
npm run compile:contracts   # ABI + bytecode -> artifacts/
```

## Verification Scripts

```bash
npm run verify:demo                                            # onchain state checks
CHAMASCORE_BASE_URL=https://chamascore-agent.vercel.app npm run verify:judge   # endpoint checks
```

## Deployment Notes

Defaults are baked in for the current demo (Circle 4 + proof txs). Override with:

```bash
NEXT_PUBLIC_CHAMASCORE_CONTRACT=0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5
NEXT_PUBLIC_CHAMASCORE_CIRCLE_ID=4
NEXT_PUBLIC_CHAMASCORE_USDC=0x01C5C0122039549AD1493B8220cABEdD739BC44E
NEXT_PUBLIC_AGENT_METADATA_URL=https://chamascore-agent.vercel.app/agent.json
NEXT_PUBLIC_ERC8004_AGENT_ID=338
```

For the GitHub Actions cron, set repo secrets `CHAMASCORE_PRIVATE_KEY` (and optionally `CELO_SEPOLIA_RPC_URL`).

## Hackathon Fit

- Hackathon: `celo-onchain-agents` — tracks `best-agent`, `most-activity`
- Network: Celo Sepolia (USDC)
- Judging signals: Celo real-world payments alignment, consistent autonomous onchain activity, genuine utility for existing savings groups, ERC-8004 + Self verification
- Submission docs: [`SUBMISSION.md`](SUBMISSION.md), [`SOCIAL_POST.md`](SOCIAL_POST.md), [`JUDGE_PACKET.md`](JUDGE_PACKET.md)
