import {
  comparisonByMru,
  comparisonByTitle,
  comparisonByUrl,
  computeGroupAwareSortResult,
  computeLegacyTabOrder,
  computePinnedTabOrder,
  faviconSort,
  findDuplicateTabIds,
} from "../lib/sort-logic.js";
import {
  TAB_SORTER_PREFIX,
  TAB_GROUPS_API_AVAILABLE,
  getAllWindowsCached,
  getCloseDuplicateTabsCached,
  getRespectTabGroupsCached,
  getReverseCached,
  getSortPinnedTabsCached,
  getSuspendedTabsPositionCached,
} from "../lib/settings.js";

const DEBUG = false;

/**
 * Sort Tabs
 *
 * @param {string} sortingType - the type of sorting desired
 * @param {boolean} shuffle - if true, shuffle the tabs
 */
export function sortTabs(sortingType, shuffle) {
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

  if (sortPinnedTabs && pinnedTabs.length > 0 && !doShuffle) {
    sortPinnedTabsOnly(pinnedTabs, comparisonFunction, customSort, log_prefix);
  }

  if (respectTabGroups && !doShuffle) {
    sortTabsWithGroupSupport(
      notPinnedTabs,
      tabs,
      comparisonFunction,
      customSort,
      log_prefix,
    );
  } else {
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

function getCurrentWindowTabs(callback) {
  console.debug(
    `${TAB_SORTER_PREFIX} (getCurrentWindowTabs): Before getAllWindowsCached`,
  );

  const options = getAllWindowsCached()
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
