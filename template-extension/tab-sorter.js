// Public:
// Note: Currently, public means "used in popup-tab-sorter.js"

// + getReverseAsync
// + getAllWindowsAsync
// + getAutoOnNewTabAsync
// + getDefaultSortMethodAsync
// + getAvailableSortMethodsSync

import {
  comparisonByMru,
  comparisonByTitle,
  comparisonByUrl,
  computeGroupAwareSortResult,
  computeLegacyTabOrder,
  computePinnedTabOrder,
  extractDomain,
  faviconSort,
  findDuplicateTabIds,
} from "./lib/sort-logic.js";

const TAB_SORTER_PREFIX = "[Tab Sorter]";
const DEBUG = false;

const AVAILABLE_SORT_METHODS = [
  "sort_tabs_url",
  "sort_tabs_mru",
  "sort_tabs_title",
  "sort_tabs_favicon_and_title",
];

const STORAGE_KEY_REVERSE = "TAB_SORTER_STORAGE_KEY_REVERSE";
const STORAGE_DEFAULT_VALUE_REVERSE = false;
const STORAGE_KEY_SORT_ALL_WINDOWS = "TAB_SORTER_STORAGE_KEY_SORT_ALL_WINDOWS";
const STORAGE_DEFAULT_VALUE_SORT_ALL_WINDOWS = false;
const STORAGE_KEY_AUTO_SORT_BEST_EFFORT =
  "TAB_SORTER_STORAGE_KEY_AUTO_SORT_BEST_EFFORT";
const STORAGE_DEFAULT_VALUE_AUTO_SORT_ON_NEW_TAB = false;
const STORAGE_KEY_DEFAULT_SORT_METHOD =
  "TAB_SORTER_STORAGE_KEY_DEFAULT_SORT_METHOD";
const STORAGE_DEFAULT_VALUE_DEFAULT_SORT_METHOD = AVAILABLE_SORT_METHODS[1];
const STORAGE_KEY_RESPECT_TAB_GROUPS =
  "TAB_SORTER_STORAGE_KEY_RESPECT_TAB_GROUPS";
const STORAGE_DEFAULT_VALUE_RESPECT_TAB_GROUPS = true;
const STORAGE_KEY_SUSPENDED_TABS_POSITION =
  "TAB_SORTER_STORAGE_KEY_SUSPENDED_TABS_POSITION";
// Options: "ignore" (no special handling), "end" (group at end), "beginning" (group at beginning)
const STORAGE_DEFAULT_VALUE_SUSPENDED_TABS_POSITION = "ignore";
const AVAILABLE_SUSPENDED_TABS_POSITIONS = ["ignore", "end", "beginning"];
const STORAGE_KEY_SORT_PINNED_TABS = "TAB_SORTER_STORAGE_KEY_SORT_PINNED_TABS";
const STORAGE_DEFAULT_VALUE_SORT_PINNED_TABS = false;
const STORAGE_KEY_THEME = "TAB_SORTER_STORAGE_KEY_THEME";
// Theme options: "auto" (detect system), "dark", "light"
// Default to "auto" to follow system preference
const STORAGE_DEFAULT_VALUE_THEME = "auto";
const STORAGE_KEY_CLOSE_DUPLICATE_TABS =
  "TAB_SORTER_STORAGE_KEY_CLOSE_DUPLICATE_TABS";
const STORAGE_DEFAULT_VALUE_CLOSE_DUPLICATE_TABS = false;

const CACHE_KEY_ALL_COMMANDS = "CACHE_KEY_ALL_COMMANDS";

// Tab Groups API availability (Chrome 89+, Firefox 137+)
const TAB_GROUPS_API_AVAILABLE = typeof chrome.tabGroups !== "undefined";

// Initialization code
initTabSorter();

// Getter/Setters on Global State

async function getReverseAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_REVERSE,
    STORAGE_DEFAULT_VALUE_REVERSE,
  );
}

async function getAllWindowsAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_SORT_ALL_WINDOWS,
    STORAGE_DEFAULT_VALUE_SORT_ALL_WINDOWS,
  );
}

async function getAutoOnNewTabAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_AUTO_SORT_BEST_EFFORT,
    STORAGE_DEFAULT_VALUE_AUTO_SORT_ON_NEW_TAB,
  );
}

async function getDefaultSortMethodAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_DEFAULT_SORT_METHOD,
    STORAGE_DEFAULT_VALUE_DEFAULT_SORT_METHOD,
  );
}

async function getRespectTabGroupsAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_RESPECT_TAB_GROUPS,
    STORAGE_DEFAULT_VALUE_RESPECT_TAB_GROUPS,
  );
}

async function getSuspendedTabsPositionAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_SUSPENDED_TABS_POSITION,
    STORAGE_DEFAULT_VALUE_SUSPENDED_TABS_POSITION,
  );
}

async function getSortPinnedTabsAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_SORT_PINNED_TABS,
    STORAGE_DEFAULT_VALUE_SORT_PINNED_TABS,
  );
}

async function getThemeAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_THEME,
    STORAGE_DEFAULT_VALUE_THEME,
  );
}

async function getCloseDuplicateTabsAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_CLOSE_DUPLICATE_TABS,
    STORAGE_DEFAULT_VALUE_CLOSE_DUPLICATE_TABS,
  );
}

async function getAllCommandsFromManifest() {
  const allCommands = await chrome.commands.getAll();
  CACHED_STATE[CACHE_KEY_ALL_COMMANDS] = allCommands;
  return allCommands;
}

function getAvailableSortMethodsSync() {
  return AVAILABLE_SORT_METHODS;
}

// private

function initTabSorter() {
  resetCacheAsync();
  addEventListeners();
}

// Getter/Setters on Global State
const CACHED_STATE = {};

async function resetCacheAsync() {
  await getReverseAsync();
  await getAllWindowsAsync();
  await getAutoOnNewTabAsync();
  await getDefaultSortMethodAsync();
  await getRespectTabGroupsAsync();
  await getSuspendedTabsPositionAsync();
  await getSortPinnedTabsAsync();
  await getThemeAsync();
  await getCloseDuplicateTabsAsync();
  await getAllCommandsFromManifest();
}

function getReverseCached() {
  console.debug("getReverseCached 1");
  const value = CACHED_STATE[STORAGE_KEY_REVERSE];
  console.debug("getReverseCached 2", `${value}`);
  return value;
}

function getAllWindowsCached() {
  console.debug("getAllWindowsCached 1");
  const value = CACHED_STATE[STORAGE_KEY_SORT_ALL_WINDOWS];
  console.debug("getAllWindowsCached 2", `${value}`);
  return value;
}

function getAutoOnNewTabCached() {
  console.debug("getAutoOnNewTabCached 1");
  const value = CACHED_STATE[STORAGE_KEY_AUTO_SORT_BEST_EFFORT];
  console.debug("getAutoOnNewTabCached 2", `${value}`);
  return value;
}

function getDefaultSortMethodCached() {
  console.debug("getDefaultSortMethodCached 1");
  const value = CACHED_STATE[STORAGE_KEY_DEFAULT_SORT_METHOD];
  console.debug("getDefaultSortMethodCached 2", `${value}`);
  return value;
}

function getRespectTabGroupsCached() {
  console.debug("getRespectTabGroupsCached 1");
  const value = CACHED_STATE[STORAGE_KEY_RESPECT_TAB_GROUPS];
  console.debug("getRespectTabGroupsCached 2", `${value}`);
  return value;
}

function getSuspendedTabsPositionCached() {
  console.debug("getSuspendedTabsPositionCached 1");
  const value = CACHED_STATE[STORAGE_KEY_SUSPENDED_TABS_POSITION];
  console.debug("getSuspendedTabsPositionCached 2", `${value}`);
  return value;
}

function getSortPinnedTabsCached() {
  console.debug("getSortPinnedTabsCached 1");
  const value = CACHED_STATE[STORAGE_KEY_SORT_PINNED_TABS];
  console.debug("getSortPinnedTabsCached 2", `${value}`);
  return value;
}

function getThemeCached() {
  console.debug("getThemeCached 1");
  const value = CACHED_STATE[STORAGE_KEY_THEME];
  console.debug("getThemeCached 2", `${value}`);
  return value;
}
function getCloseDuplicateTabsCached() {
  return CACHED_STATE[STORAGE_KEY_CLOSE_DUPLICATE_TABS];
}

function setReverse(choice) {
  persistInStorage(STORAGE_KEY_REVERSE, choice);
}

function setAllWindows(choice) {
  persistInStorage(STORAGE_KEY_SORT_ALL_WINDOWS, choice);
}

function setAutoSortBestEffort(choice) {
  persistInStorage(STORAGE_KEY_AUTO_SORT_BEST_EFFORT, choice);
}

function setDefaultSortMethod(choice) {
  persistInStorage(STORAGE_KEY_DEFAULT_SORT_METHOD, choice);
}

function setRespectTabGroups(choice) {
  persistInStorage(STORAGE_KEY_RESPECT_TAB_GROUPS, choice);
}

function setSuspendedTabsPosition(choice) {
  persistInStorage(STORAGE_KEY_SUSPENDED_TABS_POSITION, choice);
}

function setSortPinnedTabs(choice) {
  persistInStorage(STORAGE_KEY_SORT_PINNED_TABS, choice);
}

function setTheme(choice) {
  persistInStorage(STORAGE_KEY_THEME, choice);
}

function setCloseDuplicateTabs(choice) {
  persistInStorage(STORAGE_KEY_CLOSE_DUPLICATE_TABS, choice);
}

async function retrieveFromStorage(key, default_value) {
  console.debug(key);

  const key_value_obj = await chrome.storage.sync.get(key);
  console.debug(key_value_obj);

  const actual_value =
    key_value_obj === undefined || !(key in key_value_obj)
      ? default_value
      : key_value_obj[key];
  CACHED_STATE[key] = actual_value;
  return actual_value;
}

function persistInStorage(key, value) {
  const payload = {
    [key]: value,
  };

  const log_prefix = `${TAB_SORTER_PREFIX} (persistInStorage):`;

  console.debug(`${log_prefix} ${key}=${value}`);

  function onSuccess(item) {
    console.debug(`${log_prefix} ${item}`);
    CACHED_STATE[key] = value;
  }
  function onError(error) {
    console.error(`${log_prefix} ${error}`);
  }
  chrome.storage.sync.set(payload).then(onSuccess, onError);
}

// Configure event listening

function addEventListeners() {
  // Initial State
  chrome.runtime.onMessage.addListener((message, sender, sendMessage) => {
    if (message === "queryInitialState") {
      console.debug("Start queryInitialState handler");
      (async () => {
        await resetCacheAsync();
        const initialState = {
          isReverse: CACHED_STATE[STORAGE_KEY_REVERSE],
          isAllWindows: CACHED_STATE[STORAGE_KEY_SORT_ALL_WINDOWS],
          isAutoOnNewTab: CACHED_STATE[STORAGE_KEY_AUTO_SORT_BEST_EFFORT],
          defaultSortMethod: CACHED_STATE[STORAGE_KEY_DEFAULT_SORT_METHOD],
          isRespectTabGroups: CACHED_STATE[STORAGE_KEY_RESPECT_TAB_GROUPS],
          suspendedTabsPosition:
            CACHED_STATE[STORAGE_KEY_SUSPENDED_TABS_POSITION],
          availableSuspendedTabsPositions: AVAILABLE_SUSPENDED_TABS_POSITIONS,
          isSortPinnedTabs: CACHED_STATE[STORAGE_KEY_SORT_PINNED_TABS],
          theme: CACHED_STATE[STORAGE_KEY_THEME],
          isTabGroupsApiAvailable: TAB_GROUPS_API_AVAILABLE,
          isCloseDuplicateTabs: CACHED_STATE[STORAGE_KEY_CLOSE_DUPLICATE_TABS],
          availableSortMethods: AVAILABLE_SORT_METHODS,
          allCommands: CACHED_STATE[CACHE_KEY_ALL_COMMANDS],
        };
        sendMessage(initialState);
      })();
      // Be careful with callback hell!!!!
      // Must return true to indicate that the handler will respond asynchronously!
      // See https://developer.chrome.com/docs/extensions/mv3/messaging/
      return true;
    }
  });

  // Using the sort-tabs shortcut defined in manifest.json
  chrome.commands.onCommand.addListener((command) => {
    console.debug(`${TAB_SORTER_PREFIX} Command event received: ${command}`);
    commandEventListener(command);
  });

  // Clicking on a popup button
  chrome.runtime.onMessage.addListener((message) => {
    console.debug(
      `${TAB_SORTER_PREFIX} Message event received: ${message.command} with value=${message.value}`,
    );
    commandEventListener(message.command);
    stateUpdateEventListener(message.command, message.value);
  });

  // Tabs listeners are for Auto Sort.
  // ------------------------------------------------------------
  // Listening on a new tab opening. Sort if auto sort is enabled and sort method is MRU
  // NOTE: not needed anymore, as we now listen on onActivated instead, that also is fired.
  // NOTE 2: its, the onActivated is cannot be used.
  chrome.tabs.onCreated.addListener((tab) => {
    if (!getAutoOnNewTabCached()) {
      return;
    }
    sortMethod = getDefaultSortMethodCached();
    if (sortMethod != "sort_tabs_mru") {
      return;
    }
    console.debug(
      `New tab created, sorting as soon as possible. ${tab.lastAccessed}`,
    );
    sortTabs(sortMethod);
  });

  // Listening on a tab focusing, for MRU sorting
  chrome.tabs.onActivated.addListener((tab) => {
    if (!getAutoOnNewTabCached()) {
      return;
    }
    sortMethod = getDefaultSortMethodCached();
    if (sortMethod != "sort_tabs_mru") {
      return;
    }
    console.debug("Tab activated, sorting as soon as possible");
    console.debug(tab.lastAccessed);

    // It's not extremely clean, but should handle most cases.
    // https://stackoverflow.com/questions/67806779/im-getting-an-error-tabs-cannot-be-edited-right-now-user-may-be-dragging-a-tab
    // Explicitly ignore error, as it's not critical
    // Expected: Error: Tabs cannot be edited right now (user may be dragging a tab).
    // Rationale: a quick click means the user is not dragging a tab, so we can ignore the error.
    // If they are indeed dragging a tab, then we catch and ignore the error. It is OK.
    // Empirically, 100ms is the duration of a quick click.
    // NOTE: Unfortunately I am not able to catch the error here.
    setTimeout(() => {
      sortTabs(sortMethod);
    }, 100);
  });

  // Listening for tab updates to catch any missed tabs and trigger auto sort after navigation
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.debug(
      `${TAB_SORTER_PREFIX} Tab updated: ${tabId} ${changeInfo.status} ${changeInfo.title} ${changeInfo.url}...`,
    );
    console.debug(changeInfo);
    console.debug(tab);

    if (!getAutoOnNewTabCached()) {
      return;
    }

    // Sort as soon as possible
    sortMethod = getDefaultSortMethodCached();

    if (changeInfo.url && sortMethod === "sort_tabs_url") {
      console.debug(
        `URL changed and sort method is ${sortMethod}, sorting as soon as possible. ${changeInfo.url}`,
      );
      sortTabs(sortMethod);
    } else if (changeInfo.title && sortMethod === "sort_tabs_title") {
      console.debug(
        `Title changed and sort method is ${sortMethod}, sorting as soon as possible. ${changeInfo.title}`,
      );
      sortTabs(sortMethod);
    } else if (
      changeInfo.title &&
      tab.favIconUrl &&
      sortMethod === "sort_tabs_favicon_and_title"
    ) {
      console.debug(
        `Title changed and sort method is ${sortMethod}, sorting as soon as possible. ${changeInfo.title} ${tab.favIconUrl}`,
      );
      sortTabs(sortMethod);
    } else if (
      changeInfo.favIconUrl &&
      tab.title &&
      sortMethod === "sort_tabs_favicon_and_title"
    ) {
      // Note: this case should be mutually exclusive with the one above
      console.debug(
        `Favicon changed and sort method is ${sortMethod}, sorting as soon as possible. ${changeInfo.favIconUrl} ${tab.title}`,
      );
      sortTabs(sortMethod);
    }
    // Note: Right now, a new tab cannot be sorted directly with sorting methods other than MRU.
    // It is okay, other methods need a tab content (with change of title, url etc).
    // So we keep the new tab until it has real content, and then it's sorted.

    // Case MRU is handled in the onActivated listener, but a click on tab should sort it directly,
    // but do it only if tab is already complete to not sort twice (create + complete)
    // NOTE: this does not work, Error: Tabs cannot be edited right now (user may be dragging a tab).
    // else if (tab.status === 'complete' && sortMethod === "sort_tabs_mru") {
    //   console.debug(`Status changed to complete and sort method is ${sortMethod}, sorting as soon as possible`);
    //   sortTabs(sortMethod);
    // }
    // Should not be needed if all cases above are handled ^
    // else if (changeInfo.status === 'complete') {
    //   console.debug("Status changed to complete, sorting anyway.");
    //   sortTabs(sortMethod);
    // }
  });
}

function commandEventListener(command) {
  switch (command) {
    case "command_sort_tabs_url":
      sortTabs("sort_tabs_url");
      break;
    case "command_sort_tabs_mru":
      sortTabs("sort_tabs_mru");
      break;
    case "command_sort_tabs_title":
      sortTabs("sort_tabs_title");
      break;
    case "command_sort_tabs_favicon_and_title":
      sortTabs("sort_tabs_favicon_and_title");
      break;
    case "command_sort_tabs_shuffle":
      sortTabs("sort_tabs_mru", true);
      break;
    case "command_extract_domain":
      extractDomainTabs();
      break;
    default:
  }
}

function stateUpdateEventListener(command, value) {
  if (command === "ui_click_checkbox_sort_tabs_reverse") {
    setReverse(value);
  } else if (command === "ui_click_checkbox_sort_tabs_all_windows") {
    setAllWindows(value);
  } else if (command === "ui_click_checkbox_sort_tabs_auto_best_effort") {
    setAutoSortBestEffort(value);
  } else if (command === "ui_click_checkbox_sort_tabs_respect_tab_groups") {
    setRespectTabGroups(value);
  } else if (command === "ui_change_select_suspended_tabs_position") {
    setSuspendedTabsPosition(value);
  } else if (command === "ui_click_checkbox_sort_tabs_pinned") {
    setSortPinnedTabs(value);
  } else if (
    command === "ui_change_select_sort_select_tabs_default_sort_method"
  ) {
    setDefaultSortMethod(value);
  } else if (command === "ui_change_select_theme") {
    setTheme(value);
  } else if (command === "ui_click_checkbox_sort_tabs_close_duplicates") {
    setCloseDuplicateTabs(value);
  }
}

// Custom sorts
// Core sorting function

/**
 * Sort Tabs
 *
 * @date 11/25/2023 - 2:47:03 PM
 *
 * @param {string} sortingType - the type of sorting desired
 * @param {boolean} shuffle - if true, shuffle the tabs
 */
function sortTabs(sortingType, shuffle) {
  const doShuffle = shuffle || false;
  const log_prefix = `${TAB_SORTER_PREFIX} (sortTabs):`;
  const respectTabGroups =
    getRespectTabGroupsCached() && TAB_GROUPS_API_AVAILABLE;
  const sortPinnedTabs = getSortPinnedTabsCached();

  console.debug(
    `${log_prefix} with '${sortingType}', respectTabGroups=${respectTabGroups}, sortPinnedTabs=${sortPinnedTabs}`,
  );

  getCurrentWindowTabs(function (tabs) {
    if (getCloseDuplicateTabsCached()) {
      closeDuplicateTabs(tabs, (tabIdsToClose) => {
        const tabsToSort =
          tabIdsToClose.length === 0
            ? tabs
            : tabs.filter((t) => !tabIdsToClose.includes(t.id));
        performSort(tabsToSort, sortingType, doShuffle, log_prefix);
      });
    } else {
      performSort(tabs, sortingType, doShuffle, log_prefix);
    }
  });
}

function sortPinnedTabsOnly(
  pinnedTabs,
  comparisonFunction,
  customSort,
  log_prefix,
) {
  console.debug(`${log_prefix} Sorting ${pinnedTabs.length} pinned tabs`);

  const pinnedTabIds = computePinnedTabOrder(pinnedTabs, {
    comparisonFunction,
    reverse: getReverseCached(),
    suspendedPosition: getSuspendedTabsPositionCached(),
    customSort,
  });

  console.debug(
    `${log_prefix} Moving pinned tabs to positions 0-${pinnedTabIds.length - 1}`,
  );

  chrome.tabs.move(pinnedTabIds, { index: 0 });
}

/**
 * Sort tabs while respecting tab groups (new behavior)
 * Tabs within each group are sorted, groups maintain their original positions
 * Suspended tabs grouping is applied within each group (not globally)
 */
function sortTabsWithGroupSupport(
  notPinnedTabs,
  allTabs,
  comparisonFunction,
  customSort,
  log_prefix,
) {
  console.debug(
    `${log_prefix} Sorting with tab groups support (preserving group positions)`,
  );

  const suspendedPosition = getSuspendedTabsPositionCached();
  const { finalOrder, sortedGroups, sortedUngrouped } =
    computeGroupAwareSortResult(notPinnedTabs, {
      comparisonFunction,
      reverse: getReverseCached(),
      suspendedPosition,
      customSort,
      tabGroupIdNone: chrome.tabGroups?.TAB_GROUP_ID_NONE,
    });

  console.debug(
    `${log_prefix} Found ${sortedGroups.length} groups and ${sortedUngrouped.length} ungrouped tabs`,
  );

  const numberOfPinnedTabs = allTabs.length - notPinnedTabs.length;

  console.debug(
    `${log_prefix} Moving ${finalOrder.length} tabs with group support`,
  );

  if (DEBUG) {
    performance.mark("begin");
  }

  chrome.tabs.move(finalOrder, {
    index: numberOfPinnedTabs,
  });

  for (const group of sortedGroups) {
    const tabIds = group.tabs.map((t) => t.id);
    if (tabIds.length > 0) {
      chrome.tabs.group({ tabIds, groupId: group.groupId }).catch((error) => {
        console.debug(
          `${log_prefix} Could not re-apply group ${group.groupId}:`,
          error,
        );
      });
    }
  }

  if (sortedUngrouped.length > 0 && chrome.tabs.ungroup) {
    const ungroupedTabIds = sortedUngrouped.map((t) => t.id);
    chrome.tabs.ungroup(ungroupedTabIds).catch((error) => {
      console.debug(`${log_prefix} Could not ungroup tabs:`, error);
    });
  }

  if (DEBUG) {
    performance.mark("end");
    performance.measure("Tab reorganizing time (with groups)", "begin", "end");
    console.table(
      performance.getEntriesByType("measure").map((e) => [e.name, e.duration]),
    );
    performance.clearMarks();
    performance.clearMeasures();
  }
}

/**
 * Sort tabs without respecting tab groups (legacy behavior)
 * All tabs are sorted together regardless of group membership
 */
function sortTabsLegacy(
  notPinnedTabs,
  allTabs,
  comparisonFunction,
  customSort,
  doShuffle,
  log_prefix,
) {
  console.debug(
    `${log_prefix} Sorting without tab groups support (legacy mode)`,
  );

  const newIds = computeLegacyTabOrder(notPinnedTabs, {
    comparisonFunction,
    reverse: getReverseCached(),
    suspendedPosition: getSuspendedTabsPositionCached(),
    customSort,
    doShuffle,
  });

  const numberOfPinnedTabs = allTabs.length - notPinnedTabs.length;

  if (DEBUG) {
    performance.mark("begin");
  }

  chrome.tabs.move(newIds, {
    index: numberOfPinnedTabs,
  });

  if (DEBUG) {
    performance.mark("end");
    performance.measure("Tab reorganizing time", "begin", "end");
    console.table(
      performance.getEntriesByType("measure").map((e) => [e.name, e.duration]),
    );
    performance.clearMarks();
    performance.clearMeasures();
  }
}

// Closes duplicate unpinned tabs, keeping the leftmost occurrence.
// Mirrors DTC: URL key first, then title key (when enabled and tab is loaded).
// Invokes callback with the list of closed tab ids (empty if none).
function closeDuplicateTabs(tabs, callback) {
  const log_prefix = `${TAB_SORTER_PREFIX} (closeDuplicateTabs):`;
  const tabIdsToClose = findDuplicateTabIds(tabs);

  if (tabIdsToClose.length === 0) {
    callback(tabIdsToClose);
    return;
  }

  console.debug(
    `${log_prefix} Closing ${tabIdsToClose.length} duplicate tab(s)`,
  );
  chrome.tabs.remove(tabIdsToClose, () => {
    if (chrome.runtime.lastError) {
      console.error(`${log_prefix}`, chrome.runtime.lastError);
    }
    callback(tabIdsToClose);
  });
}

function performSort(tabs, sortingType, doShuffle, log_prefix) {
  console.debug("Callback of getCurrentWindowTabs 1");

  const respectTabGroups =
    getRespectTabGroupsCached() && TAB_GROUPS_API_AVAILABLE;
  const sortPinnedTabs = getSortPinnedTabsCached();

  // Separate pinned and non-pinned tabs
  let pinnedTabs = tabs.filter((tab) => tab.pinned);
  let notPinnedTabs = tabs.filter((tab) => !tab.pinned);
  let comparisonFunction;
  let customSort = undefined;

  console.debug(
    `${log_prefix} Found ${pinnedTabs.length} pinned tabs and ${notPinnedTabs.length} non-pinned tabs`,
  );

  switch (sortingType) {
    case "sort_tabs_url":
      comparisonFunction = comparisonByUrl;
      break;
    case "sort_tabs_mru":
      // TODO Not working on chromium!
      // WIP, See https://groups.google.com/a/chromium.org/g/extensions-reviews/c/iokG6nMuLio
      // Addition 2025-09-16: This is now working on chromium!
      // https://developer.chrome.com/docs/extensions/reference/api/tabs
      // lastAccessed property is now available in Chrome 121+
      comparisonFunction = comparisonByMru;
      break;
    case "sort_tabs_title":
      comparisonFunction = comparisonByTitle;
      break;
    case "sort_tabs_favicon_and_title":
      comparisonFunction = comparisonByTitle;
      customSort = faviconSort;
      break;
    default:
      comparisonFunction = comparisonByUrl;
  }

  // Sort pinned tabs if enabled (and not shuffling)
  if (sortPinnedTabs && pinnedTabs.length > 0 && !doShuffle) {
    sortPinnedTabsOnly(pinnedTabs, comparisonFunction, customSort, log_prefix);
  }

  // Check if we should respect tab groups
  if (respectTabGroups && !doShuffle) {
    sortTabsWithGroupSupport(
      notPinnedTabs,
      tabs,
      comparisonFunction,
      customSort,
      log_prefix,
    );
  } else {
    // Legacy behavior: sort all tabs together (ignoring groups)
    sortTabsLegacy(
      notPinnedTabs,
      tabs,
      comparisonFunction,
      customSort,
      doShuffle,
      log_prefix,
    );
  }
}

// Helpers

// Zipping two arrays like in python
function zip(a, b) {
  if (a.length !== b.length) {
    return null;
  }
  return a.map((e, i) => [e, b[i]]);
}

// Retrieve the tabs from the current window
function getCurrentWindowTabs(callback) {
  console.debug(
    `${TAB_SORTER_PREFIX} (getCurrentWindowTabs): Before getAllWindowsCached`,
  );

  // /!\ currentWindow: false != no argument currentWindow given
  let options = getAllWindowsCached()
    ? {}
    : {
        currentWindow: true,
      };
  console.debug(
    `${TAB_SORTER_PREFIX} (getCurrentWindowTabs): Before tab query`,
  );

  chrome.tabs.query(options, function (tabs) {
    callback(tabs);
  });
}

// Convert an object to JSON
function json(obj) {
  return JSON.stringify(obj, null, "    ");
}

// Main extract domain function
async function extractDomainTabs() {
  const log_prefix = `${TAB_SORTER_PREFIX} (extractDomainTabs):`;

  try {
    console.log(`${log_prefix} Starting domain extraction...`);

    // Debug: Check API availability
    console.log(`${log_prefix} Chrome APIs available:`, {
      windows: !!chrome.windows,
      tabs: !!chrome.tabs,
      runtime: !!chrome.runtime,
    });

    // Debug: Check manifest permissions
    const manifest = chrome.runtime.getManifest();
    console.log(`${log_prefix} Manifest permissions:`, manifest.permissions);

    // Get current active tab
    const [currentTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    console.log(`${log_prefix} Current tab:`, currentTab);

    if (!currentTab) {
      console.error(`${log_prefix} No active tab found`);
      return;
    }

    const currentDomain = extractDomain(currentTab.url);
    console.log(
      `${log_prefix} Extracted domain: ${currentDomain} from URL: ${currentTab.url}`,
    );

    if (!currentDomain) {
      console.error(
        `${log_prefix} Could not extract domain from current tab URL: ${currentTab.url}`,
      );
      return;
    }

    // Get all tabs from all windows
    const allTabs = await chrome.tabs.query({});
    console.log(`${log_prefix} Total tabs found: ${allTabs.length}`);

    const matchingTabs = allTabs.filter((tab) => {
      const tabDomain = extractDomain(tab.url);
      const isMatch = tabDomain === currentDomain;
      if (isMatch) {
        console.log(
          `${log_prefix} Found matching tab: ${tab.id} (domain: ${tabDomain}) - ${tab.url} `,
        );
      }
      return isMatch;
    });

    console.log(`${log_prefix} Matching tabs count: ${matchingTabs.length}`);

    if (matchingTabs.length === 0) {
      console.log(
        `${log_prefix} No other tabs found for domain: ${currentDomain}. No extraction needed.`,
      );
      return;
    }

    // Check if current window has all tabs of same domain and no other windows have this domain
    const currentWindowTabs = await chrome.tabs.query({ currentWindow: true });
    console.log(
      `${log_prefix} Current window tabs count: ${currentWindowTabs.length}`,
    );

    const otherWindowsTabs = allTabs.filter(
      (tab) =>
        !currentWindowTabs.some((currentTab) => currentTab.id === tab.id),
    );
    console.log(
      `${log_prefix} Other windows tabs count: ${otherWindowsTabs.length}`,
    );

    const otherWindowsMatchingTabs = otherWindowsTabs.filter((tab) => {
      const tabDomain = extractDomain(tab.url);
      return tabDomain === currentDomain;
    });

    console.log(
      `${log_prefix} Other windows matching tabs count: ${otherWindowsMatchingTabs.length}`,
    );

    // Check if current window has all tabs of same domain
    const currentWindowOtherDomains = currentWindowTabs.filter((tab) => {
      const tabDomain = extractDomain(tab.url);
      return tabDomain !== currentDomain;
    });

    console.log(
      `${log_prefix} Current window tabs with other domains: ${currentWindowOtherDomains.length}`,
    );

    // If current window has all tabs of same domain AND no other windows have this domain, skip extraction
    if (
      currentWindowOtherDomains.length === 0 &&
      otherWindowsMatchingTabs.length === 0
    ) {
      console.log(
        `${log_prefix} Current window already contains all tabs of domain ${currentDomain} and no other windows have this domain. No extraction needed.`,
      );
      return;
    }

    console.log(
      `${log_prefix} About to create new window with tabId: ${currentTab.id}`,
    );

    // Create new window with the current tab (no new tab created)
    const newWindow = await chrome.windows.create({
      tabId: currentTab.id,
      focused: true,
      type: "normal",
    });

    console.log(`${log_prefix} New window created:`, newWindow);

    if (chrome.runtime.lastError) {
      console.error(
        `${log_prefix} Chrome runtime error after window creation:`,
        chrome.runtime.lastError,
      );
      return;
    }

    // Move all other matching tabs to the new window
    if (matchingTabs.length > 0) {
      const tabIds = matchingTabs.map((tab) => tab.id);
      console.log(
        `${log_prefix} Moving ${tabIds.length} tabs to new window:`,
        tabIds,
      );

      await chrome.tabs.move(tabIds, {
        windowId: newWindow.id,
        index: 1,
      });

      if (chrome.runtime.lastError) {
        console.error(
          `${log_prefix} Chrome runtime error after moving tabs:`,
          chrome.runtime.lastError,
        );
        return;
      }

      console.log(`${log_prefix} Successfully moved tabs to new window`);
    }

    console.log(`${log_prefix} Domain extraction completed successfully`);

    // Auto-sort after successful extraction if enabled
    if (getAutoOnNewTabCached()) {
      console.log(
        `${log_prefix} Auto-sort is enabled, performing sort after extraction`,
      );
      const defaultSortMethod = getDefaultSortMethodCached();
      console.log(
        `${log_prefix} Using default sort method: ${defaultSortMethod}`,
      );

      // Sort tabs in the new window
      // Note: No retry mechanism here is done (to be checked if needed)
      chrome.tabs.query({ windowId: newWindow.id }, (tabs) => {
        if (tabs && tabs.length > 0) {
          console.log(
            `${log_prefix} Sorting ${tabs.length} tabs in the new window`,
          );
          sortTabs(defaultSortMethod);
        }
      });
    }
  } catch (error) {
    console.error(`${log_prefix} Error during domain extraction:`, error);
    console.error(`${log_prefix} Error stack:`, error.stack);

    if (chrome.runtime.lastError) {
      console.error(
        `${log_prefix} Chrome runtime error:`,
        chrome.runtime.lastError,
      );
    }
  }
}
