# Required-Only Submission Checklist

This is the lean path. Do these before publishing on Celo Builders.

Deadline: **June 15, 2026 at 09:00 GMT** / **June 15, 2026 at 14:30 IST**.

Required hackathon social field: public X/Twitter post URL from `x.com` or `twitter.com`.

## Already Done Locally

- App exists locally at `http://localhost:3000` and publicly at `https://chamascore-agent.vercel.app`.
- Agent metadata exists at `/agent.json`.
- Agent report API exists at `/api/agent/report`.
- Celo Sepolia contract is deployed: `0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5`.
- Demo circle exists: Circle `2`.
- Confirmed onchain proof exists: circle creation, USDC approval, and USDC contribution.
- Agent action/proof endpoints exist: `/api/agent/actions` and `/api/agent/onchain-proof`.
- Submission copy exists in `SUBMISSION.md`.
- Judge proof exists in `JUDGE_PACKET.md`.
- X/Twitter post draft exists in `SOCIAL_POST.md`.

## Must Be Done With Your Accounts

1. Push this project to a public GitHub repo.
2. Deploy the app to a public URL. Done: `https://chamascore-agent.vercel.app`.
3. Set `NEXT_PUBLIC_AGENT_METADATA_URL` to the public `/agent.json` URL.
4. Create a fresh Celo Sepolia circle with the public metadata URL.
5. Record one risk-flag transaction if gas is available.
6. Record and upload a short demo video.
7. Publish the X/Twitter post and copy the post URL.
8. Join the Telegram group: `https://t.me/realworldagentshackathon`
9. Sign in to Celo Builders and save the submission draft.
10. Review the draft once, then publish.

## Use These Tracks

```json
["best-agent"]
```

Do not add `8004scan-rank` until an 8004scan link exists. Do not add `most-activity` unless there are many legitimate repeated transactions.

## Verify Before Submitting

```bash
npm run lint
npm run typecheck
npm run build
npm run verify:demo
npm run verify:judge
```
