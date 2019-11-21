const DEBUG = false;


// Comparison functions --------------------------------------------------------
// -----------------------------------------------------------------------------

function comparisonByUrl(tabA, tabB) {
  return tabA.url.localeCompare(tabB.url);
}

function comparisonByMru(tabA, tabB) {
  return tabA.lastAccessed - tabB.lastAccessed;
}


// Core sorting function -------------------------------------------------------
// -----------------------------------------------------------------------------
function sortTabs(sortingType) {
  console.log(`[Tab Sorter] sortTabs() with ${sortingType}`);

  getCurrentWindowTabs().then((tabs) => {
    let notPinnedTabs = tabs.filter((tab) => !tab.pinned); // Not taking in account pinned tabs
    let comparisonFunction;

    switch (sortingType) {
      case "sort-tabs-url":
        comparisonFunction = comparisonByUrl;
        break;
      case "sort-tabs-mru":
        comparisonFunction = comparisonByMru;
        break;
      default:
        comparisonFunction = comparisonByUrl;
    }

    notPinnedTabs.sort((tabA, tabB) => comparisonFunction(tabA, tabB));
    let newIds = notPinnedTabs.map((tab) => tab.id); // Get an array of the tabs ids

    let numberOfPinnedTabs = tabs.length - notPinnedTabs.length;

    function onMoved(theTab) {
      if (DEBUG)
        console.debug(`Moved: [${theTab[0].id}] ${theTab[0].url}`);
    }

    function onError(error) {
      console.error("Error:" + error);
    }

    newIds.forEach((value, index) => {
      let moving = browser.tabs.move(
        value, {
          index: index + numberOfPinnedTabs
        }
      );
      moving.then(onMoved, onError);
    });
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
function getCurrentWindowTabs() {
  return browser.tabs.query({
    currentWindow: true
  });
}

// Configure event listening ---------------------------------------------------
// -----------------------------------------------------------------------------
function eventConfig(command) {
  switch (command) {
    case "sort-tabs-url":
      sortTabs("sort-tabs-url");
      break;
    case "sort-tabs-mru":
      sortTabs("sort-tabs-mru");
      break;
    default:
      ;
  }
}

// Exports ---------------------------------------------------------------------
// -----------------------------------------------------------------------------
export {
  sortTabs,
  eventConfig
};
