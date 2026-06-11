# Judge Packet

This is the fast-read proof file for judges.

## What ChamaScore Does

ChamaScore Agent turns savings-circle contribution behavior into portable trust on Celo. It scores member reliability, flags late or risky payers, prepares payout recommendations, and creates onchain evidence that can feed ERC-8004 reputation.

## Why It Matters

Savings circles already exist across chamas, stokvels, susus, committees, and family groups. The recurring pain is trust: missed contributions, unclear payout readiness, opaque ledgers, and no portable reliability history. ChamaScore makes that behavior auditable and reusable.

## Working Demo State

- App: `https://chamascore-agent.vercel.app`
- Agent metadata: `/agent.json`
- Agent report API: `/api/agent/report`
- Encoded actions API: `/api/agent/actions`
- Live onchain proof API: `/api/agent/onchain-proof`
- Network: Celo Sepolia
- Contract: `0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5`
- Active circle: `2`
- Token: USDC, `0x01C5C0122039549AD1493B8220cABEdD739BC44E`
- Contribution: `0.5 USDC`

## Onchain Receipts

Use Celo Sepolia Blockscout:

- Contract address: `https://celo-sepolia.blockscout.com/address/0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5`
- Circle 2 creation: `https://celo-sepolia.blockscout.com/tx/0xb662ae355bb0d7f23da82b8014adcb90726ea9803c58603d77af0c4aa9c72276`
- USDC approval: `https://celo-sepolia.blockscout.com/tx/0x4993feda85b6668fcaff9a297d96692a14cbe121f8415905efba401d15ad8067`
- USDC contribution: `https://celo-sepolia.blockscout.com/tx/0xbbc9525edb99a84c8aab79bbcb19e637d747df703757913e0f90c937baa2f258`

Verified state:

```text
hasContributed(2, 0, 0xE6df1c1EcC9cEe37B09172366B92a7eDc026b603) = true
roundTotal(2, 0) = 0.5 USDC
```

## Hackathon Criteria Mapping

Ecosystem alignment:

- Built on Celo.
- Uses Celo Sepolia and Celo stablecoin rails.
- Designed for MiniPay-style small payments.

Onchain activity:

- Circle creation transaction confirmed.
- USDC approval transaction confirmed.
- Contribution transaction confirmed.
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

- Public app URL is live: `https://chamascore-agent.vercel.app`
- Fresh circle with public `/agent.json` metadata URI still needed after deployment.
- Public GitHub repo is live: `https://github.com/devanshug2307/chamascore-agent`
- Demo video still needed.
- X/Twitter registration post still needed.
- Optional risk-flag transaction should be recorded if gas is available.
- ERC-8004/8004scan link still needed, or this should be omitted from the selected tracks.
- Self Agent ID or unsupported-region screenshot still needed.

Local verification:

```bash
npm run verify:demo
npm run verify:judge
```
