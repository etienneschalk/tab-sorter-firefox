# tab-sorter-firefox

Simple extension for sorting tabs in Firefox (and Chrome)

## Build Process 

The `template-extension` folder contains the main source. 
The `build` folder contains concrete extensions for Firefox and Chrome (respectively (`firefox-extension` and `chrome-extension`).
The `build-extensions.sh` script generates the Firefox and Chrome extensions from the `template-extension` folder, ready to be zipped.

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

3. **Review process:**
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
