# Tab Groups Support - Manual Testing Procedure

**Issue:** [#19 - Tab Groups Support](https://github.com/etienneschalk/tab-sorter-firefox/issues/19)

**Feature Summary:** When sorting tabs, the extension now respects Tab Groups. Two options are available:
1. **Respect Tab Groups** - Tabs within each group are sorted separately, keeping them in their groups
2. **Also reorder groups themselves** - Groups are reordered by their "representative" tab (first tab after sorting)

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

### Scenario 1: Sort Within Groups Only (Preserve Group Order)

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
3. Verify the **"Also reorder groups themselves"** checkbox is:
   - ✅ Visible as a sub-option (indented)
   - ✅ Checked by default
   - ✅ NOT disabled
4. **Uncheck** "Also reorder groups themselves"
5. Click **"By URL"** sort button

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

### Scenario 2: Sort Within Groups AND Reorder Groups

**Objective:** Verify that when "Also reorder groups themselves" is checked, groups are reordered by their representative tab.

#### Setup

Use the same initial tab configuration from Scenario 1:
```
[Work: github.com, wikipedia.org, google.com] [Entertainment: youtube.com, reddit.com] amazon.com
```

#### Test Steps

1. Click the Tab Sorter extension icon
2. Ensure **"Respect Tab Groups"** is checked
3. Ensure **"Also reorder groups themselves"** is checked
4. Click **"By URL"** sort button

#### Expected Result

- All tabs should remain in their original groups
- Tabs within each group are sorted alphabetically by URL
- **Groups are reordered** based on their first sorted tab's URL:
  - `amazon.com` (ungrouped) comes first (starts with 'a')
  - Work group representative: `github.com` (starts with 'g')
  - Entertainment group representative: `reddit.com` (starts with 'r')

**Final State:**
```
amazon.com [Work: github.com, google.com, wikipedia.org] [Entertainment: reddit.com, youtube.com]
```

---

### Scenario 3: Legacy Behavior When Tab Groups Disabled

**Objective:** Verify that unchecking "Respect Tab Groups" reverts to legacy behavior.

#### Setup

Use the same tab configuration from Scenario 1.

#### Test Steps

1. Click the Tab Sorter extension icon
2. **Uncheck** the "Respect Tab Groups" checkbox
3. Note that "Also reorder groups themselves" becomes disabled (grayed out)
4. Click **"By URL"** sort button

#### Expected Result

- All tabs should be sorted globally by URL
- **Tabs will be removed from their groups** (legacy behavior)
- Final order should be alphabetical by URL:
  - `amazon.com`, `github.com`, `google.com`, `reddit.com`, `wikipedia.org`, `youtube.com`

---

### Scenario 4: Sort by Title Within Groups (No Group Reorder)

**Objective:** Verify sorting by title works within groups while preserving group positions.

#### Setup

1. Create tabs with different titles (navigate and wait for pages to load):
   - `https://en.wikipedia.org/wiki/Zebra` (title: "Zebra - Wikipedia")
   - `https://en.wikipedia.org/wiki/Apple` (title: "Apple - Wikipedia")
   - `https://en.wikipedia.org/wiki/Banana` (title: "Banana - Wikipedia")

2. Create a group "Fruits & Animals" with all three tabs

#### Test Steps

1. Ensure "Respect Tab Groups" is checked
2. **Uncheck** "Also reorder groups themselves"
3. Click **"By title"** sort button

#### Expected Result

- Tabs should remain in the group
- Order within group: Apple, Banana, Zebra (alphabetical by title)
- Group position unchanged

---

### Scenario 5: Sort by Favicon Within Groups

**Objective:** Verify favicon sorting preserves groups.

#### Setup

1. Open multiple tabs from different sites:
   - 2 tabs from `github.com` (different pages)
   - 2 tabs from `google.com` (different pages)
   - 2 tabs from `youtube.com` (different pages)

2. Create groups:
   - Group "Dev": 1 github tab, 1 google tab
   - Group "Media": 1 youtube tab, 1 github tab
   - Leave remaining tabs ungrouped

#### Test Steps

1. Ensure "Respect Tab Groups" is checked
2. Toggle "Also reorder groups themselves" and test both states
3. Click **"By icon"** sort button

#### Expected Result

- Groups remain intact
- Within each group, tabs are sorted by favicon then title
- Ungrouped tabs are sorted by favicon then title
- With reorder ON: groups interleave with ungrouped based on representative
- With reorder OFF: groups maintain original positions

---

### Scenario 6: MRU Sorting With Groups

**Objective:** Verify Most Recently Used sorting works with groups.

#### Setup

1. Create 5 tabs and put 3 in a group
2. Access tabs in this order (click on each):
   - Tab 1 (grouped)
   - Tab 4 (ungrouped)
   - Tab 2 (grouped)
   - Tab 5 (ungrouped)
   - Tab 3 (grouped)

#### Test Steps

1. Ensure "Respect Tab Groups" is checked
2. Click **"By most recently used"** sort button

#### Expected Result

- Grouped tabs should remain in the group, sorted by access time
- Ungrouped tabs sorted by access time
- Most recently accessed tabs appear first (or last if reverse is checked)

---

### Scenario 7: Shuffle Ignores Tab Groups Setting

**Objective:** Verify that shuffle always uses legacy behavior.

#### Setup

Use any tab configuration with groups.

#### Test Steps

1. Ensure "Respect Tab Groups" is checked
2. Click **"Shuffle tabs"** button

#### Expected Result

- Tabs should be shuffled randomly
- Tabs may be removed from groups (shuffle ignores the tab groups setting)

---

### Scenario 8: Pinned Tabs Are Not Affected

**Objective:** Verify pinned tabs are excluded from sorting.

#### Setup

1. Create 5 tabs
2. Pin the first 2 tabs
3. Create a group with 2 of the unpinned tabs

#### Test Steps

1. Sort by any method with "Respect Tab Groups" enabled

#### Expected Result

- Pinned tabs remain in their positions
- Only unpinned tabs are sorted
- Groups are preserved among unpinned tabs

---

### Scenario 9: Browser Without Tab Groups API (Edge Case)

**Objective:** Verify graceful degradation on older browsers.

**Note:** This test requires an older browser version (Firefox < 137 or Chrome < 89).

#### Test Steps

1. Install the extension on an older browser
2. Open the extension popup

#### Expected Result

- "Respect Tab Groups" checkbox should be:
  - ✅ Visible but disabled (grayed out)
  - ✅ Shows message: "Tab Groups not supported in this browser version"
- "Also reorder groups themselves" checkbox should be:
  - ✅ Visible but disabled (grayed out)
  - ✅ Shows same message
- Sorting should work using legacy behavior

---

### Scenario 10: Reorder Checkbox Disabled When Respect Groups Unchecked

**Objective:** Verify that "Also reorder groups themselves" is disabled when "Respect Tab Groups" is unchecked.

#### Test Steps

1. Click the Tab Sorter extension icon
2. Note initial state of both checkboxes (both checked and enabled)
3. **Uncheck** "Respect Tab Groups"
4. Observe "Also reorder groups themselves"

#### Expected Result

- "Also reorder groups themselves" should become:
  - ✅ Disabled (grayed out, cannot be clicked)
  - ✅ Shows message: "Requires 'Respect Tab Groups' to be enabled"

---

### Scenario 11: Empty Groups Handling

**Objective:** Verify behavior when a group becomes empty.

#### Setup

1. Create a group with 2 tabs
2. Move one tab out of the group manually

#### Test Steps

1. Sort with "Respect Tab Groups" enabled

#### Expected Result

- Remaining tab in group stays in group
- Sorting completes without errors

---

### Scenario 12: Cross-Window Sorting With Groups

**Objective:** Verify "Sort tabs in all windows" works with groups.

#### Setup

1. Open 2 browser windows
2. Create groups in each window
3. Check "Sort tabs in all windows" option

#### Test Steps

1. Ensure both "Respect Tab Groups" and "Sort tabs in all windows" are checked
2. Sort by URL

#### Expected Result

- Groups in each window are preserved
- Tabs within groups are sorted
- Each window maintains its own groups

---

## Verification Checklist

### Chrome Testing

- [ ] Extension loads without errors
- [ ] Tab Groups checkbox is enabled (not disabled)
- [ ] Reorder Groups checkbox is enabled when Respect Groups is checked
- [ ] Reorder Groups checkbox is disabled when Respect Groups is unchecked
- [ ] Scenario 1: Sort within groups only (preserve group order)
- [ ] Scenario 2: Sort within groups AND reorder groups
- [ ] Scenario 3: Legacy behavior when disabled
- [ ] Scenario 4: Title sort within groups
- [ ] Scenario 5: Favicon sort within groups
- [ ] Scenario 6: MRU sort within groups
- [ ] Scenario 7: Shuffle ignores setting
- [ ] Scenario 8: Pinned tabs unaffected
- [ ] Console shows no errors during sorting

### Firefox Testing

- [ ] Extension loads without errors
- [ ] Tab Groups checkbox is enabled (not disabled)
- [ ] Reorder Groups checkbox is enabled when Respect Groups is checked
- [ ] Reorder Groups checkbox is disabled when Respect Groups is unchecked
- [ ] Scenario 1: Sort within groups only (preserve group order)
- [ ] Scenario 2: Sort within groups AND reorder groups
- [ ] Scenario 3: Legacy behavior when disabled
- [ ] Scenario 4: Title sort within groups
- [ ] Scenario 5: Favicon sort within groups
- [ ] Scenario 6: MRU sort within groups
- [ ] Scenario 7: Shuffle ignores setting
- [ ] Scenario 8: Pinned tabs unaffected
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

- `[Tab Sorter] (sortTabs): with 'sort_tabs_url', respectTabGroups=true` - Confirms tab groups mode
- `[Tab Sorter] (sortTabs): Sorting with tab groups support, reorderGroups=true` - Confirms reorder mode
- `[Tab Sorter] (sortTabs): Sorting with tab groups support, reorderGroups=false` - Confirms preserve position mode
- `[Tab Sorter] (sortTabs): Found X groups and Y ungrouped tabs` - Shows group detection
- `[Tab Sorter] (sortTabs): Reordering groups by representative tab` - Reorder mode active
- `[Tab Sorter] (sortTabs): Preserving group positions, only sorting within groups` - Preserve mode active
- `[Tab Sorter] (sortTabs): Sorting without tab groups support (legacy mode)` - Legacy mode active

---

## Known Limitations

1. **Shuffle always ignores groups** - By design, shuffle randomizes all tabs regardless of the setting
2. **Cross-window groups** - Groups cannot span multiple windows (browser limitation)
3. **Collapsed groups** - The extension sorts tabs within collapsed groups, but the visual order may not be immediately visible until expanded
4. **Reorder requires Respect Groups** - The "Also reorder groups themselves" option only works when "Respect Tab Groups" is enabled
