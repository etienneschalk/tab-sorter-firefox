# Tab Groups Support - Manual Testing Procedure

**Issue:** [#19 - Tab Groups Support](https://github.com/etienneschalk/tab-sorter-firefox/issues/19)

**Feature Summary:** When sorting tabs, the extension now respects Tab Groups. The "Respect Tab Groups" option ensures:
- Tabs within each group are sorted separately, keeping them in their groups
- Groups maintain their original positions (are not reordered)

This prevents tabs from being removed from their groups during sorting.

## Prerequisites

### Browser Requirements

| Browser | Minimum Version | Tab Groups API |
|---------|----------------|----------------|
| **Google Chrome** | 89+ | `chrome.tabGroups` |
| **Firefox** | 137+ | `browser.tabGroups` |

### Extension Installation

1. Build the extension:
   ```bash
   ./build-extensions.sh
   ```

2. **Firefox:**
   - Navigate to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select `build/firefox-extension/manifest.json`

3. **Chrome:**
   - Navigate to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `build/chrome-extension/` folder

---

## Test Scenarios

### Scenario 1: Sort Within Groups (Preserving Group Order)

**Objective:** Verify that tabs are sorted within groups while groups maintain their original positions.

#### Setup

1. Open a new browser window
2. Create **6 tabs** with the following URLs (in this order):
   - `https://github.com`
   - `https://youtube.com`
   - `https://google.com`
   - `https://amazon.com`
   - `https://wikipedia.org`
   - `https://reddit.com`

3. Create **Tab Group A** (name it "Work", color: blue):
   - Add tabs: `github.com`, `wikipedia.org`, `google.com` (note: intentionally unsorted)

4. Create **Tab Group B** (name it "Entertainment", color: red):
   - Add tabs: `youtube.com`, `reddit.com`

5. Leave `amazon.com` ungrouped

**Initial State:**
```
[Work: github.com, wikipedia.org, google.com] [Entertainment: youtube.com, reddit.com] amazon.com
```

#### Test Steps

1. Click the Tab Sorter extension icon
2. Verify the **"Respect Tab Groups"** checkbox is:
   - ✅ Visible under "Tab Groups" section
   - ✅ Checked by default
   - ✅ NOT disabled (API is available)
3. Click **"By URL"** sort button

#### Expected Result

- All tabs should remain in their original groups
- **Groups stay in their original positions** (Work first, then Entertainment, then ungrouped)
- Tabs within "Work" group should be sorted alphabetically by URL:
  - `github.com`, `google.com`, `wikipedia.org`
- Tabs within "Entertainment" group should be sorted:
  - `reddit.com`, `youtube.com`
- The ungrouped tab `amazon.com` remains in its relative position

**Final State:**
```
[Work: github.com, google.com, wikipedia.org] [Entertainment: reddit.com, youtube.com] amazon.com
```

---

### Scenario 2: Sort Without Respecting Groups (Legacy Behavior)

**Objective:** Verify that unchecking "Respect Tab Groups" causes tabs to be removed from groups and sorted globally.

#### Setup

Use the same tab configuration from Scenario 1.

#### Test Steps

1. Click the Tab Sorter extension icon
2. **Uncheck** "Respect Tab Groups"
3. Click **"By URL"** sort button

#### Expected Result

- Tabs are sorted globally by URL, ignoring groups
- **Groups may be broken** - tabs will be removed from their groups
- All tabs sorted alphabetically: amazon, github, google, reddit, wikipedia, youtube

---

### Scenario 3: Sort by Title with Tab Groups

**Objective:** Verify sorting by title works correctly with Tab Groups.

#### Setup

Create tabs with distinct titles and organize them into groups.

#### Test Steps

1. Ensure "Respect Tab Groups" is checked
2. Click **"By title"** sort button

#### Expected Result

- Tabs within each group sorted alphabetically by title
- Groups maintain their original positions
- Tabs remain in their groups

---

### Scenario 4: Sort by MRU with Tab Groups

**Objective:** Verify Most Recently Used sorting works with Tab Groups.

#### Setup

1. Create tabs and organize into groups
2. Click on tabs in a specific order to establish usage history

#### Test Steps

1. Ensure "Respect Tab Groups" is checked
2. Click **"By most recently used"** sort button

#### Expected Result

- Tabs within each group sorted by most recently used
- Groups maintain their original positions

---

### Scenario 5: Reverse Sorting with Tab Groups

**Objective:** Verify reverse sorting works correctly with Tab Groups.

#### Test Steps

1. Ensure "Respect Tab Groups" is checked
2. Check "Reverse sorting"
3. Click **"By URL"** sort button

#### Expected Result

- Tabs within each group sorted in reverse alphabetical order
- Groups maintain their original positions

---

### Scenario 6: Shuffle with Tab Groups

**Objective:** Verify that shuffle ignores the "Respect Tab Groups" setting.

#### Test Steps

1. Ensure "Respect Tab Groups" is checked
2. Click **"Shuffle tabs"** button

#### Expected Result

- All tabs are shuffled randomly
- **Tab Groups setting is ignored during shuffle** (by design)
- Tabs may be removed from their groups

---

### Scenario 7: Empty Group Handling

**Objective:** Verify behavior when a group becomes empty or contains only one tab.

#### Setup

Create a group with only one tab.

#### Test Steps

1. Ensure "Respect Tab Groups" is checked
2. Sort by URL

#### Expected Result

- Single-tab groups remain intact
- No errors in console

---

### Scenario 8: API Not Available (Old Browser)

**Objective:** Verify graceful degradation on browsers without Tab Groups API.

**Note:** This test requires an older browser version.

#### Expected Result

- "Respect Tab Groups" checkbox is visible but disabled
- Warning text: "Tab Groups not supported in this browser version"
- Sorting works normally (legacy behavior)

---

### Scenario 9: Sort All Windows with Tab Groups

**Objective:** Verify "Sort tabs in all windows" works with Tab Groups.

#### Setup

1. Open 2 browser windows
2. Create Tab Groups in both windows

#### Test Steps

1. Check "Sort tabs in all windows"
2. Ensure "Respect Tab Groups" is checked
3. Sort by URL

#### Expected Result

- Tabs in both windows are sorted
- Tab Groups are preserved in both windows

---

### Scenario 10: Suspended Tabs with Tab Groups

**Objective:** Verify suspended tabs grouping works with Tab Groups.

#### Setup

1. Create tabs and organize into groups
2. Suspend some tabs

#### Test Steps

1. Enable "Respect Tab Groups"
2. Set suspended tabs position to "Group at the end"
3. Sort by URL

#### Expected Result

- Tabs within groups are sorted
- Groups maintain their positions
- Within each group, active tabs come before suspended tabs

---

## Verification Checklist

### Chrome Testing

- [ ] Extension loads without errors
- [ ] "Respect Tab Groups" checkbox visible under "Tab Groups" section
- [ ] "Respect Tab Groups" is checked by default
- [ ] Scenario 1: Tabs sorted within groups, groups preserve positions
- [ ] Scenario 2: Unchecking "Respect Tab Groups" enables legacy sorting
- [ ] Scenario 3: Title sort works with groups
- [ ] Scenario 4: MRU sort works with groups
- [ ] Scenario 5: Reverse sorting works with groups
- [ ] Scenario 6: Shuffle ignores Tab Groups setting
- [ ] Scenario 9: Sort all windows works with groups
- [ ] Scenario 10: Suspended tabs grouping works with Tab Groups
- [ ] Console shows no errors during sorting

### Firefox Testing

- [ ] Extension loads without errors
- [ ] "Respect Tab Groups" checkbox visible under "Tab Groups" section
- [ ] "Respect Tab Groups" is checked by default
- [ ] Scenario 1: Tabs sorted within groups, groups preserve positions
- [ ] Scenario 2: Unchecking "Respect Tab Groups" enables legacy sorting
- [ ] Scenario 3: Title sort works with groups
- [ ] Scenario 4: MRU sort works with groups
- [ ] Scenario 5: Reverse sorting works with groups
- [ ] Scenario 6: Shuffle ignores Tab Groups setting
- [ ] Scenario 9: Sort all windows works with groups
- [ ] Scenario 10: Suspended tabs grouping works with Tab Groups
- [ ] Console shows no errors during sorting

---

## Debugging Tips

### Viewing Console Logs

**Chrome:**
1. Go to `chrome://extensions`
2. Click "Service Worker" link under Tab Sorter
3. View console in DevTools

**Firefox:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Inspect" next to Tab Sorter
3. View console in DevTools

### Common Log Messages

- `[Tab Sorter] (sortTabs): with 'sort_tabs_url', respectTabGroups=true` - Sorting with groups enabled
- `Sorting with tab groups support (preserving group positions)` - Groups mode active
- `Found X groups and Y ungrouped tabs` - Number of groups detected
- `getRespectTabGroupsCached 2 "true"` - Shows current Tab Groups setting

---

## Known Limitations

1. **Shuffle ignores Tab Groups** - By design, shuffle randomizes all tabs regardless of groups
2. **Firefox Tab Groups** - Requires Firefox 137 or later
3. **Group reordering not supported** - Groups always maintain their original positions (maybe later we can sort the groups themselves, using their names if available, or the first tab of the group as a rank)
