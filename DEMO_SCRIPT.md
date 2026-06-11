# ChamaScore Demo Script

Target length: 2 minutes 30 seconds.

## 0:00-0:15 - Open With The Problem

"This is ChamaScore Agent, an autonomous Celo agent for savings-circle trust. Chamas, stokvels, susus, and family savings groups already move money together, but trust breaks when members pay late, treasurers keep opaque records, or payout readiness is unclear."

## 0:15-0:40 - Show The App + Autonomous Runs

Show `https://chamascore-agent.vercel.app`. Point at the **Autonomous agent runs** panel.

"The app shows a live savings circle on Celo Sepolia. And this panel is the key: every entry is a real transaction the agent signed and sent on its own. It executed this round's payout the moment the circle was funded, and it recorded an onchain risk flag when a member fell behind. No human clicked anything."

Click one payout card → Blockscout opens with the agent's transaction.

## 0:40-1:00 - The Lifecycle Story

"Circle 4 ran two full rounds. Round 0: three members contributed 0.5 USDC each, the agent detected the funded round and paid out 1.5 USDC to the first member in rotation. Round 1: one member went late — the agent recorded a risk flag onchain as durable evidence — then the member recovered, and the agent executed the next payout."

Proof to show (Blockscout):

- Autonomous payout: `0xcd50eb7e89869bfd1204f3d07d1f0cfd096fd9724ad416897be6776356dfc52f`
- Autonomous risk flag: `0xe29aedb6135c3f89c76e8bb378191abd98eec3f5f8e538a459320e7ae0586775`

## 1:00-1:25 - ERC-8004 Reputation

Show `https://8004scan.io/agents/celo-sepolia/338`.

"ChamaScore is agent #338 on the ERC-8004 Identity Registry. Its reputation is independently earned: circle members rated it from their own wallets on the Reputation Registry — the registry blocks operator self-rating. Four ratings, average 97 out of 100."

## 1:25-1:50 - Agent-to-Agent Endpoints

Open `/.well-known/agent-card.json`, then run the A2A query (or show the MCP descriptor).

"Other agents can use ChamaScore directly. It serves a live A2A agent card and an MCP server — any LLM or agent can ask for a trust report on a circle and get scores derived from real onchain history, not sample data."

## 1:50-2:10 - Why Celo

"Celo is the right home because this is a real-world payments workflow: small stablecoin contributions, low fees, mobile-first UX. MiniPay gives this a natural distribution path — and ChamaScore makes the reliability inside those groups portable."

## 2:10-2:30 - Close

"The agent observes, scores, flags, pays out, and earns reputation — all onchain, all verifiable. Savings circles are how millions already save. ChamaScore gives that trust a ledger."

## Recording Rules

- Keep the video under 3 minutes.
- Show the actual app first, not slides.
- Click into at least one autonomous transaction on Blockscout.
- Do not say "guaranteed winner."
- Say "working Celo Sepolia demo" instead of "production-ready."
