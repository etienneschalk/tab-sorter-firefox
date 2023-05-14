const DEBUG = false;
const FOREACH_SORT = false;

var state = {
  reverse: true,
  allWindows: true,
};

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
  console.log(reverse);
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
function sortTabs(sortingType, shuffle) {
  shuffle = shuffle || false;

  console.log(`[Tab Sorter] sortTabs() with ${sortingType}`);

  getCurrentWindowTabs(function (tabs) {
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

    if (customSort) {
      notPinnedTabs = customSort(
        notPinnedTabs,
        comparisonFunction,
        getReverse()
      );
    } else {
      if (getReverse()) {
        notPinnedTabs.sort((tabB, tabA) => comparisonFunction(tabA, tabB));
        if (DEBUG) console.log("Reverse sorting");
      } else {
        notPinnedTabs.sort((tabA, tabB) => comparisonFunction(tabA, tabB));
      }
    }

    let newIds = notPinnedTabs.map((tab) => tab.id); // Get an array of the tabs ids

    if (shuffle) {
      if (DEBUG) {
        console.log("Shuffling tabs");
      }
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

    performance.mark("begin");

    // The index seems to be useless in this case of moving all the tabs
    chrome.tabs.move(newIds, {
      index: numberOfPinnedTabs,
    });

    performance.mark("end");
    performance.measure("Tab reorganizing time", "begin", "end");
    console.table(
      performance.getEntriesByType("measure").map((e) => [e.name, e.duration])
    );
    performance.clearMarks();
    performance.clearMeasures();
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
  // /!\ currentWindow: false != no argument currentWindow given
  let options = {};
  if (getAllWindows() == false) {
    options = {
      currentWindow: true,
    };
  }
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

// Getter/Setters on state  ----------------------------------------------------
// -----------------------------------------------------------------------------
function setReverse(choice) {
  state.reverse = choice;
  if (DEBUG) console.debug("Reverse sorting: " + choice);
}

function getReverse() {
  return state.reverse;
}

function setAllWindows(choice) {
  state.allWindows = choice;
  if (DEBUG) console.debug("Sorting in all windows ? " + choice);
}

function getAllWindows() {
  return state.allWindows;
}

// Configure event listening ---------------------------------------------------
// -----------------------------------------------------------------------------
function eventConfig(command, value) {
  value = value || undefined;
  switch (command) {
    case "sort-tabs-url":
      sortTabs("sort-tabs-url");
      break;
    case "sort-tabs-mru":
      sortTabs("sort-tabs-mru");
      break;
    case "sort-tabs-title":
      sortTabs("sort-tabs-title");
      break;
    case "sort-tabs-favicon-and-title":
      sortTabs("sort-tabs-favicon-and-title");
      break;
    case "sort-tabs-shuffle":
      sortTabs("sort-tabs-mru", true);
      break;
    default:
  }
}

// Using the sort-tabs shortcut defined in manifest.json -----------------------
chrome.commands.onCommand.addListener((command) => {
  eventConfig(command);
});

// Clicking on a popup button --------------------------------------------------
chrome.runtime.onMessage.addListener((message) => {
  eventConfig(message.command);
  if (message.command === "sort-tabs-reverse") {
    setReverse(message.value);
  } else if (message.command === "sort-tabs-all-windows") {
    setAllWindows(message.value);
  }
});
