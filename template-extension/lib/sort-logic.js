/**
 * Pure sorting and tab-order logic shared by the extension and unit tests.
 */

export function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function getUrlMatchKey(url) {
  try {
    const p = new URL(url);
    const host = p.hostname.replace(/^www\./i, "").toLowerCase();
    const path =
      p.pathname.length > 1 ? p.pathname.replace(/\/$/, "") : p.pathname;
    return `${p.protocol}//${host}${path}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

export function removeParenthesisNotification(stringToModify) {
  return stringToModify.replace(/\(\d*\)/m, "").trim();
}

export function comparisonByUrl(tabA, tabB) {
  const domainA = extractDomain(tabA.url);
  const domainB = extractDomain(tabB.url);
  return domainA.localeCompare(domainB);
}

export function comparisonByMru(tabA, tabB) {
  return tabA.lastAccessed - tabB.lastAccessed;
}

export function comparisonByTitle(tabA, tabB) {
  const cleanTitleA = removeParenthesisNotification(tabA.title);
  const cleanTitleB = removeParenthesisNotification(tabB.title);
  return cleanTitleA.localeCompare(cleanTitleB);
}

export function groupSuspendedTabs(tabs, position) {
  const activeTabs = [];
  const suspendedTabs = [];

  for (const tab of tabs) {
    if (tab.discarded) {
      suspendedTabs.push(tab);
    } else {
      activeTabs.push(tab);
    }
  }

  if (position === "beginning") {
    return [...suspendedTabs, ...activeTabs];
  }

  return [...activeTabs, ...suspendedTabs];
}

export function isTabInGroup(tab, tabGroupIdNone = -1) {
  return (
    tab.groupId &&
    tab.groupId !== -1 &&
    tab.groupId !== tabGroupIdNone
  );
}

export function organizeTabsByGroup(tabs, tabGroupIdNone = -1) {
  const groups = new Map();
  const ungrouped = [];

  tabs.forEach((tab, index) => {
    if (isTabInGroup(tab, tabGroupIdNone)) {
      if (!groups.has(tab.groupId)) {
        groups.set(tab.groupId, { tabs: [], firstIndex: index });
      }
      groups.get(tab.groupId).tabs.push(tab);
    } else {
      ungrouped.push(tab);
    }
  });

  return { groups, ungrouped };
}

export function sortTabArray(tabs, comparisonFunction, reverse) {
  const sorted = [...tabs];
  if (reverse) {
    sorted.sort((tabB, tabA) => comparisonFunction(tabA, tabB));
  } else {
    sorted.sort((tabA, tabB) => comparisonFunction(tabA, tabB));
  }
  return sorted;
}

export function getGroupRepresentative(groupTabs) {
  return groupTabs[0];
}

export function simpleSort(array, comparisonFunction, reverse) {
  const isReverse = reverse || false;
  if (isReverse) {
    array.sort((b, a) => comparisonFunction(a, b));
  } else {
    array.sort((a, b) => comparisonFunction(a, b));
  }
}

export function faviconSort(tabs, comparisonFunction, reverse) {
  const dictionaryByUrl = {};
  const sortedTabs = [];

  tabs.forEach((tab) => {
    dictionaryByUrl[tab.favIconUrl] = dictionaryByUrl[tab.favIconUrl] || [];
    dictionaryByUrl[tab.favIconUrl].push(tab);
  });

  let icons = Object.keys(dictionaryByUrl);

  if (reverse) {
    icons = [...icons].reverse();
  }

  icons.forEach((iconUrl) => {
    simpleSort(dictionaryByUrl[iconUrl], comparisonFunction, reverse);
    sortedTabs.push(...dictionaryByUrl[iconUrl]);
  });

  return sortedTabs;
}

export function shuffleIds(ids) {
  const result = [...ids];
  let i = result.length;
  if (i === 0) {
    return result;
  }

  while (--i) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[j], result[i]] = [result[i], result[j]];
  }

  return result;
}

export function sortTabsWithinOptions(tabs, comparisonFunction, reverse, customSort) {
  if (customSort) {
    return customSort(tabs, comparisonFunction, reverse);
  }
  return sortTabArray(tabs, comparisonFunction, reverse);
}

export function applySuspendedGrouping(tabs, suspendedPosition) {
  if (suspendedPosition === "ignore") {
    return tabs;
  }
  return groupSuspendedTabs(tabs, suspendedPosition);
}

export function computePinnedTabOrder(
  pinnedTabs,
  { comparisonFunction, reverse = false, suspendedPosition = "ignore", customSort = null } = {},
) {
  let sortedPinnedTabs = sortTabsWithinOptions(
    pinnedTabs,
    comparisonFunction,
    reverse,
    customSort,
  );
  sortedPinnedTabs = applySuspendedGrouping(sortedPinnedTabs, suspendedPosition);
  return sortedPinnedTabs.map((tab) => tab.id);
}

export function computeLegacyTabOrder(
  notPinnedTabs,
  {
    comparisonFunction,
    reverse = false,
    suspendedPosition = "ignore",
    customSort = null,
    doShuffle = false,
  } = {},
) {
  let tabs = sortTabsWithinOptions(
    notPinnedTabs,
    comparisonFunction,
    reverse,
    customSort,
  );
  tabs = applySuspendedGrouping(tabs, doShuffle ? "ignore" : suspendedPosition);

  let ids = tabs.map((tab) => tab.id);
  if (doShuffle) {
    ids = shuffleIds(ids);
  }
  return ids;
}

export function computeGroupAwareSortResult(
  notPinnedTabs,
  {
    comparisonFunction,
    reverse = false,
    suspendedPosition = "ignore",
    customSort = null,
    tabGroupIdNone = -1,
  } = {},
) {
  const { groups, ungrouped } = organizeTabsByGroup(
    notPinnedTabs,
    tabGroupIdNone,
  );

  const sortedGroups = [];
  for (const [groupId, groupData] of groups) {
    let sortedGroupTabs = sortTabsWithinOptions(
      groupData.tabs,
      comparisonFunction,
      reverse,
      customSort,
    );
    sortedGroupTabs = applySuspendedGrouping(
      sortedGroupTabs,
      suspendedPosition,
    );
    sortedGroups.push({
      groupId,
      tabs: sortedGroupTabs,
      originalFirstIndex: groupData.firstIndex,
    });
  }

  let sortedUngrouped = sortTabsWithinOptions(
    ungrouped,
    comparisonFunction,
    reverse,
    customSort,
  );
  sortedUngrouped = applySuspendedGrouping(sortedUngrouped, suspendedPosition);

  if (groups.size === 0) {
    return {
      finalOrder: sortedUngrouped.map((tab) => tab.id),
      sortedGroups,
      sortedUngrouped,
    };
  }

  const groupTabsMap = new Map();
  for (const group of sortedGroups) {
    groupTabsMap.set(group.groupId, [...group.tabs]);
  }

  const processedGroups = new Set();
  let ungroupedAdded = false;
  const finalOrder = [];

  for (const tab of notPinnedTabs) {
    if (isTabInGroup(tab, tabGroupIdNone)) {
      if (!processedGroups.has(tab.groupId)) {
        const groupTabs = groupTabsMap.get(tab.groupId);
        if (groupTabs) {
          finalOrder.push(...groupTabs.map((t) => t.id));
        }
        processedGroups.add(tab.groupId);
      }
    } else if (!ungroupedAdded) {
      finalOrder.push(...sortedUngrouped.map((t) => t.id));
      ungroupedAdded = true;
    }
  }

  return { finalOrder, sortedGroups, sortedUngrouped };
}

export function computeGroupAwareTabOrder(notPinnedTabs, options = {}) {
  return computeGroupAwareSortResult(notPinnedTabs, options).finalOrder;
}

export function findDuplicateTabIds(tabs) {
  const seenKeys = new Set();
  const tabIdsToClose = [];

  tabs.forEach((tab) => {
    if (tab.pinned) {
      return;
    }

    const urlKey = getUrlMatchKey(tab.url);
    const titleKey =
      tab.status === "complete" && tab.title ? `title:${tab.title}` : null;

    if (seenKeys.has(urlKey) || (titleKey && seenKeys.has(titleKey))) {
      tabIdsToClose.push(tab.id);
    } else {
      seenKeys.add(urlKey);
      if (titleKey) {
        seenKeys.add(titleKey);
      }
    }
  });

  return tabIdsToClose;
}

export function separatePinnedTabs(tabs) {
  return {
    pinnedTabs: tabs.filter((tab) => tab.pinned),
    notPinnedTabs: tabs.filter((tab) => !tab.pinned),
  };
}
