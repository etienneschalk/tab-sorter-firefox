# Extract Domain Feature Test

## Implementation Summary

The "Extract Domain" feature has been successfully implemented with the following components:

### 1. Manifest Changes
- Added `command_extract_domain` command with keyboard shortcut `Ctrl+Shift+E`
- Command description: "Extract Domain - Move current tab and all same-domain tabs to new window"

### 2. Localization
- Added English localization string for "Extract Domain" button
- Message: "Extract Domain"
- Description: "Button for extracting domain tabs to new window"

### 3. Core Functionality
- **Domain Extraction**: `extractDomain(url)` function that:
  - Parses URLs using the URL constructor
  - Removes "www." prefix for consistent domain matching
  - Handles errors gracefully for invalid URLs

- **Tab Extraction**: `extractDomainTabs()` function that:
  - Gets the current active tab
  - Extracts the domain from the current tab's URL
  - Searches all windows for tabs with the same domain
  - Creates a new window
  - Moves all matching tabs to the new window

### 4. UI Integration
- Added "Extract Domain" button to the popup interface
- Button appears in the actions section with other sorting commands
- Command display priority: 6 (appears after shuffle)

### 5. Command Handling
- Updated command event listener to handle `command_extract_domain`
- Integrated with existing command system

## How to Test

1. **Install the Extension**:
   - Load the extension from `/home/eschalk/work/tab-sorter-firefox/build/firefox-extension/`
   - Or install from the generated zip file

2. **Test Scenarios**:
   - Open multiple tabs from the same domain (e.g., github.com, google.com)
   - Open tabs from different domains
   - Click the "Extract Domain" button or use Ctrl+Shift+E
   - Verify that all tabs with the same domain are moved to a new window

3. **Expected Behavior**:
   - Current tab and all tabs with the same domain move to a new window
   - New window becomes focused
   - Original window retains tabs from other domains
   - Console logs show the extraction process

## Error Handling

The implementation includes error handling for:
- No active tab found
- Invalid URLs that can't be parsed
- No matching tabs found for the domain
- Tab movement failures

## Files Modified

1. `manifest.json` - Added command definition
2. `_locales/en/messages.json` - Added localization strings
3. `tab-sorter.js` - Added domain extraction functions and command handling
4. `popup-tab-sorter.js` - Added UI command priority

## Build Status

✅ Extension builds successfully
✅ No linting errors
✅ All files properly included in build output
✅ Ready for testing and deployment
