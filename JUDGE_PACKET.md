# Judge Packet

This is the fast-read proof file for judges.

## What ChamaScore Does

ChamaScore Agent is an autonomous trust agent for savings circles on Celo. It watches USDC contributions on its own contract, executes rotating payouts when rounds are funded, records onchain risk flags for late payers, and earns ERC-8004 reputation from independent member wallets — turning savings-group behavior into portable, verifiable trust.

## Why It Matters

Savings circles already exist across chamas, stokvels, susus, committees, and family groups. The recurring pain is trust: missed contributions, unclear payout readiness, opaque ledgers, and no portable reliability history. ChamaScore makes that behavior auditable, automated, and reusable.

## Working Demo State

- App: `https://chamascore-agent.vercel.app`
- ERC-8004 agent: #338 — `https://8004scan.io/agents/celo-sepolia/338`
- A2A agent card: `/.well-known/agent-card.json` (JSON-RPC `message/send` at `/api/a2a`)
- MCP server: `/.well-known/mcp.json` → `/api/mcp` (tools: `get_circle_report`, `get_onchain_proof`, `get_agent_info`)
- ERC-8004 registration file: `/agent.json`
- Public agent-run log: `/agent-runs.json`
- Legacy REST: `/api/agent/report`, `/api/agent/actions`, `/api/agent/onchain-proof`
- Network: Celo Sepolia
- Contract: `0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5`
- Active circle: `4` (3 members, 0.5 USDC per round, 2 completed rounds)

## Onchain Receipts

Celo Sepolia Blockscout:

- Contract: `https://celo-sepolia.blockscout.com/address/0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5`
- ERC-8004 registration: `https://celo-sepolia.blockscout.com/tx/0x66c4fae715acadddcf6b05a82e3bb8e93f7635293b53913102779abd4e61d422`
- Circle 4 creation: `https://celo-sepolia.blockscout.com/tx/0x2456fb9d981743043892200efdd25e19a9408ff4df3032666943237d88be24ab`
- USDC approval: `https://celo-sepolia.blockscout.com/tx/0x05bb548239750b97f13c6661f5dd81fa140a3dbfcf568895ac2e9886c4cb9031`
- Contribution: `https://celo-sepolia.blockscout.com/tx/0x01da3da0640490f6c3ca0073f9b7d10c4d1146e955df27bb02408158d3aca705`
- **Autonomous payout (round 0)**: `https://celo-sepolia.blockscout.com/tx/0xcd50eb7e89869bfd1204f3d07d1f0cfd096fd9724ad416897be6776356dfc52f`
- **Autonomous risk flag (round 1)**: `https://celo-sepolia.blockscout.com/tx/0xe29aedb6135c3f89c76e8bb378191abd98eec3f5f8e538a459320e7ae0586775`
- **Autonomous payout (round 1)**: `https://celo-sepolia.blockscout.com/tx/0x9075de0f2c0d1da02d3d913eb4ad51ed75eaf6d149274b61b6df7d9ac73c99ed`
- Member reputation (4 ratings, avg 97): Reputation Registry `https://celo-sepolia.blockscout.com/address/0x8004B663056A597Dffe9eCcC1965A193B7388713`

## Verify Everything In Two Commands

```bash
CHAMASCORE_BASE_URL=https://chamascore-agent.vercel.app npm run verify:judge   # 14 endpoint checks
npm run verify:demo                                                            # live onchain state
```

## Hackathon Criteria Mapping

Ecosystem alignment:

- Built on Celo stablecoin rails (USDC, Celo Sepolia), designed for MiniPay-style small payments.
- Targets real-world savings-group payments, not generic AI chat.

Onchain activity:

- The agent itself transacts: 2 autonomous payouts + 1 autonomous risk flag, plus circle creation, approvals, contributions, ERC-8004 registration, and 4 independent member-feedback transactions.
- GitHub Actions cron continues agent passes every 6 hours; every run logged publicly.

Real-world utility:

- Savings circles are a real recurring payment behavior used by millions.
- Solves trust, payout execution, and portable reliability.
- Avoids overclaiming regulated lending, yield, remittance, or insurance.

Verification:

- ERC-8004 agent #338 with reputation earned from non-operator wallets (self-rating blocked by the registry).
- Live A2A + MCP endpoints for agent-to-agent verification.
- Self Agent ID 74 completed and verified on-chain (agent address `0x8a87EEa23aDE3B6A1894844861dc6e30D035FAcC`, linked to the operator wallet via app.ai.self.xyz).

## Strongest Demo Narrative

"ChamaScore is not trying to replace a savings circle. It gives the group an agent that moves the money when the round is ready, flags trouble onchain when it appears, and converts the history into portable reputation. The payments are on Celo; the trust now is too."

## Remaining Submission Items

Done: Vercel env updated + redeployed, GitHub cron secret set (cron verified end-to-end), Self Agent ID 74 verified.

Still require the builder's external accounts:

- Demo video.
- X/Twitter registration post.
