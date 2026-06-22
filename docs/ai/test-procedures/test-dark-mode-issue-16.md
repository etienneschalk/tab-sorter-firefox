# Dark Mode - Manual Testing Procedure

**Issue:** [#16 - Add a Dark Mode](https://github.com/etienneschalk/tab-sorter-firefox/issues/16)

**Feature Summary:** Adds dark mode support to the extension popup with automatic system theme detection. The default theme is dark mode, with options for auto (follow system), dark, and light themes.

## Prerequisites

### Browser Requirements

| Browser | Support |
|---------|---------|
| **Google Chrome** | Full support |
| **Firefox** | Full support |

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

### Scenario 1: Default Dark Theme

**Objective:** Verify that the extension defaults to dark mode on first use.

#### Setup

1. Clear extension storage (or use a fresh browser profile)
2. Install the extension

#### Test Steps

1. Click the Tab Sorter extension icon

#### Expected Result

- The popup should appear with a **dark theme**
- Background should be dark blue (`#1a1a2e`)
- Text should be light colored (`#e4e4e4`)
- The theme selector should show "Dark" as selected

---

### Scenario 2: Theme Selector - Switch to Light Mode

**Objective:** Verify that users can switch to light mode.

#### Test Steps

1. Open the extension popup
2. Find the "Appearance" section in Preferences
3. Click the theme dropdown
4. Select "Light"

#### Expected Result

- The popup **immediately** changes to light theme
- Background becomes white
- Text becomes dark
- Card backgrounds become light gray (#eee)
- The setting persists after closing and reopening the popup

---

### Scenario 3: Theme Selector - Switch to Auto Mode

**Objective:** Verify that auto mode follows the system preference.

#### Setup

1. Know how to change your system's color scheme:
   - **Windows 10/11:** Settings > Personalization > Colors > Choose your color
   - **macOS:** System Preferences > Appearance
   - **Linux (GNOME):** Settings > Appearance
   - **Firefox specific:** `about:config` > `ui.systemUsesDarkTheme`

#### Test Steps (System in Dark Mode)

1. Set your system to dark mode
2. Open extension popup
3. Select "Auto (follow system)" from the theme dropdown

#### Expected Result

- Popup should display in dark theme

#### Test Steps (System in Light Mode)

1. Set your system to light mode
2. Open extension popup (with Auto still selected)

#### Expected Result

- Popup should display in light theme

---

### Scenario 4: Theme Persistence

**Objective:** Verify that the selected theme persists across browser sessions.

#### Test Steps

1. Open the extension popup
2. Select "Light" theme
3. Close the popup
4. Close and reopen the browser
5. Open the extension popup again

#### Expected Result

- The popup should still be in light theme
- The theme selector should show "Light" as selected

---

### Scenario 5: UI Elements in Dark Mode

**Objective:** Verify all UI elements are properly styled in dark mode.

#### Test Steps

1. Ensure dark mode is active
2. Examine each UI element:
   - Header text
   - Section headers (h2, h3)
   - Checkbox labels
   - Buttons (action buttons)
   - Links
   - Select dropdowns
   - Card backgrounds
   - Keyboard shortcuts (kbd elements)
   - Warning/help text
   - Version number footer

#### Expected Result

| Element | Dark Mode Appearance |
|---------|---------------------|
| Background | Dark blue (#1a1a2e) |
| Cards | Slightly lighter blue (#16213e) |
| Text | Light gray (#e4e4e4) |
| Links | Light blue (#6db3f2) |
| Buttons | Dark blue gradient |
| Borders | Purple-ish gray (#404060) |
| Muted text | Gray (#888) |

---

### Scenario 6: UI Elements in Light Mode

**Objective:** Verify all UI elements are properly styled in light mode.

#### Test Steps

1. Switch to light mode
2. Examine the same UI elements as Scenario 5

#### Expected Result

| Element | Light Mode Appearance |
|---------|----------------------|
| Background | White |
| Cards | Light gray (#eee) |
| Text | Black |
| Links | Blue |
| Buttons | Light gray gradient |
| Borders | Gray (#ccc) |
| Muted text | Dark gray (#999) |

---

### Scenario 7: Button Interaction in Dark Mode

**Objective:** Verify buttons work and look correct in dark mode.

#### Test Steps

1. Ensure dark mode is active
2. Hover over a sort button
3. Click a sort button

#### Expected Result

- Button has visible hover state (color change)
- Button click provides visual feedback
- Button text is readable at all states

---

### Scenario 8: Select Dropdown in Dark Mode

**Objective:** Verify select dropdowns are readable in dark mode.

#### Test Steps

1. Ensure dark mode is active
2. Click on the "Default sort method" dropdown
3. View the options
4. Click on the "Theme" dropdown
5. View the options

#### Expected Result

- Dropdown background matches theme
- Options are clearly readable
- Selected option is visible
- Dropdown border is visible

---

### Scenario 9: Disabled Elements in Dark Mode

**Objective:** Verify disabled elements are distinguishable in dark mode.

#### Setup

Use a browser that doesn't support Tab Groups (or disable Tab Groups API detection for testing).

#### Test Steps

1. Ensure dark mode is active
2. Look at disabled checkboxes (e.g., "Respect Tab Groups" on unsupported browsers)

#### Expected Result

- Disabled elements are visually distinct
- Warning text is readable (yellow/gold color)
- Disabled state is clear

---

### Scenario 10: Theme Change During Active Session

**Objective:** Verify theme changes are applied immediately without popup restart.

#### Test Steps

1. Open the popup in dark mode
2. Change to light mode using the dropdown
3. Immediately verify colors changed
4. Change back to dark mode

#### Expected Result

- Each theme change is **instant**
- No need to close/reopen popup
- All elements update simultaneously

---

### Scenario 11: Localization Check (French)

**Objective:** Verify theme labels are properly translated.

#### Setup

Change browser language to French or test in French locale.

#### Test Steps

1. Open extension popup
2. Find the Appearance section

#### Expected Result

- Section title: "Apparence"
- Theme label: "Thème :"
- Options: "Auto (suivre le système)", "Sombre", "Clair"

---

### Scenario 12: Cross-Browser Consistency

**Objective:** Verify consistent appearance across browsers.

#### Test Steps

1. Test dark mode in Chrome
2. Test dark mode in Firefox
3. Compare visual appearance

#### Expected Result

- Theme looks consistent across both browsers
- Colors are identical
- Layout is the same

---

## Verification Checklist

### Chrome Testing

- [ ] Extension loads without errors
- [ ] Default theme is dark
- [ ] Can switch to light mode
- [ ] Can switch to auto mode
- [ ] Auto mode detects system preference
- [ ] Theme persists after browser restart
- [ ] All UI elements readable in dark mode
- [ ] All UI elements readable in light mode
- [ ] Buttons work correctly
- [ ] Dropdowns work correctly
- [ ] Instant theme switching works

### Firefox Testing

- [ ] Extension loads without errors
- [ ] Default theme is dark
- [ ] Can switch to light mode
- [ ] Can switch to auto mode
- [ ] Auto mode detects system preference
- [ ] Theme persists after browser restart
- [ ] All UI elements readable in dark mode
- [ ] All UI elements readable in light mode
- [ ] Buttons work correctly
- [ ] Dropdowns work correctly
- [ ] Instant theme switching works

---

## Debugging Tips

### Viewing Console Logs

**Chrome:**
1. Right-click the extension popup
2. Select "Inspect"
3. View console

**Firefox:**
1. Right-click the extension popup
2. Select "Inspect Element"
3. View console

### Common Log Messages

- `[Tab Sorter] Applied theme: dark (resolved to: dark)` - Theme was applied
- `[Tab Sorter] Applied theme: auto (resolved to: dark)` - Auto mode resolved to dark
- `[Tab Sorter] Initial State: theme dark` - Shows stored theme preference

### Testing System Theme Detection

To test auto theme detection without changing system settings:

**Chrome DevTools:**
1. Open DevTools (F12)
2. Press Ctrl+Shift+P (Command+Shift+P on Mac)
3. Type "Rendering"
4. Find "Emulate CSS media feature prefers-color-scheme"
5. Select "prefers-color-scheme: dark" or "prefers-color-scheme: light"

**Firefox:**
1. Go to `about:config`
2. Search for `ui.systemUsesDarkTheme`
3. Set to `1` for dark or `0` for light

---

## Known Limitations

1. **System theme changes while popup is open** - The popup may not automatically update if the system theme changes while the popup is open (requires reopening)
2. **First-time users see dark mode** - By design, dark mode is the default for new users
