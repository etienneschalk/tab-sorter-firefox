# Changelog

All notable changes to this project will be documented in this file.

## [0.8] - 2026-01-18

### Dark Mode ([#16](https://github.com/etienneschalk/tab-sorter-firefox/issues/16))

Full dark mode support with automatic system theme detection.

#### Added
- Dark mode is now the default theme for new users
- Automatic system theme detection (follows OS preference)
- Manual theme selection: Auto, Dark, or Light
- New "Appearance" section in preferences
- Full localization support for English and French

#### Changed
- **CSS Architecture**: Refactored to use CSS custom properties for theming

#### Technical Improvements
- **CSS Variables**: Theme colors defined using CSS custom properties (`:root` and `[data-theme="dark"]`)
- **System Detection**: Uses `prefers-color-scheme` media query for auto theme detection
- **Instant Updates**: Theme changes are applied immediately without page reload

#### Files Changed
- `template-extension/tab-sorter.js` - Theme storage and retrieval
- `template-extension/popup-tab-sorter.js` - Theme UI and application logic
- `template-extension/tab-sorter.css` - Dark mode styles with CSS variables
- `template-extension/_locales/en/messages.json` - English translations
- `template-extension/_locales/fr/messages.json` - French translations
- Added `test-dark-mode-issue-16.md` - Comprehensive testing documentation

---

### Sort Pinned Tabs ([#9](https://github.com/etienneschalk/tab-sorter-firefox/issues/9))

New option to sort pinned tabs independently.

#### Added
- New "Also sort pinned tabs" checkbox in General Preferences (disabled by default)
- Pinned tabs are sorted among themselves while remaining in the pinned area
- Works with all sorting methods (URL, title, MRU, favicon)
- Compatible with suspended tabs grouping feature
- Full localization support for English and French

#### Technical Improvements
- **Pinned Tabs Detection**: Separates pinned and non-pinned tabs before sorting
- **Independent Sorting**: New `sortPinnedTabsOnly()` function for sorting pinned tabs separately

#### Files Changed
- `template-extension/tab-sorter.js` - Pinned tabs sorting logic
- `template-extension/popup-tab-sorter.js` - UI updates for new checkbox
- `template-extension/_locales/en/messages.json` - English translations
- `template-extension/_locales/fr/messages.json` - French translations
- Added `test-pinned-tabs-issue-9.md` - Comprehensive testing documentation

---

### Suspended Tabs Position Control ([#18](https://github.com/etienneschalk/tab-sorter-firefox/issues/18))

Flexible options for handling suspended tabs when sorting.

#### Added
- New "Suspended Tabs" section in preferences with dropdown selector
- Three position options:
  - **Ignore discarded status** (default): Sort tabs normally without considering suspended state
  - **Group at the end**: Move suspended tabs to the end of the sorted list
  - **Group at the beginning**: Move suspended tabs to the beginning of the sorted list
- Works with all sorting methods (URL, title, MRU, favicon)
- Compatible with Tab Groups feature
- Full localization support for English and French

#### Technical Improvements
- **Suspended Detection**: Uses `tab.discarded` property to identify suspended tabs
- **Helper Function**: New `groupSuspendedTabs(tabs, position)` function supporting both "end" and "beginning" positions
- **Tab Groups Integration**: Suspended tabs grouping is applied within each Tab Group, not globally, preserving group integrity

#### Files Changed
- `template-extension/tab-sorter.js` - Suspended tabs positioning logic
- `template-extension/popup-tab-sorter.js` - UI updates with dropdown selector
- `template-extension/_locales/en/messages.json` - English translations
- `template-extension/_locales/fr/messages.json` - French translations
- Added `test-suspended-tabs-issue-18.md` - Comprehensive testing documentation

---

### Tab Groups Support ([#19](https://github.com/etienneschalk/tab-sorter-firefox/issues/19))

New functionality to preserve tab groups during sorting.

#### Added
- Tabs within each group are sorted separately, keeping them in their groups
- New "Respect Tab Groups" checkbox in preferences (enabled by default)
- Groups maintain their original positions (only content within groups is sorted)
- Compatible with Chrome 89+ and Firefox 137+
- Graceful degradation for older browsers without Tab Groups API
- Full localization support for English and French
- Added `tabGroups` permission to manifest for accessing tab group information
- Automatic detection of Tab Groups API availability

#### Changed
- **Sorting Logic**: Refactored core sorting to support group-aware modes:
  - Sort within groups (preserve group positions)
  - Legacy mode (ignore groups)
- **UI**: Added new "Tab Groups" section in preferences panel

#### Technical Improvements
- **API Detection**: Runtime detection of `chrome.tabGroups` availability
- **Group Organization**: New helper functions for organizing tabs by group membership
- **Backward Compatibility**: Legacy sorting mode preserved when groups are disabled or API unavailable

#### Note
- The "Respect Tab Groups" checkbox should remain ON for modern browsers (Chrome 89+, Firefox 137+). Setting it to OFF will break groups during sorting.
- Maybe later we can sort the groups themselves, using their names if available, or the first tab of the group as a rank

#### Files Changed
- `template-extension/tab-sorter.js` - Tab groups sorting logic
- `template-extension/popup-tab-sorter.js` - UI updates for new checkbox
- `template-extension/tab-sorter.css` - Styles for disabled state
- `template-extension/manifest.json` - Version bump and tabGroups permission
- `template-extension/_locales/en/messages.json` - English translations
- `template-extension/_locales/fr/messages.json` - French translations
- Added `test-tab-groups-issue-19.md` - Comprehensive testing documentation

---

## [0.7] - 2025-09-16

### Added
- **Extract Domain Feature** - New functionality to extract current tab and all same-domain tabs to a new window
  - Added `Ctrl+Shift+L` keyboard shortcut for quick domain extraction
  - Comprehensive error handling for extraction operations
  - Automatic sorting of extracted tabs when auto-sort is enabled
  - Full localization support for English and French
  - New UI button in popup for easy access

- **Enhanced Auto-Sort Functionality**
  - Renamed "Auto sort on new tab" to "Auto sort (best effort)" for better clarity
  - Improved tab event handling with better reliability
  - Added auto-sort after Extract Window operations
  - Enhanced MRU (Most Recently Used) sorting with better tab activation handling

- **Chrome Compatibility Improvements**
  - Updated MRU sorting to work with Chrome 121+ using the `lastAccessed` property
  - Fixed Chrome-specific compatibility issues

### Changed
- **Storage Keys**: Renamed `STORAGE_KEY_AUTO_SORT_ON_NEW_TAB` to `STORAGE_KEY_AUTO_SORT_BEST_EFFORT` for better naming consistency
- **Function Names**: Updated `setAutoOnNewTab()` to `setAutoSortBestEffort()` to match new functionality
- **Manifest Version**: Bumped from 0.6 to 0.7
- **Help Documentation**: Updated MRU Chrome compatibility information

### Fixed
- **Tab Event Handling**: Improved reliability of tab creation and activation event listeners
- **Single Tab Bug**: Fixed issues with single tab scenarios
- **URL Change Handling**: Fixed auto-sort behavior after search navigation
- **Tab Duplication**: Resolved tab duplication bug in extract domain feature
- **New Tab Creation**: Fixed bug using tabId parameter in new tab creation
- **Extraction Logic**: Fixed extraction logic to properly consider tabs in other windows

### Technical Improvements
- **Code Organization**: Better separation of concerns and improved code structure
- **Error Handling**: Enhanced error handling throughout the extension
- **Logging**: Improved debugging capabilities with better logging
- **Constants**: Extracted magic numbers and strings into named constants
- **Build Process**: Updated build script for better extension packaging

### Localization
- **English**: Added new strings for Extract Domain feature
- **French**: Added French translations for all new features
- **Help Text**: Updated help documentation in both languages

### Files Changed
- `template-extension/tab-sorter.js` - Core functionality updates
- `template-extension/manifest.json` - Version bump and new command
- `template-extension/popup-tab-sorter.js` - UI updates
- `template-extension/_locales/en/messages.json` - English translations
- `template-extension/_locales/fr/messages.json` - French translations
- All build directories updated with new features
- Added comprehensive test documentation


### [0.6] - Previous Release
- Basic tab sorting functionality
- MRU sorting (Firefox only)
- Manual sorting options
- Basic auto-sort on new tab
- Initial Chrome support

---

*For more detailed information about specific commits, see the git history.*
