# Submit Now — Last Steps Only You Can Do

Everything else is wired to **Circle 3** with public metadata. These four items need your accounts.

## 1. Finish Circle 3 onchain proof (~3 min)

**Option A — script (fastest)**

Add your demo wallet private key to `.env.local`:

```bash
CHAMASCORE_PRIVATE_KEY=0xYOUR_KEY
```

Then run:

```bash
npm run complete:circle3
```

This approves USDC, contributes 0.5 USDC on Circle 3, records the risk flag, and writes proof tx hashes to `.env.local`.

**Option B — live app**

Open [https://chamascore-agent.vercel.app](https://chamascore-agent.vercel.app), connect MetaMask on Celo Sepolia, click **Prepare contribution**, then **Record risk flag**.

**Then on Vercel** → Settings → Environment Variables, add:

```text
NEXT_PUBLIC_CHAMASCORE_CIRCLE_ID=3
NEXT_PUBLIC_AGENT_METADATA_URL=https://chamascore-agent.vercel.app/agent.json
NEXT_PUBLIC_PROOF_CIRCLE_CREATED_TX=0xb92cad2604b08f8b65324ee05f4ecff59c0c05d905ac6ac06e3c1ac25a5b12c1
```

Add approval/contribution/risk-flag tx hashes from the script output, then redeploy.

Confirm:

```bash
CHAMASCORE_BASE_URL=https://chamascore-agent.vercel.app npm run verify:judge
```

## 2. Post on X (~2 min)

Copy from `SOCIAL_POST.md`, post from your account, tag `@CeloDevs` and `@Celo`. Save the public post URL.

## 3. Record demo video (~20 min)

Follow `DEMO_SCRIPT.md`. Upload to YouTube/Loom. Save the URL.

## 4. Publish Celo Builders submission (~10 min)

Ask your agent:

> Help me submit my project to the Celo Onchain Agents Hackathon.

Or use fields from `submission-kit/final-submission-copy.md`:

- Track: `best-agent`
- GitHub: `https://github.com/devanshug2307/chamascore-agent`
- Demo: `https://chamascore-agent.vercel.app`
- `socialLink`: your X post URL
- `videoUrl`: your demo video URL

Join Telegram: [t.me/realworldagentshackathon](https://t.me/realworldagentshackathon)

Deadline: **June 15, 2026 at 09:00 GMT** (14:30 IST).
