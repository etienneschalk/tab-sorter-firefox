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
  "sort-tabs-url",
  "sort-tabs-mru",
  "sort-tabs-title",
  "sort-tabs-favicon-and-title",
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

function getAvailableSortMethodsSync() {
  return AVAILABLE_SORT_METHODS;
}
// private
// -----------------------------------------------------------------------------

function initTabSorter() {
  fillCache();
  addEventListeners();
}

// Getter/Setters on Global State
// -----------------------------------------------------------------------------
const CACHED_STATE = {};

function fillCache() {
  getReverseAsync();
  getAllWindowsAsync();
  getAutoOnNewTabAsync();
  getDefaultSortMethodAsync();
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

  const key_value_obj = await browser.storage.sync.get(key);
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

  const log_prefix = `${TAB_SORTER_PREFIX} ${arguments.callee.name}:`;

  console.debug(`${log_prefix} ${key}=${value}`);

  function onSuccess(item) {
    console.debug(`${log_prefix} ${item}`);
    CACHED_STATE[key] = value;
  }
  function onError(error) {
    console.error(`${log_prefix} ${error}`);
  }
  browser.storage.sync.set(payload).then(onSuccess, onError);
}

// Configure event listening ---------------------------------------------------
// -----------------------------------------------------------------------------

function addEventListeners() {
  // Using the sort-tabs shortcut defined in manifest.json -----------------------
  chrome.commands.onCommand.addListener((command) => {
    console.debug(`${TAB_SORTER_PREFIX} Command event received: ${command}`);
    commandEventListener(command);
  });

  // Clicking on a popup button --------------------------------------------------
  chrome.runtime.onMessage.addListener((message) => {
    console.debug(
      `${TAB_SORTER_PREFIX} Message event received: ${message.command} with value=${message.value}`
    );
    commandEventListener(message.command);
    stateUpdateEventListener(message.command, message.value);
  });

  // Listening on a new tab opening-----------------------------------------------
  browser.tabs.onCreated.addListener((tab) => {
    if (getAutoOnNewTabCached()) {
      sortTabs(getDefaultSortMethodCached());
    }
  });
}

function commandEventListener(command) {
  switch (command) {
    case "command-sort-tabs-url":
      sortTabs("sort-tabs-url");
      break;
    case "command-sort-tabs-mru":
      sortTabs("sort-tabs-mru");
      break;
    case "command-sort-tabs-title":
      sortTabs("sort-tabs-title");
      break;
    case "command-sort-tabs-favicon-and-title":
      sortTabs("sort-tabs-favicon-and-title");
      break;
    case "command-sort-tabs-shuffle":
      sortTabs("sort-tabs-mru", true);
      break;
    default:
  }
}

function stateUpdateEventListener(command, value) {
  if (command === "ui-checkbox-sort-tabs-reverse") {
    setReverse(value);
  } else if (command === "ui-checkbox-sort-tabs-all-windows") {
    setAllWindows(value);
  } else if (command === "ui-checkbox-sort-tabs-auto-on-new-tab") {
    setAutoOnNewTab(value);
  } else if (command === "ui-sort-select-tabs-default-sort-method") {
    setDefaultSortMethod(value);
  }
}

// Custom sorts ----------------------------------------------------------------
// Takes tabs, return tabs
// -----------------------------------------------------------------------------

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

// Comparison functions --------------------------------------------------------
// -----------------------------------------------------------------------------

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

// Core sorting function -------------------------------------------------------
// -----------------------------------------------------------------------------

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
  const log_prefix = `${TAB_SORTER_PREFIX} ${arguments.callee.name}:`;

  console.debug(`${log_prefix} with '${sortingType}'`);

  getCurrentWindowTabs(function (tabs) {
    console.debug("Callback of getCurrentWindowTabs 1");

    let notPinnedTabs = tabs.filter((tab) => !tab.pinned); // Not taking in account pinned tabs
    let comparisonFunction;
    let customSort = undefined;

    switch (sortingType) {
      case "sort-tabs-url":
        comparisonFunction = comparisonByUrl;
        break;
      case "sort-tabs-mru":
        comparisonFunction = comparisonByMru;
        break;
      case "sort-tabs-title":
        comparisonFunction = comparisonByTitle;
        break;
      case "sort-tabs-favicon-and-title":
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

// Helpers ---------------------------------------------------------------------
// -----------------------------------------------------------------------------

// Zipping two arrays like in python -------------------------------------------
function zip(a, b) {
  if (a.length !== b.length) {
    return null;
  }
  return a.map((e, i) => [e, b[i]]);
}

// Retrieve the tabs from the current window -----------------------------------
function getCurrentWindowTabs(callback) {
  console.debug(
    `${TAB_SORTER_PREFIX} getCurrentWindowTabs Before getAllWindowsCached`
  );

  // /!\ currentWindow: false != no argument currentWindow given
  let options = getAllWindowsCached()
    ? {}
    : {
        currentWindow: true,
      };
  console.debug(`${TAB_SORTER_PREFIX} getCurrentWindowTabs Before tab query`);

  chrome.tabs.query(options, function (tabs) {
    callback(tabs);
  });
}

// Easy reverse option for sorting ---------------------------------------------
function simpleSort(array, comparisonFunction, reverse) {
  reverse = reverse || false;
  if (reverse) {
    array.sort((b, a) => comparisonFunction(a, b));
  } else {
    array.sort((a, b) => comparisonFunction(a, b));
  }
}

// Remove youtube notifications in title eg "(20) video" -> "video" ------------
function removeParenthesisNotification(stringToModify) {
  return stringToModify.replace(/\(\d*\)/m, "").trim();
}

// Convert an object to JSON  --------------------------------------------------
function json(obj) {
  return JSON.stringify(obj, null, "    ");
}
