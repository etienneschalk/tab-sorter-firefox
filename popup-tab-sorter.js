const SORT_TABS_REVERSE = "sort-tabs-reverse";
const SORT_TABS_ALL_WINDOWS = "sort-tabs-all-windows";

function retrieve(message) {
  return chrome.i18n.getMessage(message);
}

async function initTemplate() {
  var backgroundWindow = await chrome.extension.getBackgroundPage();
  var isReverse = backgroundWindow.getReverse();
  var isAllWindows = backgroundWindow.getAllWindows();

  const popupContent = `
  <div id="container">

  <!--<h1> ${retrieve("extensionName")} </h1>
  <br />-->

  <button class="button-primary" href="#" id="sort-tabs-mru"> ${retrieve(
    "buttonSortTabsByMru"
  )} </button>
  <p class="has-text-centered"> (${retrieve("shortcutSortTabsByMru")}) </p>
  <br />

  <button class="button-primary" href="#" id="sort-tabs-favicon-and-title"> ${retrieve(
    "buttonSortTabsByFaviconAndTitle"
  )} </button>
  <p class="has-text-centered"> (${retrieve(
    "shortcutSortTabsByFaviconAndTitle"
  )}) </p>
  <br />

  <button class="button-simple" href="#" id="sort-tabs-title"> ${retrieve(
    "buttonSortTabsByTitle"
  )} </button>
  <p> <!--(${retrieve("shortcutSortTabsByTitle")})--> </p>
  <br />

  <button class="button-simple" href="#" id="sort-tabs-url"> ${retrieve(
    "buttonSortTabsByUrl"
  )} </button>
  <p> <!--(${retrieve("shortcutSortTabsByUrl")})--> </p>
  <br />

  <label for="sort-tabs-reverse">
  <input type="checkbox" id="sort-tabs-reverse" ${isReverse ? "checked" : ""}/>
   ${retrieve("reverseSorting")} </label>
  <br/>

  <label for="sort-tabs-all-windows">
  <input type="checkbox" id="sort-tabs-all-windows" ${
    isAllWindows ? "checked" : ""
  }/>
   ${retrieve("allWindows")} </label>
  <br/>

  <a href="#" id="sort-tabs-shuffle"> ${retrieve("shuffle")} </a>

  <small> Tab Sorter </small>
  </div>
  `;

  // <input type="checkbox" id="sort-tabs-reverse" ${getReverseToUi() ? 'checked' : ''}/>

  const container = new DOMParser()
    .parseFromString(popupContent, "text/html")
    .getElementById("container");
  document.getElementById("container").innerHTML = ``;
  document.getElementById("container").appendChild(container);

  // Restore default options from storage sync
  document.addEventListener("DOMContentLoaded", restoreOptions);

  // Listeners on checkboxes to persist settings.
  document
    .getElementById("container")
    .querySelectorAll("input[type=checkbox]")
    .forEach((checkbox) =>
      checkbox.addEventListener("change", (event) => {
        event.preventDefault();
        saveOption(event.target.id, event.target.checked);
      })
    );
}

// Clicking on the extension "Sort tabs" icon
document.addEventListener("click", (e) => {
  let command = null;
  let value = null;
  switch (e.target.id) {
    case "sort-tabs-url":
      command = "sort-tabs-url";
      break;
    case "sort-tabs-mru":
      command = "sort-tabs-mru";
      break;
    case "sort-tabs-title":
      command = "sort-tabs-title";
      break;
    case "sort-tabs-favicon-and-title":
      command = "sort-tabs-favicon-and-title";
      break;
    case "sort-tabs-shuffle":
      command = "sort-tabs-shuffle";
      break;
    case "sort-tabs-reverse":
      command = "sort-tabs-reverse";
      value = e.target.checked;
      break;
    case "sort-tabs-all-windows":
      command = "sort-tabs-all-windows";
      value = e.target.checked;
      break;
    case "close-button":
      window.close();
      break;
    default:
  }

  chrome.runtime.sendMessage({
    type: "clickFromPopup",
    command: command,
    value: value,
  });
});

// Settings persistence
function saveOption(key, value) {
  browser.storage.sync.set({
    [key]: value,
  });
  console.debug("saveOption", key, "=", value);
}

function restoreOptions() {
  function setCurrentChoice(id) {
    return (result) => {
      if (result[id] === undefined) {
        console.debug(
          "restoreOptions.setCurrentChoice: skip restoration because no setting exists yet.",
          id
        );
        return;
      }
      document.querySelector(`#${id}`).checked = result[id];
      console.debug("restoreOptions.setCurrentChoice:", id, result[id]);
    };
  }

  onError = (error) => console.log(`Error: ${error}`);

  browser.storage.sync
    .get(SORT_TABS_REVERSE)
    .then(setCurrentChoice(SORT_TABS_REVERSE), onError);
  browser.storage.sync
    .get(SORT_TABS_ALL_WINDOWS)
    .then(setCurrentChoice(SORT_TABS_ALL_WINDOWS), onError);
}

initTemplate();
