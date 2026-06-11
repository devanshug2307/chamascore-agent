# ChamaScore Submission Kit

Use this folder when preparing the Celo Builders submission.

- `final-submission-copy.md`: copy-paste project fields for the form.
- `celo-builders-payload.template.json`: API-style payload with required fields and TODO placeholders.
- `required-only-checklist.md`: shortest path to a valid submission.
- `account-actions.md`: actions that require your GitHub, X/Twitter, hosting, wallet, or Celo Builders account.
- `screenshots/chamascore-home.png`: verified local app screenshot for README, demo video thumbnail, or social preview.

Before publishing, run:

```bash
npm run lint
npm run typecheck
npm run build
npm run verify:demo
```
