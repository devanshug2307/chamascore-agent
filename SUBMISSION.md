# Celo Builders Submission Draft

Use this file to fill the Celo Builders submission form. Replace every `TODO` before publishing.

## Required Fields

Project name:

```text
ChamaScore Agent
```

Tagline:

```text
Autonomous trust agent for savings circles: payouts, risk flags, and portable ERC-8004 reputation on Celo.
```

Track IDs:

```json
["best-agent"]
```

Bounty IDs:

```json
["best-agent-1st"]
```

Celo network:

```text
celo-sepolia
```

Contract addresses:

```json
["0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5"]
```

GitHub URL:

```text
https://github.com/devanshug2307/chamascore-agent
```

Demo URL:

```text
https://chamascore-agent.vercel.app
```

Video URL:

```text
N/A — no demo video. Live interactive demo at https://chamascore-agent.vercel.app and full
onchain proof (clickable Blockscout txs) in the app's "Autonomous agent runs" panel.
```

Twitter/X registration post link:

```text
https://x.com/devanshugoyal23/status/2066227659806572761
```

ERC-8004 / 8004scan link:

```text
https://8004scan.io/agents/celo-sepolia/338
```

Self Agent ID status:

```text
Completed. Self Agent ID: 74 — agent address 0x8a87EEa23aDE3B6A1894844861dc6e30D035FAcC, registered via app.ai.self.xyz (linked mode, Celo testnet) and verified on-chain, linked to operator wallet 0xE6df1c1EcC9cEe37B09172366B92a7eDc026b603.
```

## Short Description

ChamaScore Agent is an autonomous trust agent for savings circles (chamas, stokvels, susus, committees) on Celo. It watches USDC contributions on its own contract, executes rotating payouts the moment a round is funded, records onchain risk flags for late payers, and earns ERC-8004 reputation from real member wallets — turning informal savings-group behavior into portable, verifiable trust.

Live on Celo Sepolia: agent #338 on the ERC-8004 Identity Registry, with A2A and MCP endpoints so other agents can query circle trust scores directly.

## Long Description

Savings circles are already a real-world payment system. Millions of people coordinate pooled savings through WhatsApp, family groups, committees, chamas, stokvels, and susus. The hard problem is not only moving money; it is knowing who paid, who is late, whether the payout should proceed, and whether a member's reliability can travel with them to their next group.

ChamaScore Agent solves that trust layer on Celo — autonomously. Each agent pass scans every circle on the ChamaScoreCircle contract and acts onchain without human input:

1. **Executes payouts** — when a round is fully funded, the agent sends the rotating payout to the correct member (verified: 2 autonomous payouts of 1.5 USDC each on Circle 4).
2. **Flags risk** — when the majority has paid but a member is still pending, the agent records an onchain `RiskFlagRecorded` event as durable evidence (verified: round 1 risk flag, followed by the member recovering and the round completing).
3. **Earns reputation** — circle members (independent wallets, not the operator — self-rating is blocked by the registry) rate the agent on the ERC-8004 Reputation Registry: 4 ratings, average 97/100.
4. **Serves other agents** — live A2A (`/.well-known/agent-card.json`) and MCP (`/.well-known/mcp.json`, `/api/mcp`) endpoints let any agent request a live, onchain-derived trust report for a circle.

Member scores are derived from real contract history (contributions per round, risk flags), not sample data. Every agent run is logged publicly at `/agent-runs.json`, and a GitHub Actions cron keeps the agent acting on a schedule.

## Verified Onchain Proof

- Network: Celo Sepolia
- Contract: `0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5`
- Active circle ID: `4` (3 members, 0.5 USDC per round, 2 completed rounds)
- ERC-8004 agent: #338 — registration tx `0x66c4fae715acadddcf6b05a82e3bb8e93f7635293b53913102779abd4e61d422`
- Circle 4 creation tx: `0x2456fb9d981743043892200efdd25e19a9408ff4df3032666943237d88be24ab`
- USDC approval tx: `0x05bb548239750b97f13c6661f5dd81fa140a3dbfcf568895ac2e9886c4cb9031`
- Contribution tx: `0x01da3da0640490f6c3ca0073f9b7d10c4d1146e955df27bb02408158d3aca705`
- Autonomous payout (round 0): `0xcd50eb7e89869bfd1204f3d07d1f0cfd096fd9724ad416897be6776356dfc52f`
- Autonomous risk flag (round 1): `0xe29aedb6135c3f89c76e8bb378191abd98eec3f5f8e538a459320e7ae0586775`
- Autonomous payout (round 1): `0x9075de0f2c0d1da02d3d913eb4ad51ed75eaf6d149274b61b6df7d9ac73c99ed`
- Member feedback on Reputation Registry (`0x8004B663056A597Dffe9eCcC1965A193B7388713`): 4 ratings, average 97
- Agent endpoints: `/agent.json`, `/.well-known/agent-card.json`, `/.well-known/mcp.json`, `/api/mcp`, `/api/a2a`, `/api/agent/report`, `/api/agent/actions`, `/api/agent/onchain-proof`, `/agent-runs.json`

## Why It Fits The Judging Criteria

Ecosystem alignment:

ChamaScore is built around Celo's core strength: low-cost, stablecoin-based real-world payments. It targets MiniPay-compatible savings-circle behavior rather than generic AI chat.

Onchain activity:

The agent itself transacts: autonomous payouts, onchain risk flags, plus member contributions, USDC approvals, circle creation, ERC-8004 registration, and independent member feedback transactions — 25+ real transactions across the demo lifecycle, with a GitHub Actions cron continuing runs every 6 hours.

Real-world utility:

Savings circles already exist. ChamaScore makes contribution history auditable, payout execution trustless-by-default, and reliability portable across groups via ERC-8004.

Verification:

Registered as ERC-8004 agent #338 with reputation earned from independent member wallets (the registry blocks operator self-rating). A2A and MCP endpoints are live for agent-to-agent verification. Self Agent ID 74 completed and verified on-chain (agent address `0x8a87EEa23aDE3B6A1894844861dc6e30D035FAcC`, linked to the operator wallet).

## Final Publish Checklist

- [x] Public GitHub repo exists.
- [x] `README.md` shows setup, contract address, and transaction proof.
- [x] Demo URL is public.
- [x] Circle 4 full lifecycle recorded: creation, approvals, contributions, autonomous payouts, risk flag.
- [x] ERC-8004 registration + member feedback (4 ratings, avg 97).
- [x] A2A + MCP endpoints implemented.
- [x] Pushed to GitHub and Vercel redeployed (env vars updated).
- [x] Live endpoints verified on production (14/14 judge checks pass).
- [x] X/Twitter registration post is public and linked. (https://x.com/devanshugoyal23/status/2066227659806572761)
- [ ] Telegram group joined: `https://t.me/realworldagentshackathon`
- [ ] Submission is reviewed once before publishing.

High-impact but not platform-minimum:

- [ ] Demo video is uploaded.
- [x] Self Agent ID completed (ID 74, agent address `0x8a87EEa23aDE3B6A1894844861dc6e30D035FAcC`).
- [x] GitHub Actions cron enabled (`CHAMASCORE_PRIVATE_KEY` secret set in repo).
