# Required-Only Submission Checklist

This is the lean path. Do these before publishing on Celo Builders.

Deadline: **June 15, 2026 at 09:00 GMT** / **June 15, 2026 at 14:30 IST**.

Required hackathon social field: public X/Twitter post URL from `x.com` or `twitter.com`.

## Already Done

- App is public at `https://chamascore-agent.vercel.app`.
- Agent metadata at `/agent.json`.
- Agent report API at `/api/agent/report`.
- Celo Sepolia contract deployed: `0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5`.
- Active demo circle: **Circle `3`** with public metadata URI `https://chamascore-agent.vercel.app/agent.json`.
- Circle 3 creation tx: `0xb92cad2604b08f8b65324ee05f4ecff59c0c05d905ac6ac06e3c1ac25a5b12c1`.
- Public GitHub repo: `https://github.com/devanshug2307/chamascore-agent`.
- Agent action/proof endpoints: `/api/agent/actions`, `/api/agent/onchain-proof`.
- Submission copy in `SUBMISSION.md`, judge proof in `JUDGE_PACKET.md`, X draft in `SOCIAL_POST.md`.

## Still Needs Your Account (cannot be automated)

1. Run Circle 3 onchain demo txs if not done yet:
   - Add `CHAMASCORE_PRIVATE_KEY` to `.env.local`
   - Run `npm run complete:circle3`
   - Or use the live app buttons: Prepare contribution → Record risk flag
2. Set the same `NEXT_PUBLIC_*` env vars on Vercel and redeploy.
3. Record and upload a short demo video (`DEMO_SCRIPT.md`).
4. Publish the X/Twitter post (`SOCIAL_POST.md`) and copy the post URL.
5. Join Telegram: `https://t.me/realworldagentshackathon`
6. Submit on Celo Builders with track `best-agent` only.

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
CHAMASCORE_BASE_URL=https://chamascore-agent.vercel.app npm run verify:judge
```
