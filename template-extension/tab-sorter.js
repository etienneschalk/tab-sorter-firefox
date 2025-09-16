// Public:
// Note: Currently, public means "used in popup-tab-sorter.js"

// + getReverseAsync
// + getAllWindowsAsync
// + getAutoOnNewTabAsync
// + getDefaultSortMethodAsync
// + getAvailableSortMethodsSync

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
const STORAGE_KEY_AUTO_SORT_ON_NEW_TAB =
  "TAB_SORTER_STORAGE_KEY_AUTO_SORT_ON_NEW_TAB";
const STORAGE_DEFAULT_VALUE_AUTO_SORT_ON_NEW_TAB = false;
const STORAGE_KEY_DEFAULT_SORT_METHOD =
  "TAB_SORTER_STORAGE_KEY_DEFAULT_SORT_METHOD";
const STORAGE_DEFAULT_VALUE_DEFAULT_SORT_METHOD = AVAILABLE_SORT_METHODS[1];

const CACHE_KEY_ALL_COMMANDS = "CACHE_KEY_ALL_COMMANDS";

// Initialization code
initTabSorter();

// Getter/Setters on Global State

async function getReverseAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_REVERSE,
    STORAGE_DEFAULT_VALUE_REVERSE
  );
}

async function getAllWindowsAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_SORT_ALL_WINDOWS,
    STORAGE_DEFAULT_VALUE_SORT_ALL_WINDOWS
  );
}

async function getAutoOnNewTabAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_AUTO_SORT_ON_NEW_TAB,
    STORAGE_DEFAULT_VALUE_AUTO_SORT_ON_NEW_TAB
  );
}

async function getDefaultSortMethodAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_DEFAULT_SORT_METHOD,
    STORAGE_DEFAULT_VALUE_DEFAULT_SORT_METHOD
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
  const value = CACHED_STATE[STORAGE_KEY_AUTO_SORT_ON_NEW_TAB];
  console.debug("getAutoOnNewTabCached 2", `${value}`);
  return value;
}

function getDefaultSortMethodCached() {
  console.debug("getDefaultSortMethodCached 1");
  const value = CACHED_STATE[STORAGE_KEY_DEFAULT_SORT_METHOD];
  console.debug("getDefaultSortMethodCached 2", `${value}`);
  return value;
}

function setReverse(choice) {
  persistInStorage(STORAGE_KEY_REVERSE, choice);
}

function setAllWindows(choice) {
  persistInStorage(STORAGE_KEY_SORT_ALL_WINDOWS, choice);
}

function setAutoOnNewTab(choice) {
  persistInStorage(STORAGE_KEY_AUTO_SORT_ON_NEW_TAB, choice);
}

function setDefaultSortMethod(choice) {
  persistInStorage(STORAGE_KEY_DEFAULT_SORT_METHOD, choice);
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

// Track pending sort operations for new tabs
let pendingSortTabs = new Set();

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
          isAutoOnNewTab: CACHED_STATE[STORAGE_KEY_AUTO_SORT_ON_NEW_TAB],
          defaultSortMethod: CACHED_STATE[STORAGE_KEY_DEFAULT_SORT_METHOD],
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
      `${TAB_SORTER_PREFIX} Message event received: ${message.command} with value=${message.value}`
    );
    commandEventListener(message.command);
    stateUpdateEventListener(message.command, message.value);
  });

  // Listening on a new tab opening with delay and retry mechanism
  chrome.tabs.onCreated.addListener((tab) => {
    if (getAutoOnNewTabCached()) {
      pendingSortTabs.add(tab.id);
      const delay = 50; // 50ms delay should be sufficient
      console.debug(`${TAB_SORTER_PREFIX} New tab created: ${tab.id}, scheduling sort with delay ${delay}ms`);
      // Add a small delay to ensure the tab is fully integrated
      setTimeout(() => {
        sortTabsWithRetry(getDefaultSortMethodCached(), tab.id);
      }, delay); 
    }
  });

  // Backup mechanism: listen for tab updates to catch any missed tabs
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && pendingSortTabs.has(tabId)) {
      console.debug(`${TAB_SORTER_PREFIX} Tab updated and completed: ${tabId}, triggering sort`);
      pendingSortTabs.delete(tabId);
      sortTabs(getDefaultSortMethodCached());
    }
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
  } else if (command === "ui_click_checkbox_sort_tabs_auto_on_new_tab") {
    setAutoOnNewTab(value);
  } else if (
    command === "ui_change_select_sort_select_tabs_default_sort_method"
  ) {
    setDefaultSortMethod(value);
  }
}

// Custom sorts
// Takes tabs, return tabs

// Return classified tabs by favicon then applies comparison function on each
// (Uses intermediary a dict of tabs, indexed by url and valued by arrays of
// corresponding tabs)
// Exemple : {"google.com": [1,5,6], "rickandmortyadventures.com": [4,2,0]}
function faviconSort(tabs, comparisonFunction, reverse) {
  let dictionaryByUrl = {};
  let sortedTabs = [];

  tabs.forEach((tab, index) => {
    dictionaryByUrl[tab.favIconUrl] = dictionaryByUrl[tab.favIconUrl] || [];
    dictionaryByUrl[tab.favIconUrl].push(tab);
  });

  icons = Object.keys(dictionaryByUrl);

  console.debug(reverse);

  if (reverse) {
    icons.reverse();
  }

  icons.forEach((url) => {
    simpleSort(dictionaryByUrl[url], comparisonFunction, reverse); // simpleSort(array, comparisonFunction, reverse)
    Array.prototype.push.apply(sortedTabs, dictionaryByUrl[url]); // push values of array to the left array
  });

  return sortedTabs;
}

// Comparison functions

function comparisonByUrl(tabA, tabB) {
  return tabA.url.localeCompare(tabB.url);
}

function comparisonByMru(tabA, tabB) {
  return tabA.lastAccessed - tabB.lastAccessed;
}

function comparisonByTitle(tabA, tabB) {
  cleanTitleA = removeParenthesisNotification(tabA.title);
  cleanTitleB = removeParenthesisNotification(tabB.title);
  return cleanTitleA.localeCompare(cleanTitleB);
}

// Enhanced sorting function with retry mechanism for new tabs

/**
 * Sort Tabs with Retry Mechanism
 * 
 * This function attempts to sort tabs with retry logic to handle race conditions
 * where newly created tabs might not be immediately available in the query results.
 *
 * @param {string} sortingType - the type of sorting desired
 * @param {number} newTabId - the ID of the newly created tab
 * @param {number} retryCount - current retry attempt (internal use)
 */
function sortTabsWithRetry(sortingType, newTabId, retryCount = 0) {
  const maxRetries = 3;
  const retryDelay = 100; // 100ms between retries
  const log_prefix = `${TAB_SORTER_PREFIX} (sortTabsWithRetry):`;

  console.debug(`${log_prefix} Attempt ${retryCount + 1}/${maxRetries + 1} for tab ${newTabId}`);

  getCurrentWindowTabs(function (tabs) {
    // Check if the new tab is included in the results
    const newTabExists = tabs.some(tab => tab.id === newTabId);
    
    if (newTabExists || retryCount >= maxRetries) {
      // Either the tab is found or we've exhausted retries
      console.debug(`${log_prefix} Tab ${newTabId} ${newTabExists ? 'found' : 'not found after max retries'}, proceeding with sort`);
      pendingSortTabs.delete(newTabId);
      sortTabs(sortingType);
    } else {
      // Retry after a short delay
      console.debug(`${log_prefix} Tab ${newTabId} not found, retrying in ${retryDelay}ms`);
      setTimeout(() => {
        sortTabsWithRetry(sortingType, newTabId, retryCount + 1);
      }, retryDelay);
    }
  });
}

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

  console.debug(`${log_prefix} with '${sortingType}'`);

  getCurrentWindowTabs(function (tabs) {
    console.debug("Callback of getCurrentWindowTabs 1");
    let notPinnedTabs = tabs.filter((tab) => !tab.pinned); // Not taking in account pinned tabs
    let comparisonFunction;
    let customSort = undefined;

    console.debug(notPinnedTabs);

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

    console.debug(
      "Callback of getCurrentWindowTabs 2",
      `${comparisonFunction.name}, ${customSort ? customSort.name : ""}`
    );

    if (customSort) {
      notPinnedTabs = customSort(
        notPinnedTabs,
        comparisonFunction,
        getReverseCached()
      );
    } else {
      if (getReverseCached()) {
        notPinnedTabs.sort((tabB, tabA) => comparisonFunction(tabA, tabB));
        console.debug(`${log_prefix} Reverse sorting`);
      } else {
        notPinnedTabs.sort((tabA, tabB) => comparisonFunction(tabA, tabB));
      }
    }

    console.debug("Callback of getCurrentWindowTabs 3");

    let newIds = notPinnedTabs.map((tab) => tab.id); // Get an array of the tabs ids

    console.debug(`Callback of getCurrentWindowTabs 4 - Before Shuffle`);

    if (doShuffle) {
      console.debug(`${log_prefix} Shuffling tabs`);
      let i = newIds.length;
      let j, temp;
      if (i != 0) {
        while (--i) {
          j = Math.floor(Math.random() * (i + 1));
          temp = newIds[j];
          newIds[j] = newIds[i];
          newIds[i] = temp;
        }
      }
    }

    let numberOfPinnedTabs = tabs.length - notPinnedTabs.length;

    if (DEBUG) {
      performance.mark("begin");
    }

    console.debug(
      `Callback of getCurrentWindowTabs 5 - Before actual tab move`
    );

    // The index seems to be useless in this case of moving all the tabs
    chrome.tabs.move(newIds, {
      index: numberOfPinnedTabs,
    });

    if (DEBUG) {
      performance.mark("end");
      performance.measure("Tab reorganizing time", "begin", "end");
      console.table(
        performance.getEntriesByType("measure").map((e) => [e.name, e.duration])
      );
      performance.clearMarks();
      performance.clearMeasures();
    }
  });
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
    `${TAB_SORTER_PREFIX} (getCurrentWindowTabs): Before getAllWindowsCached`
  );

  // /!\ currentWindow: false != no argument currentWindow given
  let options = getAllWindowsCached()
    ? {}
    : {
        currentWindow: true,
      };
  console.debug(`${TAB_SORTER_PREFIX} (getCurrentWindowTabs): Before tab query`);

  chrome.tabs.query(options, function (tabs) {
    callback(tabs);
  });
}

// Easy reverse option for sorting
function simpleSort(array, comparisonFunction, reverse) {
  reverse = reverse || false;
  if (reverse) {
    array.sort((b, a) => comparisonFunction(a, b));
  } else {
    array.sort((a, b) => comparisonFunction(a, b));
  }
}

// Remove youtube notifications in title eg "(20) video" -> "video"
function removeParenthesisNotification(stringToModify) {
  return stringToModify.replace(/\(\d*\)/m, "").trim();
}

// Convert an object to JSON
function json(obj) {
  return JSON.stringify(obj, null, "    ");
}

// Domain extraction utility
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, ''); // Remove www prefix
  } catch (error) {
    console.error('Failed to extract domain from URL:', url, error);
    return null;
  }
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
      runtime: !!chrome.runtime
    });
    
    // Debug: Check manifest permissions
    const manifest = chrome.runtime.getManifest();
    console.log(`${log_prefix} Manifest permissions:`, manifest.permissions);
    
    // Get current active tab
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log(`${log_prefix} Current tab:`, currentTab);
    
    if (!currentTab) {
      console.error(`${log_prefix} No active tab found`);
      return;
    }

    const currentDomain = extractDomain(currentTab.url);
    console.log(`${log_prefix} Extracted domain: ${currentDomain} from URL: ${currentTab.url}`);
    
    if (!currentDomain) {
      console.error(`${log_prefix} Could not extract domain from current tab URL: ${currentTab.url}`);
      return;
    }

    // Get all tabs from all windows
    const allTabs = await chrome.tabs.query({});
    console.log(`${log_prefix} Total tabs found: ${allTabs.length}`);
    
    const matchingTabs = allTabs.filter(tab => {
      const tabDomain = extractDomain(tab.url);
      const isMatch = tabDomain === currentDomain;
      if (isMatch) {
        console.log(`${log_prefix} Found matching tab: ${tab.id} (domain: ${tabDomain}) - ${tab.url} `);
      }
      return isMatch;
    });

    console.log(`${log_prefix} Matching tabs count: ${matchingTabs.length}`);

    if (matchingTabs.length === 0) {
      console.log(`${log_prefix} No other tabs found for domain: ${currentDomain}. No extraction needed.`);
      return;
    }

    // Check if current window has all tabs of same domain and no other windows have this domain
    const currentWindowTabs = await chrome.tabs.query({ currentWindow: true });
    console.log(`${log_prefix} Current window tabs count: ${currentWindowTabs.length}`);
    
    const otherWindowsTabs = allTabs.filter(tab => !currentWindowTabs.some(currentTab => currentTab.id === tab.id));
    console.log(`${log_prefix} Other windows tabs count: ${otherWindowsTabs.length}`);
    
    const otherWindowsMatchingTabs = otherWindowsTabs.filter(tab => {
      const tabDomain = extractDomain(tab.url);
      return tabDomain === currentDomain;
    });
    
    console.log(`${log_prefix} Other windows matching tabs count: ${otherWindowsMatchingTabs.length}`);

    // Check if current window has all tabs of same domain
    const currentWindowOtherDomains = currentWindowTabs.filter(tab => {
      const tabDomain = extractDomain(tab.url);
      return tabDomain !== currentDomain;
    });
    
    console.log(`${log_prefix} Current window tabs with other domains: ${currentWindowOtherDomains.length}`);

    // If current window has all tabs of same domain AND no other windows have this domain, skip extraction
    if (currentWindowOtherDomains.length === 0 && otherWindowsMatchingTabs.length === 0) {
      console.log(`${log_prefix} Current window already contains all tabs of domain ${currentDomain} and no other windows have this domain. No extraction needed.`);
      return;
    }

    console.log(`${log_prefix} About to create new window with tabId: ${currentTab.id}`);
    
    // Create new window with the current tab (no new tab created)
    const newWindow = await chrome.windows.create({
      tabId: currentTab.id,
      focused: true,
      type: 'normal'
    });
    
    console.log(`${log_prefix} New window created:`, newWindow);
    
    if (chrome.runtime.lastError) {
      console.error(`${log_prefix} Chrome runtime error after window creation:`, chrome.runtime.lastError);
      return;
    }

    // Move all other matching tabs to the new window
    if (matchingTabs.length > 0) {
      const tabIds = matchingTabs.map(tab => tab.id);
      console.log(`${log_prefix} Moving ${tabIds.length} tabs to new window:`, tabIds);
      
      await chrome.tabs.move(tabIds, {
        windowId: newWindow.id,
        index: 1
      });
      
      if (chrome.runtime.lastError) {
        console.error(`${log_prefix} Chrome runtime error after moving tabs:`, chrome.runtime.lastError);
        return;
      }
      
      console.log(`${log_prefix} Successfully moved tabs to new window`);
    }

    console.log(`${log_prefix} Domain extraction completed successfully`);

    // Auto-sort after successful extraction if enabled
    if (getAutoOnNewTabCached()) {
      console.log(`${log_prefix} Auto-sort is enabled, performing sort after extraction`);
      const defaultSortMethod = getDefaultSortMethodCached();
      console.log(`${log_prefix} Using default sort method: ${defaultSortMethod}`);
      
      // Sort tabs in the new window
      // Note: No retry mechanism here is done (to be checked if needed)
      chrome.tabs.query({ windowId: newWindow.id }, (tabs) => {
        if (tabs && tabs.length > 0) {
          console.log(`${log_prefix} Sorting ${tabs.length} tabs in the new window`);
          sortTabs(defaultSortMethod);
        }
      });
    }

  } catch (error) {
    console.error(`${log_prefix} Error during domain extraction:`, error);
    console.error(`${log_prefix} Error stack:`, error.stack);
    
    if (chrome.runtime.lastError) {
      console.error(`${log_prefix} Chrome runtime error:`, chrome.runtime.lastError);
    }
  }
}
