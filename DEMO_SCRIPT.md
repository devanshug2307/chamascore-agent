# ChamaScore Demo Script

Target length: 2 minutes 30 seconds.

## 0:00-0:15 - Open With The Problem

"This is ChamaScore Agent, a Celo onchain agent for savings-circle trust. Chamas, stokvels, susus, and family savings groups already move money together, but trust breaks when members pay late, treasurers keep opaque records, or payout readiness is unclear."

## 0:15-0:35 - Show The App

Show `https://chamascore-agent.vercel.app`.

"The app shows a live savings circle. The agent scores the group, tracks collected USDC, identifies the payout state, and highlights member reliability. This is not a generic chatbot; it is an agent that turns payment behavior into a decision."

## 0:35-0:55 - Show Agent Findings

Show the Agent Findings, Next Agent Actions, and MiniPay transaction path panels.

"Here, the agent detects late contribution risk, recommends reminders, holds payout until the round is funded, and prepares a risk-flag transaction. These findings can become ERC-8004 reputation evidence so reliability travels beyond one group."

## 0:55-1:20 - Show Onchain Proof

Show MetaMask activity or Blockscout links.

"The demo is live on Celo Sepolia. Circle 2 was created with USDC, the wallet approved 0.5 USDC, and the contribution was confirmed onchain."

Proof to show:

- Contract: `0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5`
- Circle creation tx: `0xb662ae355bb0d7f23da82b8014adcb90726ea9803c58603d77af0c4aa9c72276`
- Approval tx: `0x4993feda85b6668fcaff9a297d96692a14cbe121f8415905efba401d15ad8067`
- Contribution tx: `0xbbc9525edb99a84c8aab79bbcb19e637d747df703757913e0f90c937baa2f258`

## 1:20-1:45 - Show Agent Metadata/API

Open `/agent.json`, `/api/agent/report`, `/api/agent/actions`, then `/api/agent/onchain-proof`.

"ChamaScore exposes inspectable agent metadata, a report API, an encoded action API, and a live onchain proof API. Judges can inspect what the agent is, what it decides, what transactions it recommends, and what is already confirmed on Celo Sepolia."

## 1:45-2:10 - Explain Why Celo

"Celo is the right home because this is a real-world payments workflow: small stablecoin contributions, low network fees, and mobile-first UX. MiniPay gives this a natural distribution path for everyday savings groups."

## 2:10-2:30 - Close

"The next step is ERC-8004/8004scan registration and Self Agent ID verification. The core payment path is already working: the agent observes, scores, flags, prepares transactions, and connects real savings-circle activity to portable trust."

## Recording Rules

- Keep the video under 3 minutes.
- Show the actual app first, not slides.
- Show the transaction proof clearly.
- Do not say "guaranteed winner."
- Say "working Celo Sepolia demo" instead of "production-ready."
