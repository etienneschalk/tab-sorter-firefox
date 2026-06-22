# Sort Pinned Tabs - Manual Testing Procedure

**Issue:** [#9 - Option to sort Pinned Tabs](https://github.com/etienneschalk/tab-sorter-firefox/issues/9)

**Feature Summary:** Previously, pinned tabs were excluded from sorting. This feature adds an option to sort pinned tabs independently from non-pinned tabs. When enabled, pinned tabs are sorted among themselves while remaining in the pinned area.

## Prerequisites

### Browser Requirements

| Browser | Pinned Tabs Support |
|---------|---------------------|
| **Google Chrome** | Full support |
| **Firefox** | Full support |

### What are Pinned Tabs?

Pinned tabs are tabs that have been "pinned" to the left side of the tab bar. They appear as small icons and don't show the page title. Pinned tabs:
- Stay at the beginning of the tab bar
- Cannot be accidentally closed (require explicit unpin or close)
- Persist across browser restarts

**How to pin a tab:** Right-click on a tab and select "Pin Tab" (or similar).

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

### Scenario 1: Sort Pinned Tabs by URL

**Objective:** Verify that pinned tabs are sorted alphabetically by URL when the option is enabled.

#### Setup

1. Open a new browser window
2. Create **4 pinned tabs** with the following URLs:
   - `https://youtube.com` (pin it)
   - `https://github.com` (pin it)
   - `https://amazon.com` (pin it)
   - `https://google.com` (pin it)

3. Create **3 non-pinned tabs**:
   - `https://wikipedia.org`
   - `https://reddit.com`
   - `https://twitter.com`

**Initial State (pinned tabs in random order):**
```
[youtube] [github] [amazon] [google] | wikipedia | reddit | twitter
```

#### Test Steps

1. Click the Tab Sorter extension icon
2. Locate the **"Also sort pinned tabs"** checkbox under "General Preferences"
3. **Check** the checkbox
4. Click **"By URL"** sort button

#### Expected Result

- Pinned tabs should be sorted alphabetically by URL among themselves
- Non-pinned tabs should also be sorted alphabetically by URL
- Pinned tabs remain pinned and at the beginning

**Final State:**
```
[amazon] [github] [google] [youtube] | reddit | twitter | wikipedia
```

---

### Scenario 2: Pinned Tabs Not Sorted (Default Behavior)

**Objective:** Verify that when the option is disabled, pinned tabs are NOT sorted.

#### Setup

Use the same tab configuration from Scenario 1 (with pinned tabs in random order).

#### Test Steps

1. Click the Tab Sorter extension icon
2. Ensure **"Also sort pinned tabs"** is **unchecked** (default)
3. Click **"By URL"** sort button

#### Expected Result

- Pinned tabs remain in their original order (not sorted)
- Only non-pinned tabs are sorted alphabetically by URL

**Final State:**
```
[youtube] [github] [amazon] [google] | reddit | twitter | wikipedia
```
(Pinned tabs unchanged, non-pinned tabs sorted)

---

### Scenario 3: Sort Pinned Tabs by Title

**Objective:** Verify sorting pinned tabs by title works correctly.

#### Setup

1. Pin tabs with different page titles:
   - `https://en.wikipedia.org/wiki/Zebra` (title: "Zebra - Wikipedia")
   - `https://en.wikipedia.org/wiki/Apple` (title: "Apple - Wikipedia")
   - `https://en.wikipedia.org/wiki/Banana` (title: "Banana - Wikipedia")

#### Test Steps

1. Enable "Also sort pinned tabs"
2. Click **"By title"** sort button

#### Expected Result

- Pinned tabs sorted alphabetically by title: Apple, Banana, Zebra

---

### Scenario 4: Sort Pinned Tabs by MRU

**Objective:** Verify Most Recently Used sorting works with pinned tabs.

#### Setup

1. Create and pin 4 tabs
2. Access them in a specific order (click on each)

#### Test Steps

1. Enable "Also sort pinned tabs"
2. Click **"By most recently used"** sort button

#### Expected Result

- Pinned tabs sorted by most recently accessed

---

### Scenario 5: Sort Pinned Tabs by Favicon

**Objective:** Verify favicon sorting works with pinned tabs.

#### Setup

1. Pin tabs from different websites (different favicons)

#### Test Steps

1. Enable "Also sort pinned tabs"
2. Click **"By icon"** sort button

#### Expected Result

- Pinned tabs sorted by favicon, then by title within same favicon

---

### Scenario 6: Reverse Sorting with Pinned Tabs

**Objective:** Verify reverse sorting affects pinned tabs correctly.

#### Setup

Create and pin multiple tabs.

#### Test Steps

1. Enable both "Reverse sorting" and "Also sort pinned tabs"
2. Click **"By URL"** sort button

#### Expected Result

- Pinned tabs sorted in reverse alphabetical order by URL
- Non-pinned tabs also sorted in reverse order

---

### Scenario 7: Shuffle Does Not Affect Pinned Tabs

**Objective:** Verify that shuffle ignores the "sort pinned tabs" setting.

#### Setup

Create both pinned and non-pinned tabs.

#### Test Steps

1. Enable "Also sort pinned tabs"
2. Click **"Shuffle tabs"** button

#### Expected Result

- Only non-pinned tabs are shuffled
- Pinned tabs remain in their positions (shuffle always ignores pinned tabs)

---

### Scenario 8: Pinned Tabs with Suspended Tabs Grouping

**Objective:** Verify pinned tabs sorting works together with suspended tabs grouping.

#### Setup

1. Create and pin multiple tabs
2. Suspend some of the pinned tabs (if possible via browser or extension)

#### Test Steps

1. Enable both "Group suspended tabs at the end" and "Also sort pinned tabs"
2. Sort by URL

#### Expected Result

- Pinned tabs are sorted
- Among pinned tabs, active ones come first, then suspended ones (at the end of pinned section)

---

### Scenario 9: No Pinned Tabs Present

**Objective:** Verify the feature works correctly when no tabs are pinned.

#### Setup

Open several tabs, ensure none are pinned.

#### Test Steps

1. Enable "Also sort pinned tabs"
2. Sort by any method

#### Expected Result

- Sorting works normally
- No errors in console

---

### Scenario 10: All Tabs Pinned

**Objective:** Verify sorting works when all tabs are pinned.

#### Setup

1. Open several tabs
2. Pin ALL of them

#### Test Steps

1. Enable "Also sort pinned tabs"
2. Sort by URL

#### Expected Result

- All (pinned) tabs are sorted by URL
- They remain pinned

---

### Scenario 11: Pinned Tabs with Tab Groups

**Objective:** Verify pinned tabs sorting works alongside Tab Groups feature.

**Note:** Tab groups cannot contain pinned tabs (browser limitation).

#### Setup

1. Create some pinned tabs
2. Create Tab Groups with non-pinned tabs

#### Test Steps

1. Enable "Respect Tab Groups", "Also sort pinned tabs"
2. Sort by URL

#### Expected Result

- Pinned tabs are sorted independently
- Tab Groups are preserved for non-pinned tabs

---

### Scenario 12: Sort All Windows with Pinned Tabs

**Objective:** Verify "Sort tabs in all windows" works with pinned tabs sorting.

#### Setup

1. Open 2 browser windows
2. Pin tabs in both windows

#### Test Steps

1. Enable both "Sort tabs in all windows" and "Also sort pinned tabs"
2. Sort by URL

#### Expected Result

- Pinned tabs in both windows are sorted
- Non-pinned tabs in both windows are sorted

---

## Verification Checklist

### Chrome Testing

- [ ] Extension loads without errors
- [ ] "Also sort pinned tabs" checkbox is visible in General Preferences
- [ ] Scenario 1: Pinned tabs sorted by URL when enabled
- [ ] Scenario 2: Pinned tabs NOT sorted when disabled (default)
- [ ] Scenario 3: Title sort works with pinned tabs
- [ ] Scenario 4: MRU sort works with pinned tabs
- [ ] Scenario 5: Favicon sort works with pinned tabs
- [ ] Scenario 6: Reverse sorting works with pinned tabs
- [ ] Scenario 7: Shuffle ignores pinned tabs
- [ ] Scenario 9: Works with no pinned tabs
- [ ] Scenario 10: Works when all tabs are pinned
- [ ] Console shows no errors during sorting

### Firefox Testing

- [ ] Extension loads without errors
- [ ] "Also sort pinned tabs" checkbox is visible in General Preferences
- [ ] Scenario 1: Pinned tabs sorted by URL when enabled
- [ ] Scenario 2: Pinned tabs NOT sorted when disabled (default)
- [ ] Scenario 3: Title sort works with pinned tabs
- [ ] Scenario 4: MRU sort works with pinned tabs
- [ ] Scenario 5: Favicon sort works with pinned tabs
- [ ] Scenario 6: Reverse sorting works with pinned tabs
- [ ] Scenario 7: Shuffle ignores pinned tabs
- [ ] Scenario 9: Works with no pinned tabs
- [ ] Scenario 10: Works when all tabs are pinned
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

- `[Tab Sorter] (sortTabs): with 'sort_tabs_url', sortPinnedTabs=true` - Confirms pinned tabs sorting is enabled
- `[Tab Sorter] Found X pinned tabs and Y non-pinned tabs` - Shows tab counts
- `[Tab Sorter] (sortTabs): Sorting X pinned tabs` - Confirms pinned tabs are being sorted

---

## Known Limitations

1. **Shuffle always ignores pinned tabs** - By design, shuffle only affects non-pinned tabs
2. **Tab Groups cannot contain pinned tabs** - This is a browser limitation, not an extension limitation
3. **Pinned tabs cannot be moved across windows** - Browser limitation
