# X/Twitter Registration Post — Copy & Paste

Meets the hackathon registration requirements (tags `@CeloDevs` + `@Celo`, agent name +
one-line description, ERC-8004 registry link, demo URL, `#CeloAgents`).

**Step 0 — quote-tweet:** Post this as a **quote-tweet** of the official
[@CeloDevs](https://x.com/CeloDevs) hackathon announcement (registration step 1), not standalone.

> **Recommended:** post this **after** the mainnet flip so the 8004scan link points to
> Celo mainnet. Replace `[AGENT_ID]` with the mainnet agent id printed by
> `npm run register:erc8004` (see `MAINNET_GO_LIVE.md`).

---

## Primary post (recommended — after mainnet flip)

```text
I'm building for the @CeloDevs Agent Hackathon 🟡

ChamaScore — an autonomous trust agent for savings circles (chamas/stokvels) on Celo. It watches USDC contributions, executes rotating payouts on its own, flags late payers onchain, and earns portable ERC-8004 reputation from real members.

Registered onchain → https://8004scan.io/agents/celo/[AGENT_ID]

✅ Live on Celo mainnet: 2 autonomous payouts + 1 onchain risk flag
✅ Reputation: avg 97/100 from independent member wallets
✅ A2A + MCP endpoints any agent can call
🌐 https://chamascore-agent.vercel.app

Let's go 🛠 #CeloAgents @Celo
```

## Short version (if you hit the free-X character limit)

```text
I'm building for the @CeloDevs Agent Hackathon 🟡

ChamaScore — autonomous trust + payouts for savings circles on Celo. Executes rotating payouts, flags late payers onchain, earns ERC-8004 reputation (avg 97/100 from real members).

Registered → https://8004scan.io/agents/celo/[AGENT_ID]
Demo: https://chamascore-agent.vercel.app

Let's go 🛠 #CeloAgents @Celo
```

## Optional line (Self Agent ID — completed, ID 74)

Add before `#CeloAgents`:

```text
Self-verified agent ✅ (Self Agent ID 74)
```

---

## Fallback ONLY if posting before the mainnet flip (not recommended)

Posting a `celo-sepolia` link publicly advertises a testnet entry to the judges reading the
feed. If you must post now, swap the link and drop the "mainnet" wording:

```text
I'm building for the @CeloDevs Agent Hackathon 🟡

ChamaScore — an autonomous trust agent for savings circles (chamas/stokvels) on Celo. It executes rotating payouts on its own, flags late payers onchain, and earns ERC-8004 reputation from real members.

Registered onchain → https://8004scan.io/agents/celo-sepolia/338

✅ Working demo: 2 autonomous payouts + 1 onchain risk flag
✅ Reputation: avg 97/100 from independent member wallets
✅ A2A + MCP endpoints any agent can call
🌐 https://chamascore-agent.vercel.app

Let's go 🛠 #CeloAgents @Celo
```

---

## After you post

1. Copy the public post URL (e.g. `https://x.com/yourhandle/status/...`).
2. Paste it into `SUBMISSION.md` as the Twitter/X registration post link and as
   `socialLink` on the Celo Builders form.

## Reference links

> These are the **testnet** demo links. After the mainnet flip they are replaced by the
> mainnet contract + tx hashes from `deployments.json` (see `MAINNET_GO_LIVE.md` step 5).

- 8004scan profile (testnet): https://8004scan.io/agents/celo-sepolia/338
- Demo: https://chamascore-agent.vercel.app
- Agent metadata: https://chamascore-agent.vercel.app/agent.json
- A2A agent card: https://chamascore-agent.vercel.app/.well-known/agent-card.json
- MCP descriptor: https://chamascore-agent.vercel.app/.well-known/mcp.json
