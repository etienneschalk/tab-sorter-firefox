# AI-assisted changes — documentation

This folder documents changes made with AI assistance so they can be understood, maintained, and reproduced without relying on chat history.

## Contents

| Document | Description |
|----------|-------------|
| [test-automation.md](./test-automation.md) | Full write-up of the automated test stack: what changed, why, and how to reproduce it from scratch |
| [manual-i18n-testing.md](./manual-i18n-testing.md) | How to set Firefox and Chromium UI language for manual translation / RTL testing |
| [github-actions.md](./github-actions.md) | GitHub Actions CI workflow: triggers, steps, and troubleshooting |
| [test-procedures/](./test-procedures/) | Manual QA checklists (`test-*.md`) for each feature |

## Quick reference

```bash
# Prerequisites: Node.js 24+, npm, jq, Chromium (via Playwright)
nvm use                    # uses .nvmrc (Node 24)
npm install
npx playwright install chromium   # first time only
npm run test:all           # 17 unit + 5 E2E tests
```

## What was added (summary)

1. **Shared logic modules** in `template-extension/lib/` — pure functions testable without a browser
2. **Unit tests** in `tests/unit/` — Vitest, run in Node.js
3. **E2E tests** in `tests/e2e/` — Playwright loads the Chrome extension and exercises the popup + tab APIs
4. **ES module migration** — extension scripts import shared libs; Chrome service worker uses `"type": "module"`
5. **Bug fix** — `performSort` now reads pinned-tab and tab-group preferences from cache (required after ES module strict mode)
6. **GitHub Actions** — [`.github/workflows/test.yml`](../../.github/workflows/test.yml) runs unit + E2E tests on push/PR (see [github-actions.md](./github-actions.md))

Manual procedures in [test-procedures/](./test-procedures/) are partially automated; see [test-automation.md](./test-automation.md) for the mapping.
