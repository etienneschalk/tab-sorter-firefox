# Suspended Tabs Grouping - Manual Testing Procedure

**Issue:** [#18 - Feature Request: Group Suspended Tabs](https://github.com/etienneschalk/tab-sorter-firefox/issues/18)

**Feature Summary:** When sorting tabs, the extension can now group suspended (discarded) tabs either at the end or at the beginning of the sorted list. Suspended tabs are tabs that have been unloaded from memory to save resources but remain visible in the tab bar.

## Prerequisites

### Browser Requirements

| Browser | Suspended Tabs Support |
|---------|----------------------|
| **Google Chrome** | `tab.discarded` property available |
| **Firefox** | `tab.discarded` property available |

### What are Suspended Tabs?

Suspended (or "discarded") tabs are tabs that have been unloaded from memory by the browser or an extension to save system resources. They appear in the tab bar but their content is not loaded until clicked.

**How to create suspended tabs for testing:**
- **Firefox:** Use the built-in "Unload Tab" feature (right-click on tab) or enable `browser.tabs.unloadOnLowMemory`
- **Chrome:** Use Chrome's built-in Memory Saver feature or extensions like "Auto Tab Discard"
- **Both:** Restart the browser with "Restore previous session" - tabs from previous session start as suspended

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

## Suspended Tabs Position Options

The extension provides three options for handling suspended tabs:

| Option | Description |
|--------|-------------|
| **Ignore discarded status** | Suspended tabs are sorted normally among other tabs (default) |
| **Group at the end** | Suspended tabs are moved to the end of the sorted list |
| **Group at the beginning** | Suspended tabs are moved to the beginning of the sorted list |

---

## Test Scenarios

### Scenario 1: Group Suspended Tabs at the End

**Objective:** Verify that suspended tabs are moved to the end when sorting with this option.

#### Setup

1. Open a new browser window
2. Create **6 tabs** with different websites:
   - `https://github.com`
   - `https://youtube.com`
   - `https://google.com`
   - `https://amazon.com`
   - `https://wikipedia.org`
   - `https://reddit.com`

3. Suspend some tabs (make them discarded):
   - **Firefox:** Right-click on `youtube.com`, `amazon.com`, `reddit.com` tabs and select "Unload Tab"
   - **Chrome:** Use an extension or wait for Memory Saver to kick in

**Initial State:**
```
github.com (active) | youtube.com (suspended) | google.com (active) | amazon.com (suspended) | wikipedia.org (active) | reddit.com (suspended)
```

#### Test Steps

1. Click the Tab Sorter extension icon
2. Find the **"Suspended Tabs"** section in Preferences
3. Select **"Group at the end"** from the dropdown
4. Click **"By URL"** sort button

#### Expected Result

- Tabs should be sorted alphabetically by URL
- **Active tabs come first**, followed by **suspended tabs**
- Within each group (active/suspended), tabs are sorted alphabetically

**Final State:**
```
github.com (active) | google.com (active) | wikipedia.org (active) | amazon.com (suspended) | reddit.com (suspended) | youtube.com (suspended)
```

---

### Scenario 2: Group Suspended Tabs at the Beginning

**Objective:** Verify that suspended tabs are moved to the beginning when sorting with this option.

#### Setup

Use the same tab configuration from Scenario 1.

#### Test Steps

1. Click the Tab Sorter extension icon
2. Find the **"Suspended Tabs"** section
3. Select **"Group at the beginning"** from the dropdown
4. Click **"By URL"** sort button

#### Expected Result

- Tabs should be sorted alphabetically by URL
- **Suspended tabs come first**, followed by **active tabs**
- Within each group, tabs are sorted alphabetically

**Final State:**
```
amazon.com (suspended) | reddit.com (suspended) | youtube.com (suspended) | github.com (active) | google.com (active) | wikipedia.org (active)
```

---

### Scenario 3: Ignore Discarded Status (Default)

**Objective:** Verify that when "Ignore discarded status" is selected, suspended tabs are sorted normally among other tabs.

#### Setup

Use the same tab configuration from Scenario 1.

#### Test Steps

1. Click the Tab Sorter extension icon
2. Select **"Ignore discarded status"** from the dropdown
3. Click **"By URL"** sort button

#### Expected Result

- Tabs should be sorted purely alphabetically by URL
- Discarded status is not considered

**Final State:**
```
amazon.com (suspended) | github.com (active) | google.com (active) | reddit.com (suspended) | wikipedia.org (active) | youtube.com (suspended)
```

---

### Scenario 4: Suspended Tabs with Tab Groups

**Objective:** Verify suspended tabs grouping works correctly with Tab Groups feature - suspended tabs are grouped **within each group**, not globally.

**Note:** This test requires a browser that supports Tab Groups (Chrome 89+, Firefox 137+).

#### Setup

1. Open a browser window
2. Create **6 tabs**:
   - `https://github.com`
   - `https://youtube.com`
   - `https://google.com`
   - `https://amazon.com`
   - `https://wikipedia.org`
   - `https://reddit.com`

3. Create **Tab Group A** ("Work"):
   - Add: `github.com`, `google.com`, `wikipedia.org`
   
4. Create **Tab Group B** ("Entertainment"):
   - Add: `youtube.com`, `reddit.com`
   
5. Leave `amazon.com` ungrouped

6. Suspend some tabs in each group:
   - In Work group: suspend `google.com`
   - In Entertainment group: suspend `reddit.com`

**Initial State:**
```
[Work: github.com (active), google.com (suspended), wikipedia.org (active)] [Entertainment: youtube.com (active), reddit.com (suspended)] amazon.com (active)
```

#### Test Steps

1. Enable "Respect Tab Groups"
2. Select **"Group at the end"** for suspended tabs
3. Sort by URL

#### Expected Result

- **Tab Groups are preserved** - tabs stay in their groups
- **Within each group**, active tabs come first, then suspended tabs
- Suspended tabs are NOT moved globally - they stay within their groups

**Final State:**
```
[Work: github.com (active), wikipedia.org (active), google.com (suspended)] [Entertainment: youtube.com (active), reddit.com (suspended)] amazon.com (active)
```

Notice:
- In Work group: `google.com` (suspended) moved to the end of the group
- In Entertainment group: `reddit.com` (suspended) is at the end
- Groups remain intact and in their original positions

---

### Scenario 5: Sort by Title with Suspended Grouping

**Objective:** Verify grouping works with title-based sorting.

#### Test Steps

1. Select "Group at the end" for suspended tabs
2. Click **"By title"** sort button

#### Expected Result

- Tabs sorted by title
- Active tabs come first, suspended tabs at the end
- Each group sorted alphabetically by title

---

### Scenario 6: Sort by MRU with Suspended Grouping

**Objective:** Verify grouping works with Most Recently Used sorting.

#### Test Steps

1. Click on several tabs to establish usage order
2. Select "Group at the end" for suspended tabs
3. Click **"By most recently used"** sort button

#### Expected Result

- Active tabs sorted by most recently used
- Suspended tabs at the end, sorted by their last access time

---

### Scenario 7: Shuffle Ignores Suspended Grouping

**Objective:** Verify that shuffle randomizes all tabs regardless of suspended status.

#### Test Steps

1. Select "Group at the end" for suspended tabs
2. Click **"Shuffle tabs"** button

#### Expected Result

- All tabs are randomly shuffled
- Suspended tabs grouping is **NOT** applied during shuffle (by design)

---

### Scenario 8: No Suspended Tabs Present

**Objective:** Verify the feature works correctly when no tabs are suspended.

#### Setup

Open several tabs, ensure all are active (loaded).

#### Test Steps

1. Select "Group at the end" for suspended tabs
2. Sort by any method

#### Expected Result

- Sorting works normally
- No errors in console

---

### Scenario 9: All Tabs Suspended

**Objective:** Verify sorting works when all tabs are suspended.

#### Setup

1. Open several tabs
2. Suspend all of them

#### Test Steps

1. Select "Group at the end" for suspended tabs
2. Sort by URL

#### Expected Result

- All tabs are sorted by URL
- Since all are suspended, they all stay in sorted order

---

### Scenario 10: Reverse Sorting with Suspended Grouping at End

**Objective:** Verify reverse sorting interacts correctly with suspended grouping.

#### Test Steps

1. Enable "Reverse sorting"
2. Select "Group at the end" for suspended tabs
3. Sort by URL

#### Expected Result

- Active tabs sorted in reverse alphabetical order (Z-A)
- Suspended tabs at the end, also in reverse order

---

### Scenario 11: Reverse Sorting with Suspended Grouping at Beginning

**Objective:** Verify reverse sorting interacts correctly with suspended grouping at beginning.

#### Test Steps

1. Enable "Reverse sorting"
2. Select "Group at the beginning" for suspended tabs
3. Sort by URL

#### Expected Result

- Suspended tabs at the beginning, sorted in reverse alphabetical order (Z-A)
- Active tabs follow, also in reverse order

---

### Scenario 12: Sort All Windows with Suspended Grouping

**Objective:** Verify "Sort tabs in all windows" respects suspended grouping.

#### Setup

1. Open 2 browser windows
2. Create tabs with some suspended in each window

#### Test Steps

1. Enable "Sort tabs in all windows"
2. Select "Group at the end" for suspended tabs
3. Sort by URL

#### Expected Result

- Both windows have tabs sorted
- In each window, active tabs come first, then suspended tabs

---

### Scenario 13: Pinned Tabs with Suspended Grouping

**Objective:** Verify pinned tabs sorting interacts correctly with suspended grouping.

#### Setup

1. Pin some tabs
2. Suspend some of the pinned tabs

#### Test Steps

1. Enable "Also sort pinned tabs"
2. Select "Group at the end" for suspended tabs
3. Sort by URL

#### Expected Result

- Pinned tabs sorted among themselves with active first, then suspended
- Unpinned tabs sorted with their own active/suspended grouping

---

### Scenario 14: Setting Persistence

**Objective:** Verify the selected position persists across browser sessions.

#### Test Steps

1. Select "Group at the beginning"
2. Close and reopen the browser
3. Open the extension popup

#### Expected Result

- "Group at the beginning" should still be selected

---

## Verification Checklist

### Chrome Testing

- [ ] Extension loads without errors
- [ ] "Suspended Tabs" section visible in preferences
- [ ] Dropdown shows all three options
- [ ] "Ignore discarded status" works correctly
- [ ] "Group at the end" works correctly
- [ ] "Group at the beginning" works correctly
- [ ] Title sort with suspended grouping works
- [ ] MRU sort with suspended grouping works
- [ ] Shuffle ignores suspended grouping
- [ ] Works with no suspended tabs
- [ ] Works when all tabs are suspended
- [ ] Reverse sorting works with suspended grouping
- [ ] Sort all windows works with suspended grouping
- [ ] Setting persists after browser restart
- [ ] Console shows no errors during sorting

### Firefox Testing

- [ ] Extension loads without errors
- [ ] "Suspended Tabs" section visible in preferences
- [ ] Dropdown shows all three options
- [ ] "Ignore discarded status" works correctly
- [ ] "Group at the end" works correctly
- [ ] "Group at the beginning" works correctly
- [ ] Title sort with suspended grouping works
- [ ] MRU sort with suspended grouping works
- [ ] Shuffle ignores suspended grouping
- [ ] Works with no suspended tabs
- [ ] Works when all tabs are suspended
- [ ] Reverse sorting works with suspended grouping
- [ ] Sort all windows works with suspended grouping
- [ ] Setting persists after browser restart
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

- `[Tab Sorter] (sortTabs): with 'sort_tabs_url'` - Sort initiated
- `Grouped X suspended tabs at the end` - Suspended tabs were grouped at end
- `Grouped X suspended tabs at the beginning` - Suspended tabs were grouped at beginning
- `getSuspendedTabsPositionCached 2 "end"` - Shows current suspended tabs position setting

### Identifying Suspended Tabs

In the browser console, you can check if a tab is suspended:

```javascript
// Chrome
chrome.tabs.query({currentWindow: true}, tabs => {
  tabs.forEach(t => console.log(t.title, t.discarded ? 'SUSPENDED' : 'active'));
});

// Firefox
browser.tabs.query({currentWindow: true}).then(tabs => {
  tabs.forEach(t => console.log(t.title, t.discarded ? 'SUSPENDED' : 'active'));
});
```

---

## Known Limitations

1. **Shuffle ignores suspended grouping** - By design, shuffle randomizes all tabs without considering suspended status
2. **Memory Saver timing** - Chrome's automatic tab discarding may take time; manually discarding is more reliable for testing
3. **Tab state after sort** - Moving tabs doesn't change their suspended state; they remain suspended until clicked
