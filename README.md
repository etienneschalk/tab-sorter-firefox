# tab-sorter-firefox

Simple extension for sorting tabs in Firefox (and Chrome)

## :warning: DISCLAIMER

**For Firefox users:**

➡️ Please use this link to download: https://addons.mozilla.org/en-US/firefox/addon/tab-sorter/

The original link lead to an outdated version (https://addons.mozilla.org/en-US/firefox/addon/tab-sorter-) and cannot be updated anymore.

### Translations

Only **English** and **French** UI strings were written and reviewed manually. All other supported languages in `template-extension/_locales/` were AI-generated and may contain mistakes or awkward phrasing. Corrections are welcome via [GitHub issues](https://github.com/etienneschalk/tab-sorter-firefox/issues).

## Build Process

The `template-extension` folder contains the main source. 
The `build` folder contains concrete extensions for Firefox and Chrome (respectively (`firefox-extension` and `chrome-extension`)).
The `build-extensions.sh` script generates the Firefox and Chrome extensions from the `template-extension` folder, ready to be zipped.

## Testing

Automated tests cover the scenarios from the [manual test procedures](docs/ai/test-procedures/):

- **Unit tests** (Vitest): sorting logic, suspended tabs, tab groups, domain extraction, theme resolution
- **E2E tests** (Playwright + Chromium): popup theme, sort by URL, pinned tabs, extract domain

Requirements: Node.js 24+ (see `.nvmrc`), npm, `jq` for builds, Chromium (installed via Playwright).

```bash
npm install
npx playwright install chromium   # first time only
npm run test:unit                 # fast logic tests
npm run test:e2e                  # browser extension tests (builds first)
npm run test:all                  # both suites
```

Pure logic lives in `template-extension/lib/` and is shared by the extension and unit tests.

## Extension Home Page

(EN) [Firefox Extension Home Page](https://addons.mozilla.org/en-US/firefox/addon/tab-sorter/)

(FR) [Firefox Extension Home Page](https://addons.mozilla.org/fr/firefox/addon/tab-sorter/)

(EN) [Chrome Extension Home Page](https://chromewebstore.google.com/detail/faghfoppoimhmffaephmideccaidpagj) 

(FR) [Chrome Extension Home Page](https://chromewebstore.google.com/detail/trieur-donglets/faghfoppoimhmffaephmideccaidpagj)

## Deployment Guide

### Prerequisites

- Node.js and npm (for development)
- `jq` command-line JSON processor ([install jq](https://jqlang.github.io/jq/))
- Developer accounts on:
  - [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)
  - [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)

### Building Extensions

1. **Run the build script:**
   ```bash
   ./build-extensions.sh
   ```

2. **Generated files:**
   - `build/chrome-extension.zip` - Ready for Chrome Web Store upload
   - `build/firefox-extension.zip` - Ready for Firefox Add-ons upload

### Deploying to Firefox Add-ons

Keyword: Publish 

1. **Prepare your extension:**
   - Ensure `build/firefox-extension.zip` is ready
   - Verify the manifest includes Firefox-specific settings

2. **Upload to Firefox Add-ons:**
   - Go to [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)
   - Click "Submit a New Add-on"
   - Upload `build/firefox-extension.zip`
   - Fill in store listing details (description, screenshots, etc.)
   - Submit for review

3. **Review process:**
   - Firefox Add-ons typically reviews within 24-48 hours
   - You'll receive email notifications about status updates
   - Address any review feedback if needed

### Deploying to Chrome Web Store

1. **Prepare your extension:**
   - Ensure `build/chrome-extension.zip` is ready
   - Verify manifest.json is Chrome-compatible (no Firefox-specific settings)

2. **Upload to Chrome Web Store:**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Click "New Item"
   - Upload `build/chrome-extension.zip`
   - Fill in store listing details:
     - Detailed description
     - Screenshots (1280x800px recommended)
     - Category selection
     - Privacy policy (if applicable)

3. **Privacy practices (onglet « Pratiques en matière de confidentialité »):**

   Chrome requires a justification for each sensitive permission. Paste the text below into the corresponding field, then save the draft.

   **Data usage:** No data is collected or transmitted off-device. Select *No* for data collection if asked.

   **`tabGroups`**

   *Français:*
   > L'autorisation `tabGroups` est requise pour la fonction « Respecter les groupes d'onglets » (activée par défaut). L'extension lit à quels groupes appartiennent les onglets afin de les trier à l'intérieur de chaque groupe sans les en retirer, puis réapplique l'appartenance au groupe après le réordonnancement. Aucune donnée n'est envoyée à un serveur externe.

   *English:*
   > The `tabGroups` permission is required for the "Respect Tab Groups" feature (on by default). The extension reads which group each tab belongs to so it can sort tabs within each group without pulling them out, then re-applies group membership after reordering. No data is sent to external servers.

   **`tabs`**

   *Français:*
   > L'autorisation `tabs` permet de lire l'ordre, l'URL, le titre et l'état des onglets (épinglé, suspendu, groupe) pour les trier, les déplacer, fermer les doublons ou extraire un domaine vers une nouvelle fenêtre. Tout le traitement reste local dans le navigateur.

   *English:*
   > The `tabs` permission is used to read tab order, URL, title, and state (pinned, discarded, group) in order to sort, move, close duplicate tabs, or extract a domain to a new window. All processing stays local in the browser.

   **`storage`**

   *Français:*
   > L'autorisation `storage` enregistre localement les préférences de l'utilisateur (méthode de tri par défaut, thème, options de tri des onglets épinglés, etc.). Aucune donnée n'est synchronisée avec un serveur externe.

   *English:*
   > The `storage` permission saves user preferences locally (default sort method, theme, pinned-tab options, etc.). No data is synced to an external server.

4. **Review process:**
   - Chrome Web Store reviews can take 1-3 business days
   - Extensions with minimal permissions usually get faster approval
   - Check dashboard for status updates

### Store Listing Best Practices

#### Screenshots
- Use 1280x800px resolution
- Show the extension in action
- Include both English and French screenshots if supporting both languages

#### Description
- Highlight key features and benefits
- Include clear usage instructions
- Mention keyboard shortcuts
- Add FAQ section for common questions

#### Keywords
- "tab management", "tab organizer", "browser productivity"
- "sort tabs", "tab sorter", "browser extension"
- Language-specific keywords for French listings

### Version Updates

1. **Update version number** in `template-extension/manifest.json`
2. **Run build script** to generate new zip files
3. **Upload new version** to respective stores
4. **Update changelog** in store listings

### Troubleshooting

#### Common Issues:
- **Build fails**: Ensure `jq` is installed and accessible
- **Chrome upload fails**: Check manifest.json for Chrome compatibility
- **Firefox upload fails**: Verify Firefox-specific settings are present
- **Review rejected**: Address specific feedback from store reviewers

#### Testing Before Upload:
- Test extension in developer mode
- Verify all features work as expected
- Check both English and French localizations
- Test keyboard shortcuts functionality 
