# ChamaScore Agent

ChamaScore is a Celo onchain agent for savings-circle trust, contribution scoring, and payout oversight.

The project pivots away from being another chama/stokvel custody app. It is the portable reliability layer: the agent reads contribution behavior, scores members, flags late payers, prepares payout actions, and produces reputation evidence for ERC-8004/8004scan.

## Hackathon Fit

- Hackathon: `celo-onchain-agents`
- Primary track: `best-agent`
- Optional later track: `8004scan-rank`, only after the agent is registered and visible on 8004scan
- Skipped track for now: `most-activity`, unless the project has many legitimate repeated workflow transactions
- Verified network: Celo Sepolia
- MiniPay tokens: USDm, USDC, USDT only
- Submission-required social link: public X/Twitter registration post tagging `@CeloDevs` and `@Celo`

## Current Celo Sepolia Demo

- Contract: `0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5`
- Active circle ID: `2`
- Token: USDC, `0x01C5C0122039549AD1493B8220cABEdD739BC44E`
- Contribution amount: `0.5 USDC`
- Circle creation tx: `0xb662ae355bb0d7f23da82b8014adcb90726ea9803c58603d77af0c4aa9c72276`
- USDC approval tx: `0x4993feda85b6668fcaff9a297d96692a14cbe121f8415905efba401d15ad8067`
- Contribution tx: `0xbbc9525edb99a84c8aab79bbcb19e637d747df703757913e0f90c937baa2f258`
- Verified state: `hasContributed(2, 0, 0xE6df1c1EcC9cEe37B09172366B92a7eDc026b603) = true`

## What Is Built

- Mobile-first Next.js app for the savings-circle workflow
- Agent scoring engine for member reliability and payout readiness
- MiniPay/Celo wallet detection and stablecoin transaction preparation
- Agent metadata endpoint at `/agent.json`
- Report API at `/api/agent/report`
- Solidity contract for contributions, payouts, and risk-flag events
- Contract compiler script using `solc`

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Contract Compile

```bash
npm run compile:contracts
```

The ABI and bytecode are written to `artifacts/`.

## Verify The Demo State

```bash
npm run verify:demo
```

The verification script reads Celo Sepolia and checks that Circle `2` is active, uses the Celo Sepolia USDC token, and has a confirmed `0.5 USDC` contribution from the demo wallet.

## Deployment Notes

Set these after deploying the contract:

```bash
NEXT_PUBLIC_CHAMASCORE_CONTRACT=0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5
NEXT_PUBLIC_CHAMASCORE_CIRCLE_ID=2
NEXT_PUBLIC_CHAMASCORE_USDC=0x01C5C0122039549AD1493B8220cABEdD739BC44E
```

The app then prepares two transactions for MiniPay/Celo wallets:

1. ERC-20 `approve(contract, contributionAmount)`
2. `ChamaScoreCircle.contribute(circleId)`

If the Circle Faucet is rate-limited, use the existing Celo Sepolia USDC demo state above instead of creating more circles.

## Celo Builders Submission Checklist

- Live demo URL
- GitHub repo URL
- Demo video URL
- ERC-8004 / 8004scan agent link
- Self Agent ID, or screenshot showing unsupported region/device if blocked
- Celo network: `celo-sepolia`
- Contract address
- Public X/Twitter registration post link
- Short explanation of how the coding agent helped build the project

## Why This Can Win

Judges want ecosystem alignment, consistent onchain activity, real-world utility, and verification. ChamaScore is built around those signals:

- It targets real savings-circle behavior already coordinated through trust and WhatsApp.
- It creates legitimate repeated transactions: contributions, payouts, risk flags, reports, and feedback.
- It keeps the agent role visible: observe, score, flag, recommend, and prepare actions.
- It avoids regulated lending, yield, insurance, and remittance claims.
