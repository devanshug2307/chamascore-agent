# ChamaScore Winning Upgrade Plan

Generated: June 11, 2026

This plan is based on `onchain-agents-hackathon.md`, the live Celo Builders endpoints, and the current ChamaScore build.

## Best Strategy

Do not pivot away from ChamaScore. The strongest category in the hackathon brief is consumer money for emerging-market retail users, and the best fit inside that category is the Chama/Stokvel Agent idea. ChamaScore already owns the best wedge: savings-circle trust, late-payer risk, payout readiness, and portable reputation.

The winning version should feel like:

```text
ChamaScore is the trust and reputation agent for Celo savings-circle payments.
It reads real stablecoin contribution behavior, decides when payout should be held,
records risk flags onchain, and turns each round into portable reputation evidence.
```

## What We Added Today

- Aligned demo data with the actual deployed Circle `2`.
- Added member proof status to the trust table.
- Added `recordRiskFlag` transaction encoding and wallet action.
- Added `/api/agent/actions` for encoded approve, contribute, and risk-flag transactions.
- Added `/api/agent/onchain-proof` for live Celo Sepolia reads.
- Strengthened `/api/agent/report` with risk flags, payout decision, recommended transactions, proof links, and score policy.
- Added `npm run verify:judge` to check metadata, report, actions, live proof, contribution state, and public metadata readiness.

## Highest-Impact Remaining Steps

1. Deploy the app to a public URL.
2. Set `NEXT_PUBLIC_AGENT_METADATA_URL=https://chamascore-agent.vercel.app/agent.json`.
3. Create a fresh Celo Sepolia circle after deployment so `metadataURI` is public, not `localhost`.
4. Record one risk-flag transaction from the app for the late/risky member.
5. Record a short demo video showing:
   - app first screen
   - `/agent.json`
   - `/api/agent/report`
   - `/api/agent/actions`
   - `/api/agent/onchain-proof`
   - Blockscout receipts
6. Publish the required X/Twitter post tagging `@CeloDevs` and `@Celo`.
7. Try ERC-8004 / 8004scan registration.
8. Try Self Agent ID, or capture the unsupported-region screenshot if blocked.

## Improvements Borrowed From The Hackathon Idea List

Chama/Stokvel Agent:

- Keep the savings-circle focus.
- Show contribution, late-payer risk, payout hold, and payout readiness.
- Add Self/anti-ghost-member story.

Sybil-Resistant Airdrop / Quest Agent:

- Use verification as a trust primitive.
- Treat Self as prize-helpful, not required unless available.

Bill Pay & Autopay Agent:

- Make the agent decision obvious: hold payout until funding is complete.
- Show scheduled/repeated payment behavior.

Remittance / FX Agent:

- Do not pivot into remittance.
- Optional later: add a Mento/local-currency display for contribution value.

Onchain Tax / Portfolio Agent:

- Make receipts and proof inspectable.
- The report/actions/proof APIs are the judge-readable evidence layer.

## Track Choice

Submit now:

```json
["best-agent"]
```

Add only if completed:

```json
["8004scan-rank"]
```

Skip unless real activity is much higher:

```json
["most-activity"]
```

## Probability

No one can guarantee a win.

Current state after this upgrade but before public deploy/video/social:

- Any prize: about 18-25%
- First place: about 5-8%

After public deployment, fresh public-metadata circle, risk-flag tx, demo video, X post, and clean Celo Builders submission:

- Any prize: about 35-50%
- First place: about 10-18%

The biggest multiplier is not more UI. It is public verifiability: public app, public metadata URI, onchain risk flag, video, Self/8004scan where possible.
