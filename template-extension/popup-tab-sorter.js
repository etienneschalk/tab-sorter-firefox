import { loadInitialState } from "./lib/load-initial-state.js";
import { applyDocumentLocale } from "./lib/locale-logic.js";
import { applyTheme as applyThemeToDocument } from "./lib/theme-logic.js";
import { COMMAND_DISPLAY_PRIORITY } from "./popup/constants.js";
import { registerPopupEventListeners } from "./popup/events.js";
import { logCommands, mountPopup } from "./popup/render.js";

function applyTheme(theme) {
  const resolvedTheme = applyThemeToDocument(theme, document);
  console.log(
    `[Tab Sorter] Applied theme: ${theme} (resolved to: ${resolvedTheme})`,
  );
}

registerPopupEventListeners(applyTheme);

applyDocumentLocale(document);

(async () => {
  try {
    const initialState = await loadInitialState();
    console.debug("== Popup initial state loaded");

    applyTheme(initialState.theme);
    initializeUserInterface(initialState);
  } catch (error) {
    console.error("[Tab Sorter] Popup failed to load", error);
    const container = document.getElementById("container");
    if (container) {
      container.textContent = "Tab Sorter failed to load. See the browser console.";
    }
  }
})();

function initializeUserInterface(initialState) {
  const {
    isReverse,
    isAllWindows,
    isAutoOnNewTab,
    isCloseDuplicateTabs,
    defaultSortMethod,
    isRespectTabGroups,
    suspendedTabsPosition,
    availableSuspendedTabsPositions,
    isSortPinnedTabs,
    theme,
    isTabGroupsApiAvailable,
    availableSortMethods,
    allCommands,
  } = initialState;

  const logPrefix = "[Tab Sorter] Initial State: ";
  console.log(logPrefix + "isReverse", isReverse);
  console.log(logPrefix + "isAllWindows", isAllWindows);
  console.log(logPrefix + "isAutoOnNewTab", isAutoOnNewTab);
  console.log(logPrefix + "isCloseDuplicateTabs", isCloseDuplicateTabs);
  console.log(logPrefix + "defaultSortMethod", defaultSortMethod);
  console.log(logPrefix + "isRespectTabGroups", isRespectTabGroups);
  console.log(logPrefix + "suspendedTabsPosition", suspendedTabsPosition);
  console.log(logPrefix + "isSortPinnedTabs", isSortPinnedTabs);
  console.log(logPrefix + "theme", theme);
  console.log(logPrefix + "isTabGroupsApiAvailable", isTabGroupsApiAvailable);
  console.log(logPrefix + "availableSortMethods", availableSortMethods);

  logCommands(allCommands ?? []);

  const filteredCommands = (allCommands ?? [])
    .filter(
      (command) =>
        command.name.startsWith("command_sort_tabs") ||
        command.name === "command_extract_domain",
    )
    .sort(
      (a, b) =>
        COMMAND_DISPLAY_PRIORITY[a.name] - COMMAND_DISPLAY_PRIORITY[b.name],
    );

  mountPopup(initialState, filteredCommands);
}
