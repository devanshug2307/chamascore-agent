# Judge Packet

This is the fast-read proof file for judges.

## What ChamaScore Does

ChamaScore Agent turns savings-circle contribution behavior into portable trust on Celo. It scores member reliability, flags late or risky payers, prepares payout recommendations, and creates onchain evidence that can feed ERC-8004 reputation.

## Why It Matters

Savings circles already exist across chamas, stokvels, susus, committees, and family groups. The recurring pain is trust: missed contributions, unclear payout readiness, opaque ledgers, and no portable reliability history. ChamaScore makes that behavior auditable and reusable.

## Working Demo State

- App: `https://chamascore-agent.vercel.app`
- Agent metadata: `/agent.json` (public URL: `https://chamascore-agent.vercel.app/agent.json`)
- Agent report API: `/api/agent/report`
- Encoded actions API: `/api/agent/actions`
- Live onchain proof API: `/api/agent/onchain-proof`
- Network: Celo Sepolia
- Contract: `0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5`
- Active circle: `3`
- Token: USDC, `0x01C5C0122039549AD1493B8220cABEdD739BC44E`
- Contribution: `0.5 USDC`

## Onchain Receipts

Use Celo Sepolia Blockscout:

- Contract address: `https://celo-sepolia.blockscout.com/address/0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5`
- Circle 3 creation: `https://celo-sepolia.blockscout.com/tx/0xb92cad2604b08f8b65324ee05f4ecff59c0c05d905ac6ac06e3c1ac25a5b12c1`
- Legacy Circle 2 approval: `https://celo-sepolia.blockscout.com/tx/0x4993feda85b6668fcaff9a297d96692a14cbe121f8415905efba401d15ad8067`
- Legacy Circle 2 contribution: `https://celo-sepolia.blockscout.com/tx/0xbbc9525edb99a84c8aab79bbcb19e637d747df703757913e0f90c937baa2f258`

After Circle 3 txs complete, add approval, contribution, and risk-flag links from `npm run complete:circle3` or the live app.

## Hackathon Criteria Mapping

Ecosystem alignment:

- Built on Celo.
- Uses Celo Sepolia and Celo stablecoin rails.
- Designed for MiniPay-style small payments.

Onchain activity:

- Circle 3 creation transaction confirmed with public metadata URI.
- USDC approval, contribution, and risk-flag txs on Circle 3 complete the judge packet.
- Contract supports contribution, payout, and risk-flag events.
- App exposes encoded `recordRiskFlag` actions for late-payer reputation evidence.

Real-world utility:

- Focuses on savings circles, a real recurring payment behavior.
- Solves trust and payout-readiness problems.
- Avoids overclaiming regulated lending, yield, remittance, or insurance.

Verification:

- Prepared for ERC-8004 / 8004scan agent registration.
- Self Agent ID should be completed if region/device support allows.

## Strongest Demo Narrative

"ChamaScore is not trying to replace a savings circle. It gives the group an agent that reads payment behavior and makes the trust state clear. The money movement is on Celo; the agent converts the history into a score, a risk report, and eventually portable reputation."

## Remaining Submission Risks

These require the builder's external accounts:

- Circle 3 contribution and risk-flag txs if not yet recorded.
- Vercel env vars for Circle 3 proof tx hashes.
- Demo video.
- X/Twitter registration post.
- ERC-8004/8004scan link optional.
- Self Agent ID or unsupported-region screenshot optional.

Local verification:

```bash
npm run verify:demo
CHAMASCORE_BASE_URL=https://chamascore-agent.vercel.app npm run verify:judge
```
