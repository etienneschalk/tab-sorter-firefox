# Changelog

All notable changes to this project will be documented in this file.

## [0.8] - 2026-01-18

### Added
- **Tab Groups Support** ([#19](https://github.com/etienneschalk/tab-sorter-firefox/issues/19)) - New functionality to preserve tab groups during sorting
  - Tabs within each group are sorted separately, keeping them in their groups
  - New "Respect Tab Groups" checkbox in preferences (enabled by default)
  - New "Also reorder groups themselves" checkbox (enabled by default)
    - When checked: Groups are reordered by their "representative" tab (first tab after sorting)
    - When unchecked: Groups maintain their original positions, only content is sorted
  - Compatible with Chrome 89+ and Firefox 137+
  - Graceful degradation for older browsers without Tab Groups API
  - Full localization support for English and French

- **Tab Groups API Permission**
  - Added `tabGroups` permission to manifest for accessing tab group information
  - Automatic detection of Tab Groups API availability

### Changed
- **Manifest Version**: Bumped from 0.7 to 0.8
- **Sorting Logic**: Refactored core sorting to support group-aware modes:
  - Sort within groups only (preserve group positions)
  - Sort within groups and reorder groups
  - Legacy mode (ignore groups)
- **UI**: Added new "Tab Groups" section in preferences panel with nested sub-option

### Technical Improvements
- **API Detection**: Runtime detection of `chrome.tabGroups` availability
- **Group Organization**: New helper functions for organizing tabs by group membership
- **Backward Compatibility**: Legacy sorting mode preserved when groups are disabled or API unavailable
- **Conditional UI**: Reorder groups checkbox disabled when respect groups is unchecked

### Files Changed
- `template-extension/tab-sorter.js` - Tab groups sorting logic
- `template-extension/popup-tab-sorter.js` - UI updates for new checkboxes
- `template-extension/tab-sorter.css` - Styles for disabled state and sub-checkbox
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
