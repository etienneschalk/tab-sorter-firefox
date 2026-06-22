# GitHub Actions — test workflow

This document describes the CI workflow that runs the project's automated tests on GitHub.

**Workflow file:** [`.github/workflows/test.yml`](../../.github/workflows/test.yml)

**Action versions:** `actions/checkout@v6`, `actions/setup-node@v6`, and `actions/upload-artifact@v6` use GitHub’s Node.js 24 runtime. Older `@v4` pins trigger deprecation warnings because runners no longer default to Node 20 ([changelog](https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/)).

---

## When it runs

| Trigger | Branches |
|---------|----------|
| `push` | `master`, `release-v0.8` |
| `pull_request` | `master`, `release-v0.8` |
| `workflow_dispatch` | Any (manual run from the Actions tab) |

**Concurrency:** only one run per branch at a time. A newer push cancels an in-progress run on the same ref.

**Timeout:** 20 minutes per job (typical run is under 2 minutes).

---

## Job overview

A single job named `test` runs on `ubuntu-latest` and executes the same test procedure documented in [test-automation.md](./test-automation.md), adapted for a headless CI environment.

```
checkout → Node.js → jq → npm ci → Playwright Chromium → unit tests → E2E tests → (report on failure)
```

---

## Step-by-step

### 1. Checkout

```yaml
uses: actions/checkout@v6
```

Clones the repository. **v6** runs on the Actions Node.js 24 runtime (required since Node 20 is deprecated on runners).

### 2. Setup Node.js

```yaml
uses: actions/setup-node@v6
with:
  node-version-file: .nvmrc
  cache: npm
```

- Installs **Node 24** (version pinned in [`.nvmrc`](../../.nvmrc)).
- Caches `node_modules` between runs when `package-lock.json` is unchanged.

### 3. Install jq

```bash
sudo apt-get update && sudo apt-get install -y jq
```

Required by [`build-extensions.sh`](../../build-extensions.sh). The E2E global setup runs that script before Playwright tests to build `build/chrome-extension/`.

### 4. Install dependencies

```bash
npm ci
```

Installs exact versions from `package-lock.json` (Vitest, Playwright, jsdom).

### 5. Install Playwright Chromium

```bash
npx playwright install chromium --with-deps
```

Downloads Playwright’s Chromium build and installs Linux system libraries needed to run the browser on the runner.

### 6. Unit tests

```bash
npm run test:unit
```

Runs **17 Vitest tests** in `tests/unit/` — no browser, completes in about one second.

Covers sorting logic, suspended tabs, tab groups, domain extraction, and theme resolution (see [test-automation.md §4](./test-automation.md#4-unit-tests-vitest)).

### 7. E2E tests

```bash
xvfb-run --auto-servernum -- npm run test:e2e
```

Runs **5 Playwright tests** in `tests/e2e/` against the unpacked Chrome extension.

| Detail | Why |
|--------|-----|
| `xvfb-run` | Extension tests use `headless: false` in the fixture; Linux CI has no real display, so a virtual framebuffer is required |
| `global-setup.js` | Builds the extension via `./build-extensions.sh` before specs run |
| Network | Tests open real URLs (`github.com`, `youtube.com`, `amazon.com`, `google.com`) |

E2E scenarios: dark mode popup, sort by URL, pinned tab sort, extract domain.

### 8. Upload Playwright report (on failure only)

```yaml
uses: actions/upload-artifact@v6
```

If E2E tests fail, the workflow uploads `playwright-report/` as a GitHub Actions artifact named `playwright-report` (kept 7 days).

Download it from the run’s **Summary → Artifacts** to inspect the HTML report. The HTML reporter is enabled only when `CI` is set ([`playwright.config.js`](../../playwright.config.js)).

---

## What CI does not run

- Firefox extension testing (Playwright extension support is Chromium-only here)
- Manual checks from [test-procedures/](./test-procedures/) (visual/CSS, real discarded tabs, auto-sort timing)
- `npm run build` as a separate step (build happens inside E2E global setup)

---

## Reproduce CI locally

Approximate the CI environment on Linux:

```bash
nvm use
sudo apt-get install -y jq xvfb
npm ci
npx playwright install chromium --with-deps
npm run test:unit
CI=1 xvfb-run --auto-servernum -- npm run test:e2e
```

Setting `CI=1` enables Playwright retries and the HTML reporter, matching the workflow.

---

## Manual run

1. Open the repository on GitHub → **Actions**
2. Select **Tests** in the left sidebar
3. Click **Run workflow**, choose branch, confirm

---

## Troubleshooting CI failures

| Failure | Likely cause | What to check |
|---------|--------------|---------------|
| Unit tests fail | Logic regression | Run `npm run test:unit` locally |
| E2E fail only on CI | Network / site availability | External sites may block or rate-limit runners; check artifact report |
| `jq: command not found` | Step skipped or wrong runner | Workflow installs jq explicitly; verify workflow file |
| Playwright browser missing | Install step failed | Re-run; check `playwright install` logs |
| Extension not loading | Build failed in global-setup | Run `./build-extensions.sh` locally |
| Timeout (20 min) | Hung browser or network | Rare; inspect job logs and artifact |

---

## Changing the workflow

| Goal | Edit |
|------|------|
| Test on more branches | `on.push.branches` / `on.pull_request.branches` in `test.yml` |
| Node version | `.nvmrc` (workflow reads it automatically) |
| Add a lint step | New step before unit tests in `test.yml` |
| Skip E2E on draft PRs | Add `if:` condition on the E2E step |
| Split unit and E2E jobs | Duplicate job with different `steps`; share setup via a composite action or reusable workflow |

After changing the workflow, push to a branch with an open PR to validate on GitHub.

---

## Related docs

- [test-automation.md](./test-automation.md) — full local test setup and architecture
- [README.md](./README.md) — index of `docs/ai/`
