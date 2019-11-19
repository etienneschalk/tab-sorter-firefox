
function getCurrentWindowTabs() {
  return browser.tabs.query({
    currentWindow: true
  });
}

function sortTabs() {
  console.log("[Tab Sorter] sortTabs()");

  getCurrentWindowTabs().then((tabs) => {
    let notPinnedTabs = tabs.filter((tab) => !tab.pinned); // Not taking in account pinned tabs
    notPinnedTabs.sort((tabA, tabB) => tabA.url.localeCompare(tabB.url))
    let newIds = notPinnedTabs.map((tab) => tab.id); // Get an array of the tabs ids

    let numberOfPinnedTabs = tabs.length - notPinnedTabs.length;

    function onMoved(theTab) {
      console.log(`Moved: [${theTab[0].id}] ${theTab[0].url}`);
    }

    function onError(error) {
      console.log("Error:" + error);
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

// Zipping two arrays like in python
function zip(a, b) {
  if (a.length !== b.length) {
    return null;
  }
  return a.map((e, i) => [e, b[i]]);
}

export default sortTabs;
