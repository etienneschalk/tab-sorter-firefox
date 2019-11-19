function getCurrentWindowTabs() {
  return browser.tabs.query({
    currentWindow: true
  });
}

function listTabs() {
  getCurrentWindowTabs().then((tabs) => {
    let tabsList = document.getElementById('tabs-list');
    let currentTabs = document.createDocumentFragment();
    let limit = 5;
    let counter = 0;

    tabsList.textContent = '';

    for (let tab of tabs) {
      if (counter < limit) {
        let tabLi = document.createElement('li');
        let tabLink = document.createElement('a');
        tabLink.textContent = tab.url || tab.title || tab.id;
        tabLink.setAttribute('href', tab.id);
        tabLink.classList.add('switch-tabs');
        tabLi.appendChild(tabLink);
        currentTabs.appendChild(tabLi);
      }
      counter++;
    }
    tabsList.appendChild(currentTabs);
  });
}

function sortTabs() {
  getCurrentWindowTabs().then((tabs) => {
    let notPinnedTabs = tabs.filter((tab) => !tab.pinned); // Not taking in account pinned tabs
    console.log(notPinnedTabs)
    // notPinnedTabs.sort((tabA, tabB) => tabA.url - tabB.url);
    notPinnedTabs.sort((tabA, tabB) => tabA.url.localeCompare(tabB.url))
    let newIds = notPinnedTabs.map((tab) => tab.id); // Get an array of the tabs ids

    function onMoved(tab) {
      console.log("Moved :" + tab.url);
    }

    function onError(error) {
      console.log("Error :" + error);
    }

    newIds.forEach((value, index) => {
      let moving = browser.tabs.move(
        value, {
          index: index
        }
      );
      moving.then(onMoved, onError);
    });
  });
}

function zip(a, b) {
  if (a.length !== b.length) {
    return null;
  }
  return a.map((e, i) => [e, b[i]]);
}

// Event listeners -------------------------------------------------------------

// document.addEventListener("DOMContentLoaded", listTabs);

document.addEventListener("click", (e) => {
  if (e.target.id === "sort-tabs") {
    sortTabs();
  }
});
