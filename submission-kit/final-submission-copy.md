# Final Submission Copy

Use this as the source of truth when filling Celo Builders.

## Fields

Project name:

```text
ChamaScore Agent
```

Tagline:

```text
Portable trust scoring and payment intelligence for MiniPay savings circles.
```

Tracks:

```json
["best-agent"]
```

Bounties:

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
TODO_DEMO_VIDEO_URL
```

Social link:

```text
TODO_PUBLIC_X_POST_URL
```

## Description

ChamaScore Agent turns savings-circle payment history into portable trust on Celo. It helps chamas, stokvels, susus, committees, and family savings groups track stablecoin contributions, identify late or risky members, prepare payout decisions, and produce reputation evidence.

The demo is live on Celo Sepolia: Circle `3` was created with public agent metadata at `https://chamascore-agent.vercel.app/agent.json`, uses Celo Sepolia USDC, and records contribution and risk-flag evidence onchain. The agent UI reads the circle configuration, scores member reliability, flags payment risk, exposes `/agent.json` metadata, provides `/api/agent/report`, returns encoded transactions from `/api/agent/actions`, and verifies live Celo state from `/api/agent/onchain-proof`.

## Onchain Proof

- Contract: `https://celo-sepolia.blockscout.com/address/0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5`
- Circle 3 creation: `https://celo-sepolia.blockscout.com/tx/0xb92cad2604b08f8b65324ee05f4ecff59c0c05d905ac6ac06e3c1ac25a5b12c1`

## Agent Contribution Notes

Codex helped research the Celo Onchain Agents Hackathon, compare project directions, pivot the project from a generic savings-circle app into ChamaScore, implement the Next.js agent UI, build the Solidity contribution contract, guide Celo Sepolia deployment and transactions, verify onchain state, and prepare the submission materials.
