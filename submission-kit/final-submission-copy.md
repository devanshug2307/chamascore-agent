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
TODO_PUBLIC_DEMO_URL
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

The demo is live on Celo Sepolia: Circle `2` was created with Celo Sepolia USDC, the wallet approved `0.5 USDC`, and a contribution was confirmed onchain. The agent UI reads the circle configuration, scores member reliability, flags payment risk, exposes `/agent.json` metadata, provides `/api/agent/report`, returns encoded wallet actions from `/api/agent/actions`, and verifies live Celo state from `/api/agent/onchain-proof`.

## Onchain Proof

- Contract: `https://celo-sepolia.blockscout.com/address/0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5`
- Circle creation: `https://celo-sepolia.blockscout.com/tx/0xb662ae355bb0d7f23da82b8014adcb90726ea9803c58603d77af0c4aa9c72276`
- USDC approval: `https://celo-sepolia.blockscout.com/tx/0x4993feda85b6668fcaff9a297d96692a14cbe121f8415905efba401d15ad8067`
- USDC contribution: `https://celo-sepolia.blockscout.com/tx/0xbbc9525edb99a84c8aab79bbcb19e637d747df703757913e0f90c937baa2f258`

## Agent Contribution Notes

Codex helped research the Celo Onchain Agents Hackathon, compare project directions, pivot the project from a generic savings-circle app into ChamaScore, implement the Next.js agent UI, build the Solidity contribution contract, guide Celo Sepolia deployment and transactions, verify onchain state, and prepare the submission materials.
