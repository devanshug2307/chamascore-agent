# Celo Builders Submission Draft

Use this file to fill the Celo Builders submission form. Replace every `TODO` before publishing.

## Required Fields

Project name:

```text
ChamaScore Agent
```

Tagline:

```text
Portable trust scoring and payment intelligence for MiniPay savings circles.
```

Track IDs:

```json
["best-agent"]
```

Add `8004scan-rank` only after the ERC-8004 / 8004scan link exists. Do not add `most-activity` unless the project has many legitimate repeated transactions; a few demo transactions are not enough for that prize.

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
TODO: add deployed app URL or stable tunnel URL
```

Video URL:

```text
TODO: add demo video URL
```

Twitter/X registration post link:

```text
TODO: add public x.com/twitter.com post URL
```

ERC-8004 / 8004scan link:

```text
TODO: add registry or 8004scan agent URL
```

Self Agent ID status:

```text
TODO: add Self Agent ID link, or attach unsupported-region screenshot if Self is unavailable.
```

## Short Description

ChamaScore Agent turns savings-circle payment history into portable trust on Celo. It helps chamas, stokvels, susus, committees, and family savings groups track stablecoin contributions, identify late or risky members, prepare payout decisions, and produce reputation evidence that can be published to ERC-8004/8004scan.

The demo is live on Celo Sepolia: a ChamaScore circle was created with USDC, the wallet approved `0.5 USDC`, and a contribution was confirmed onchain. The agent UI reads the circle configuration, scores members by reliability, flags payment risk, exposes `/agent.json` metadata, and provides an `/api/agent/report` endpoint for the latest trust report.

## Long Description

Savings circles are already a real-world payment system. Millions of people coordinate pooled savings through WhatsApp, family groups, committees, chamas, stokvels, and susus. The hard problem is not only moving money; it is knowing who paid, who is late, whether the payout should proceed, and whether a member's reliability can travel with them to their next group.

ChamaScore Agent solves that trust layer on Celo. It combines a Celo stablecoin contribution contract with an agent that interprets member behavior and turns each round into a readable trust signal. The agent watches contribution status, calculates reliability scores, flags late or risky members, prepares next actions, and exposes metadata/report endpoints that make the agent inspectable by judges, wallets, and future ERC-8004 reputation tooling.

For the hackathon demo, ChamaScore is deployed on Celo Sepolia using USDC. Circle `2` accepts `0.5 USDC` contributions. The demo wallet has already approved and contributed through MetaMask on Celo Sepolia, creating real onchain activity instead of a mocked payment flow.

## Verified Onchain Proof

- Network: Celo Sepolia
- Contract: `0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5`
- Active circle ID: `2`
- Token: USDC, `0x01C5C0122039549AD1493B8220cABEdD739BC44E`
- Contribution amount: `0.5 USDC`
- Circle creation tx: `0xb662ae355bb0d7f23da82b8014adcb90726ea9803c58603d77af0c4aa9c72276`
- USDC approval tx: `0x4993feda85b6668fcaff9a297d96692a14cbe121f8415905efba401d15ad8067`
- Contribution tx: `0xbbc9525edb99a84c8aab79bbcb19e637d747df703757913e0f90c937baa2f258`
- Verified state: `hasContributed(2, 0, user) = true`, `roundTotal(2, 0) = 0.5 USDC`

## Why It Fits The Judging Criteria

Ecosystem alignment:

ChamaScore is built around Celo's core strength: low-cost, stablecoin-based real-world payments. It targets MiniPay-compatible savings-circle behavior rather than generic AI chat.

Onchain activity:

The demo creates real Celo Sepolia transactions: circle creation, USDC approval, contribution, and future risk/payout events. The project can naturally generate repeated activity because every savings round produces contribution and payout events.

Real-world utility:

Savings circles already exist. ChamaScore makes contribution history auditable, payout readiness legible, and reliability portable across groups.

Verification:

The project is prepared for ERC-8004/8004scan and Self Agent ID. If Self is unavailable in the builder's region, the submission should include the required unsupported-region screenshot.

## Agent Contribution Notes

Codex helped research the hackathon, compare project directions, identify the differentiation risk around plain ChamaAgent-style savings circles, pivot the project to ChamaScore, implement the Next.js app, build the Solidity contract, configure Celo Sepolia transactions, verify onchain state, and prepare the final submission materials.

## Final Publish Checklist

- [ ] Public GitHub repo exists.
- [ ] `README.md` shows setup, contract address, and transaction proof.
- [ ] Demo URL is public.
- [ ] X/Twitter registration post is public and linked.
- [ ] Telegram group joined: `https://t.me/realworldagentshackathon`
- [ ] Submission is reviewed once before publishing.

High-impact but not platform-minimum:

- [ ] Demo video is uploaded.
- [ ] ERC-8004 / 8004scan link added, or clearly explained if blocked.
- [ ] Self Agent ID completed, or unsupported-region screenshot attached.
