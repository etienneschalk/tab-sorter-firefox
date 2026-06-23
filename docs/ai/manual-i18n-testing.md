# Manual i18n testing — browser language setup

This guide explains how to change the **browser UI language** in Firefox and Chromium so you can manually verify Tab Sorter translations and RTL layout.

The extension does not store a language preference of its own. Popup and settings pages call `chrome.i18n.getMessage()` and read the UI locale with `chrome.i18n.getUILanguage()`. Arabic (`ar`) and Hebrew (`he`) also set `dir="rtl"` on `<html>` via `lib/locale-logic.js`.

**Build before testing:**

```bash
npm run build
```

| Browser | Unpacked extension path |
|---------|-------------------------|
| Firefox | `build/firefox-extension/` |
| Chromium / Chrome | `build/chrome-extension/` |

Supported locale folders live under `template-extension/_locales/`. Run `npm run test:unit -- tests/unit/locales.test.js` to see the full list.

---

## What to check after changing language

1. **Extension name & description** — `about:addons` (Firefox) or `chrome://extensions` (Chromium).
2. **Popup** — open the toolbar button; section titles, checkboxes, sort actions, and help links should be translated.
3. **Settings page** — popup link “Open full settings page”, or Preferences on the extension card in `about:addons`.
4. **RTL (Arabic / Hebrew only)** — in DevTools on the popup or settings page, confirm `<html dir="rtl" lang="ar">` (or `he`). Columns should read right-to-left; checkboxes and selectors should look natural.
5. **Fallback** — if a key were missing, the UI would show English (`default_locale` in `manifest.json` is `en`). All current locales are kept in sync by `tests/unit/locales.test.js`.

---

## Firefox

### Option A — Settings UI (recommended)

1. Open **Settings** → **Language** (or visit `about:preferences#general`).
2. Under **Set Alternatives** / **Choose your preferred languages**, add the target language (e.g. **Arabic**, **Español**, **עברית**).
3. Move it to the **top** of the list so it becomes the primary UI language.
4. Firefox may prompt to **restart**; accept if offered.
5. Reload or re-open the extension popup.

Firefox language docs: [Choose your language settings](https://support.mozilla.org/en-US/kb/use-firefox-interface-other-languages).

### Option B — `about:config` (quick switch)

Useful when the language is not listed in Settings or you need a specific tag (e.g. `pt-BR` vs `pt-PT`).

1. Open `about:config`, accept the risk prompt.
2. Set **`intl.locale.requested`** to the desired BCP 47 tag, for example:
   - `ar`
   - `he`
   - `es`
   - `pt-BR`
   - `zh-CN`
   - `zh-TW`
3. Restart Firefox.
4. Open the Tab Sorter popup again.

To revert, clear `intl.locale.requested` (reset) or set it back to your normal locale.

### Load the extension (development)

1. Open `about:debugging#/runtime/this-firefox`.
2. **Load Temporary Add-on…** → select `build/firefox-extension/manifest.json`.
3. Or use a permanently installed build from `about:addons` after loading the unpacked folder through your usual workflow.

### Firefox-specific notes

- Extension strings come from `_locales/<locale>/messages.json`. Firefox maps `intl.locale.requested` and preferred languages to the closest folder (e.g. `pt` may resolve to `pt_BR` or `pt_PT` depending on the tag).
- Help links inside the popup point to **localized Mozilla Support** articles where available.
- Keyboard shortcut labels in the popup still reflect OS/Firefox shortcut display; command descriptions in `manifest.json` remain English until those entries are internationalized separately.

---

## Chromium / Google Chrome

### Option A — Settings UI (recommended)

1. Open `chrome://settings/languages` (or **Settings → Languages**).
2. Click **Add languages** and add the target language.
3. Use the **⋮** menu next to the language → **Move to the top** (or **Display Chrome in this language** on Chrome-branded builds).
4. **Relaunch** Chromium/Chrome when prompted.
5. Reload the extension on `chrome://extensions` (click the reload icon on Tab Sorter) and open the popup.

### Option B — Launch with `--lang` (quick switch)

Good for one-off checks without changing the global profile.

```bash
# Close existing Chromium windows first, then for example:
chromium --lang=ar \
  --disable-extensions-except="$(pwd)/build/chrome-extension" \
  --load-extension="$(pwd)/build/chrome-extension"
```

Replace `chromium` with `google-chrome`, `chromium-browser`, or the path to your Chrome binary. Use standard BCP 47 tags: `he`, `de`, `fr`, `zh-CN`, etc.

Chromium maps `--lang` to extension `_locales` the same way as the profile language.

### Load the extension (development)

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. **Load unpacked** → select `build/chrome-extension/`.
4. Pin the extension and open the popup.

### Chromium-specific notes

- Automated E2E tests (`npm run test:e2e`) always run with an English UI unless you change the Playwright launch args; they do **not** replace manual i18n passes.
- The settings page opens in a tab (`options_ui.open_in_tab` in `manifest.json`); verify it in the new tab as well as the popup.

---

## Suggested spot-check matrix

You do not need to test all 25 locales every release. A practical smoke set:

| Locale | Code | Why |
|--------|------|-----|
| English | `en` | Default, baseline |
| French | `fr` | Original second language |
| Arabic | `ar` | RTL |
| Hebrew | `he` | RTL |
| German | `de` | Long compound strings |
| Japanese | `ja` | CJK layout |
| Portuguese (BR) | `pt_BR` | Distinct from `pt_PT` |

For each locale: open popup → toggle one checkbox → open settings page → confirm the same preference persisted (shared `chrome.storage.sync`).

---

## Troubleshooting

| Symptom | Likely cause | What to do |
|---------|----------------|------------|
| UI still in English | Browser UI language not actually changed | Restart browser; confirm language is first in the list or `intl.locale.requested` / `--lang` is set |
| Mixed English and translated strings | Missing key in that locale | Run `npm run test:unit -- tests/unit/locales.test.js`; add the key to the locale file |
| Wrong Portuguese variant | `pt` vs `pt_BR` vs `pt_PT` | Set explicit tag (`pt-BR` / `pt-PT`) in Firefox or Chromium |
| RTL layout broken | `dir` not applied | Inspect `<html>` in DevTools; should be `rtl` for `ar` / `he`. Rebuild and reload extension |
| Changes not visible | Stale build | Run `npm run build` and reload the extension in the browser |
| `about:addons` description not translated | Looking at an old install | Reload temporary add-on or reinstall from `build/firefox-extension/` |

---

## Related docs

- [Internationalization (MDN)](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization)
- [test-automation.md](./test-automation.md) — unit tests for locales and RTL logic
- [test-procedures/](./test-procedures/) — feature QA checklists (mostly English UI)
