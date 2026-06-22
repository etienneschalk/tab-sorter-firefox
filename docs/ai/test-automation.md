# Test automation setup

This document explains the automated test infrastructure added to **tab-sorter-firefox**: what was done, how it maps to the existing manual `test-*.md` procedures, and how to reproduce or extend the setup later.

---

## 1. Problem and goal

The repository had six manual test documents at the root:

| File | Topic |
|------|-------|
| `test-dark-mode-issue-16.md` | Popup dark/light/auto theme |
| `test-pinned-tabs-issue-9.md` | Sort pinned tabs independently |
| `test-suspended-tabs-issue-18.md` | Group discarded tabs at start/end |
| `test-tab-groups-issue-19.md` | Sort within tab groups |
| `test-extract-domain.md` | Move same-domain tabs to a new window |
| `test-implementation.md` | Auto-sort on new tab (timing) |

There was no `package.json`, no test runner, and no CI. Sorting logic lived inline in `template-extension/tab-sorter.js`, which made it hard to test without loading a real browser extension.

**Goal:** automate as much as possible with:

- **Unit tests** — fast, no browser, cover sorting/domain/theme logic
- **E2E tests** — Chromium + unpacked extension, cover popup UI and real `chrome.tabs` behavior

---

## 2. Architecture overview

```
template-extension/
├── lib/
│   ├── sort-logic.js      # Pure sorting/domain logic (exported ES module)
│   └── theme-logic.js     # Theme resolution (exported ES module)
├── tab-sorter.js          # Background service worker — imports sort-logic
├── popup-tab-sorter.js    # Popup UI — imports theme-logic
└── ...

tests/
├── helpers/
│   └── tab-fixtures.js    # Factory helpers for mock tab objects
├── unit/                  # Vitest — Node.js
│   ├── sort-logic.test.js
│   ├── extract-domain.test.js
│   └── theme-logic.test.js
└── e2e/                   # Playwright — Chromium + extension
    ├── global-setup.js    # Runs ./build-extensions.sh before E2E
    ├── extension.fixture.js
    ├── dark-mode.spec.js
    ├── sort-url.spec.js
    ├── pinned-tabs.spec.js
    └── extract-domain.spec.js

package.json               # npm scripts and devDependencies
vitest.config.js
playwright.config.js
.nvmrc                     # Node 22
```

### Design choices

| Choice | Rationale |
|--------|-----------|
| Extract logic to `lib/*.js` | Same code runs in the extension and in Vitest; no duplication |
| ES modules in the extension | `import`/`export` works in MV3 service workers (`"type": "module"`) and in `<script type="module">` popups |
| Vitest for unit tests | Native ESM, fast, no config overhead |
| Playwright for E2E | Official pattern for loading unpacked Chrome extensions |
| E2E only on Chromium | Playwright extension support is Chromium-first; Firefox E2E is significantly harder |
| `global-setup.js` builds extension | E2E always tests `build/chrome-extension/`, matching real installs |

---

## 3. What changed in the extension

### 3.1 New shared modules

**`template-extension/lib/sort-logic.js`** — pure functions, no `chrome.*` calls:

- `extractDomain`, `getUrlMatchKey`, `removeParenthesisNotification`
- Comparison helpers: `comparisonByUrl`, `comparisonByMru`, `comparisonByTitle`
- `groupSuspendedTabs`, `organizeTabsByGroup`, `sortTabArray`, `faviconSort`
- Order computation: `computeLegacyTabOrder`, `computeGroupAwareTabOrder`, `computePinnedTabOrder`, `computeGroupAwareSortResult`
- `findDuplicateTabIds`

**`template-extension/lib/theme-logic.js`**:

- `getSystemTheme`, `resolveTheme`, `applyTheme`
- Constants: `THEME_AUTO`, `THEME_DARK`, `THEME_LIGHT`, `AVAILABLE_THEMES`

### 3.2 Refactored extension entry points

**`tab-sorter.js`** (background):

```javascript
import {
  comparisonByUrl,
  computeGroupAwareSortResult,
  computeLegacyTabOrder,
  computePinnedTabOrder,
  extractDomain,
  faviconSort,
  findDuplicateTabIds,
  // ...
} from "./lib/sort-logic.js";
```

Browser-specific code (`chrome.tabs.move`, `chrome.tabs.group`, storage, listeners) stays in `tab-sorter.js`. It delegates ordering to the pure functions, then applies results via the Tabs API.

**`popup-tab-sorter.js`** (popup):

```javascript
import {
  AVAILABLE_THEMES,
  THEME_AUTO,
  applyTheme as applyThemeToDocument,
} from "./lib/theme-logic.js";
```

### 3.3 ES module wiring

| File | Change |
|------|--------|
| `template-extension/manifest.json` | `"background": { "service_worker": "tab-sorter.js", "type": "module" }` |
| `template-extension/tab-sorter.html` | `<script type="module" src="popup-tab-sorter.js">` |
| `template-extension/background-tab-sorter.html` | `<script type="module" src="tab-sorter.js">` (Firefox background page) |
| `build-extensions.sh` | Chrome manifest jq step sets `"type": "module"` on the service worker |

Firefox build still uses a background **page** (not a service worker); the module script tag on that page loads the same `tab-sorter.js`.

### 3.4 Bug fix discovered during migration

`performSort` used bare identifiers `sortPinnedTabs` and `respectTabGroups` that were only defined as **local variables** inside `sortTabs()`. In classic scripts this failed silently (variables were `undefined`, so legacy sort path ran). In **ES modules** (strict mode), referencing them threw `ReferenceError` and **broke all sorting**.

**Fix** — read preferences inside `performSort`:

```javascript
const respectTabGroups =
  getRespectTabGroupsCached() && TAB_GROUPS_API_AVAILABLE;
const sortPinnedTabs = getSortPinnedTabsCached();
```

---

## 4. Unit tests (Vitest)

### 4.1 Configuration

**`vitest.config.js`:**

```javascript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.js"],
  },
});
```

**`package.json` scripts:**

| Script | Command |
|--------|---------|
| `npm test` / `npm run test:unit` | `vitest run` |
| `npm run test:watch` | `vitest` (watch mode) |

### 4.2 Mock tab objects

`tests/helpers/tab-fixtures.js` provides:

```javascript
tab(id, url, overrides)      // single mock chrome.tabs.Tab-like object
tabsFromUrls(urls, overrides) // array of tabs from URL list
```

Example:

```javascript
tab(1, "https://github.com", { pinned: true, discarded: false, groupId: 42 })
```

### 4.3 Coverage mapping (unit)

| Manual doc | Unit test file | What is asserted |
|------------|----------------|------------------|
| `test-extract-domain.md` | `extract-domain.test.js` | `extractDomain`, `getUrlMatchKey`, `findDuplicateTabIds` |
| `test-pinned-tabs-issue-9.md` | `sort-logic.test.js` | `computePinnedTabOrder` — pinned tabs sorted by domain |
| `test-suspended-tabs-issue-18.md` | `sort-logic.test.js` | `groupSuspendedTabs`, `computeLegacyTabOrder` with `suspendedPosition: "end"` / `"beginning"` |
| `test-tab-groups-issue-19.md` | `sort-logic.test.js` | `computeGroupAwareTabOrder`, `organizeTabsByGroup` |
| Issue #20 (www URL sort) | `sort-logic.test.js` | `comparisonByUrl` ignores `www.` prefix |
| `test-dark-mode-issue-16.md` | `theme-logic.test.js` | `resolveTheme`, `applyTheme` with jsdom + mocked `matchMedia` |

**Not covered by unit tests:** auto-sort retry timing (`test-implementation.md`), visual/CSS checks, real `chrome.tabs` moves.

---

## 5. E2E tests (Playwright)

### 5.1 Configuration

**`playwright.config.js`:**

- `testDir: "tests/e2e"`
- `globalSetup: "./tests/e2e/global-setup.js"` — runs `./build-extensions.sh`
- `timeout: 60_000` per test
- Uses Playwright’s bundled Chromium (`channel: "chromium"` in fixture)

**`tests/e2e/global-setup.js`:**

```javascript
execSync("./build-extensions.sh", { cwd: rootDir, stdio: "inherit" });
```

### 5.2 Extension fixture

**`tests/e2e/extension.fixture.js`** launches a **persistent Chromium context** with the unpacked extension:

```javascript
chromium.launchPersistentContext("", {
  channel: "chromium",
  headless: false,
  args: [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,  // build/chrome-extension
  ],
});
```

Helpers exported:

| Helper | Purpose |
|--------|---------|
| `getServiceWorker(context)` | Get MV3 service worker page for `chrome.*` evaluate |
| `withExtensionPage(context, extensionId, fn)` | Open popup HTML, run actions, wait, close |
| `runExtensionCommand(context, extensionId, command)` | Click a popup action button (e.g. `command_sort_tabs_url`) |
| `setExtensionPreference(context, extensionId, command, value)` | Check a preference checkbox or change a select |
| `getHttpTabDomains(context)` | Query tab URLs in current window via service worker |
| `waitForSortedHttpTabs(context)` | Poll until HTTP tabs are alphabetically sorted by domain |
| `activateTabMatching(context, urlPart)` | Focus a tab whose URL contains a string |

**Important E2E lessons:**

1. Do **not** call `chrome.runtime.sendMessage` from the service worker via `worker.evaluate` — it fails with “Receiving end does not exist”. Send messages from the **extension popup page** or click UI elements.
2. Opening the popup as a normal tab steals focus. For **extract domain**, activate the target tab inside `page.evaluate` immediately before clicking Extract.
3. E2E tests open real sites (`youtube.com`, `github.com`, etc.) — network access is required.

### 5.3 E2E test files

| File | Scenario |
|------|----------|
| `dark-mode.spec.js` | Select dark/light/auto in theme dropdown; assert `data-theme` on `<html>` |
| `sort-url.spec.js` | Open 3 tabs, click “Sort by URL”, assert domain order |
| `pinned-tabs.spec.js` | Pin 3 tabs, enable “sort pinned tabs”, sort by URL |
| `extract-domain.spec.js` | 2× GitHub + 1× Google tab; extract domain; assert 2 windows |

### 5.4 Coverage mapping (E2E)

| Manual doc | E2E file | Automated? |
|------------|----------|------------|
| `test-dark-mode-issue-16.md` | `dark-mode.spec.js` | Partial — theme switching, not every visual/CSS scenario |
| `test-pinned-tabs-issue-9.md` | `pinned-tabs.spec.js` | Core sort path |
| `test-extract-domain.md` | `extract-domain.spec.js` | Core extract path |
| `test-suspended-tabs-issue-18.md` | — | Unit only (`discarded` mocked) |
| `test-tab-groups-issue-19.md` | — | Unit only (groupId mocked) |
| `test-implementation.md` | — | Not automated |

---

## 6. Full procedure — reproduce from scratch

Anyone cloning the repo (or rebuilding this setup on another branch) should follow these steps.

### 6.1 Prerequisites

| Tool | Version | Used for |
|------|---------|----------|
| Node.js | ≥ 18 (repo pins 22 in `.nvmrc`) | Vitest, Playwright |
| npm | comes with Node | dependencies |
| `jq` | any recent | `build-extensions.sh` |
| Linux/macOS/Windows | — | Playwright downloads Chromium automatically |

```bash
# If using nvm:
nvm install    # reads .nvmrc
nvm use
```

### 6.2 One-time setup

```bash
cd /path/to/tab-sorter-firefox

npm install
npx playwright install chromium
```

This creates `node_modules/` and downloads Chromium to `~/.cache/ms-playwright/` (or equivalent).

### 6.3 Build the extension

```bash
./build-extensions.sh
# or
npm run build
```

Output:

- `build/chrome-extension/` — used by E2E
- `build/firefox-extension/` — Firefox manual testing
- `build/*.zip` — store uploads

### 6.4 Run tests

```bash
# Unit only (~1 second)
npm run test:unit

# E2E only (builds extension via global-setup, ~10–15 seconds)
npm run test:e2e

# Both
npm run test:all

# Unit watch mode while developing
npm run test:watch
```

**Expected result:** 17 unit tests + 5 E2E tests, all passing.

### 6.5 Run a single E2E file

```bash
npx playwright test tests/e2e/dark-mode.spec.js
```

### 6.6 Debug E2E visually

E2E runs with `headless: false` in the fixture so the browser window is visible. For Playwright inspector:

```bash
npx playwright test --debug tests/e2e/sort-url.spec.js
```

---

## 7. How to redo this setup on a clean branch

If you need to re-apply the same approach from zero (e.g. after a large revert):

### Step A — Create shared logic modules

1. Create `template-extension/lib/sort-logic.js` with pure functions extracted from `tab-sorter.js`.
2. Create `template-extension/lib/theme-logic.js` from popup theme helpers.
3. Replace inline implementations in `tab-sorter.js` / `popup-tab-sorter.js` with `import` statements.
4. Ensure `performSort` reads `getSortPinnedTabsCached()` and `getRespectTabGroupsCached()` locally.

### Step B — Enable ES modules

1. Add `"type": "module"` to `manifest.json` background service worker.
2. Change script tags to `type="module"` in `tab-sorter.html` and `background-tab-sorter.html`.
3. Update `build-extensions.sh` Chrome jq line to preserve module type.

### Step C — Add Node test tooling

1. Create `package.json` with `vitest`, `jsdom`, `@playwright/test`.
2. Add `vitest.config.js`, `playwright.config.js`, `.nvmrc`.
3. Update `.gitignore` for `node_modules/`, `test-results/`, `playwright-report/`.

### Step D — Write unit tests

1. `tests/helpers/tab-fixtures.js`
2. `tests/unit/*.test.js` importing from `template-extension/lib/`

### Step E — Write E2E tests

1. `tests/e2e/global-setup.js` — build script
2. `tests/e2e/extension.fixture.js` — load `build/chrome-extension`
3. `tests/e2e/*.spec.js` — scenarios from manual docs

### Step F — Document and verify

1. Add Testing section to `README.md`
2. Add `docs/ai/` (this folder)
3. Run `npm run test:all` and fix failures

---

## 8. Adding a new test later

### New pure logic behavior

1. Add function to `template-extension/lib/sort-logic.js` or `theme-logic.js`.
2. Call it from `tab-sorter.js` or `popup-tab-sorter.js`.
3. Add cases to `tests/unit/`.
4. Run `npm run test:unit`.

### New E2E scenario (Chrome)

1. Create `tests/e2e/my-feature.spec.js`.
2. Import `{ test, expect, runExtensionCommand, ... }` from `./extension.fixture.js`.
3. Use `extensionId` fixture to open `chrome-extension://${extensionId}/tab-sorter.html`.
4. Run `npm run build` then `npx playwright test tests/e2e/my-feature.spec.js`.

### New manual doc scenario

Update the mapping tables in this document when you automate (or consciously skip) a `test-*.md` procedure.

---

## 9. What remains manual

- **Firefox** extension behavior (load via `about:debugging`)
- **Visual regression** (exact colors, layout from `test-dark-mode-issue-16.md`)
- **Real suspended tabs** (`tab.discarded` from Memory Saver / Unload Tab)
- **Tab groups in a real browser** (Chrome UI create group, drag, etc.)
- **Auto-sort on new tab** race/retry (`test-implementation.md`)
- **French locale** UI strings (could add Playwright `locale: 'fr-FR'` later)
- **Store/review** smoke tests on packaged zips

---

## 10. File checklist

Files introduced or materially changed by the test automation work:

```
.nvmrc
package.json
package-lock.json
vitest.config.js
playwright.config.js
.gitignore                          # node_modules, playwright artifacts
README.md                           # Testing section

template-extension/lib/sort-logic.js
template-extension/lib/theme-logic.js
template-extension/tab-sorter.js    # imports lib, performSort fix
template-extension/popup-tab-sorter.js
template-extension/manifest.json
template-extension/tab-sorter.html
template-extension/background-tab-sorter.html
build-extensions.sh

tests/helpers/tab-fixtures.js
tests/unit/sort-logic.test.js
tests/unit/extract-domain.test.js
tests/unit/theme-logic.test.js
tests/e2e/global-setup.js
tests/e2e/extension.fixture.js
tests/e2e/dark-mode.spec.js
tests/e2e/sort-url.spec.js
tests/e2e/pinned-tabs.spec.js
tests/e2e/extract-domain.spec.js

docs/ai/README.md
docs/ai/test-automation.md
```

---

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `vitest: command not found` | Dependencies not installed | `npm install` |
| Node version warnings | System Node too old | `nvm use` (see `.nvmrc`) |
| E2E: extension not loading | Extension not built | `npm run build` |
| E2E: tabs never sort | Stale build or `performSort` bug | Rebuild; verify cache getters in `performSort` |
| E2E: “Receiving end does not exist” | `sendMessage` from service worker | Use popup page click or evaluate from extension page |
| E2E: extract does nothing | Active tab not on target domain | Activate target tab before extract (see `extract-domain.spec.js`) |
| E2E: network timeouts | Offline or site blocked | Ensure github.com/google.com/youtube.com reachable |
| `jq: command not found` | jq missing | Install jq per README |

---

*Document created to capture the AI-assisted test automation session. Update this file when the test layout or procedures change.*
