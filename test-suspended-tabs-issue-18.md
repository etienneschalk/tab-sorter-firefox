# Suspended Tabs Grouping - Manual Testing Procedure

**Issue:** [#18 - Feature Request: Group Suspended Tabs](https://github.com/etienneschalk/tab-sorter-firefox/issues/18)

**Feature Summary:** When sorting tabs, the extension can now group suspended (discarded) tabs at the end of the sorted list. Suspended tabs are tabs that have been unloaded from memory to save resources but remain visible in the tab bar.

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

## Test Scenarios

### Scenario 1: Group Suspended Tabs at the End

**Objective:** Verify that suspended tabs are moved to the end when sorting with the option enabled.

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
2. Locate the **"Group suspended tabs at the end"** checkbox under "General Preferences"
3. **Check** the checkbox
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

### Scenario 2: Normal Sorting (Without Grouping Suspended)

**Objective:** Verify that when the option is disabled, suspended tabs are sorted normally among other tabs.

#### Setup

Use the same tab configuration from Scenario 1.

#### Test Steps

1. Click the Tab Sorter extension icon
2. **Uncheck** the "Group suspended tabs at the end" checkbox
3. Click **"By URL"** sort button

#### Expected Result

- Tabs should be sorted alphabetically by URL regardless of suspended status
- Suspended and active tabs are interleaved based on their URL

**Final State:**
```
amazon.com (suspended) | github.com (active) | google.com (active) | reddit.com (suspended) | wikipedia.org (active) | youtube.com (suspended)
```

---

### Scenario 3: Suspended Tabs with Tab Groups

**Objective:** Verify that suspended tabs grouping works together with Tab Groups support.

#### Setup

1. Create tabs and suspend some of them
2. Create Tab Groups containing both active and suspended tabs

#### Test Steps

1. Enable both "Respect Tab Groups" and "Group suspended tabs at the end"
2. Sort by URL

#### Expected Result

- Tab Groups are preserved
- Within the sorted order, active tabs come before suspended tabs
- Groups maintain their integrity

---

### Scenario 4: Sort by Title with Suspended Grouping

**Objective:** Verify sorting by title works with suspended tabs grouping.

#### Setup

1. Create tabs with different page titles
2. Suspend some of them

#### Test Steps

1. Enable "Group suspended tabs at the end"
2. Click **"By title"** sort button

#### Expected Result

- Active tabs sorted alphabetically by title, then suspended tabs sorted alphabetically by title

---

### Scenario 5: Sort by MRU with Suspended Grouping

**Objective:** Verify Most Recently Used sorting works with suspended tabs grouping.

#### Setup

1. Create several tabs
2. Access them in a specific order
3. Suspend some tabs

#### Test Steps

1. Enable "Group suspended tabs at the end"
2. Click **"By most recently used"** sort button

#### Expected Result

- Active tabs sorted by most recently used
- Suspended tabs at the end, also sorted by most recently used among themselves

---

### Scenario 6: Shuffle Ignores Suspended Grouping

**Objective:** Verify that shuffle randomizes all tabs regardless of suspended status.

#### Setup

Create tabs with some suspended.

#### Test Steps

1. Enable "Group suspended tabs at the end"
2. Click **"Shuffle tabs"** button

#### Expected Result

- Tabs are shuffled randomly
- Suspended tabs are NOT grouped at the end (shuffle ignores this setting)

---

### Scenario 7: No Suspended Tabs Present

**Objective:** Verify the feature works correctly when no tabs are suspended.

#### Setup

Open several tabs, ensure none are suspended.

#### Test Steps

1. Enable "Group suspended tabs at the end"
2. Sort by any method

#### Expected Result

- Sorting works normally
- No errors in console
- All tabs sorted according to chosen method

---

### Scenario 8: All Tabs Suspended

**Objective:** Verify the feature works when all tabs are suspended.

#### Setup

1. Open several tabs
2. Suspend all of them except the active tab (you cannot suspend the active tab)

#### Test Steps

1. Enable "Group suspended tabs at the end"
2. Sort by URL

#### Expected Result

- The active tab comes first
- All suspended tabs are sorted after it

---

### Scenario 9: Reverse Sorting with Suspended Grouping

**Objective:** Verify reverse sorting works with suspended tabs grouping.

#### Setup

Create tabs with some suspended.

#### Test Steps

1. Enable both "Reverse sorting" and "Group suspended tabs at the end"
2. Sort by URL

#### Expected Result

- Active tabs sorted in reverse alphabetical order
- Suspended tabs at the end, also in reverse alphabetical order

---

### Scenario 10: Sort All Windows with Suspended Grouping

**Objective:** Verify "Sort tabs in all windows" works with suspended grouping.

#### Setup

1. Open 2 browser windows
2. Create tabs in both windows with some suspended

#### Test Steps

1. Enable both "Sort tabs in all windows" and "Group suspended tabs at the end"
2. Sort by URL

#### Expected Result

- Tabs in both windows are sorted
- In each window, suspended tabs are grouped at the end

---

## Verification Checklist

### Chrome Testing

- [ ] Extension loads without errors
- [ ] "Group suspended tabs at the end" checkbox is visible
- [ ] Scenario 1: Suspended tabs grouped at end when enabled
- [ ] Scenario 2: Normal sorting when disabled
- [ ] Scenario 3: Works with Tab Groups
- [ ] Scenario 4: Title sort with suspended grouping
- [ ] Scenario 5: MRU sort with suspended grouping
- [ ] Scenario 6: Shuffle ignores setting
- [ ] Scenario 7: Works with no suspended tabs
- [ ] Scenario 9: Reverse sorting works
- [ ] Console shows no errors during sorting

### Firefox Testing

- [ ] Extension loads without errors
- [ ] "Group suspended tabs at the end" checkbox is visible
- [ ] Scenario 1: Suspended tabs grouped at end when enabled
- [ ] Scenario 2: Normal sorting when disabled
- [ ] Scenario 3: Works with Tab Groups
- [ ] Scenario 4: Title sort with suspended grouping
- [ ] Scenario 5: MRU sort with suspended grouping
- [ ] Scenario 6: Shuffle ignores setting
- [ ] Scenario 7: Works with no suspended tabs
- [ ] Scenario 9: Reverse sorting works
- [ ] Console shows no errors during sorting

---

## Debugging Tips

### How to Identify Suspended Tabs

**Firefox:**
- Suspended tabs appear slightly faded/greyed out
- Check `about:performance` to see tab memory usage

**Chrome:**
- Look for tabs with a faded favicon
- Check `chrome://discards` to see discarded tabs

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

- `[Tab Sorter] Grouped X suspended tabs at the end` - Confirms suspended tabs were moved

---

## Known Limitations

1. **Cannot suspend active tab** - The browser prevents suspending the currently active tab
2. **Shuffle ignores setting** - By design, shuffle randomizes all tabs regardless of suspended status
3. **Tab appearance** - Suspended tabs may appear differently depending on browser settings and themes
