renderTemplateAsync();

async function renderTemplateAsync() {
  const backgroundWindow = await chrome.extension.getBackgroundPage();
  const isReverse = await backgroundWindow.getReverseAsync();
  const isAllWindows = await backgroundWindow.getAllWindowsAsync();

  const allCommands = await browser.commands.getAll();
  logCommands(allCommands);

  console.log("isReverse", isReverse);
  console.log("isAllWindows", isAllWindows);

  const popupHtmlString = renderPopup({ isReverse, isAllWindows, allCommands });

  const container = new DOMParser()
    .parseFromString(popupHtmlString, "text/html")
    .getElementById("container");
  document.getElementById("container").innerHTML = "";
  document.getElementById("container").appendChild(container);
}

const SORT_TABS_REVERSE = "ui-checkbox-sort-tabs-reverse";
const SORT_TABS_ALL_WINDOWS = "ui-checkbox-sort-tabs-all-windows";
const ACTION_BUTTON_ID_PREFIX = "click-button-";

function translate(message) {
  return chrome.i18n.getMessage(message);
}

// TODO -> Display the commands shortcut in the POPUP
function logCommands(commands) {
  commands.forEach((command) => {
    console.debug(command);
  });
}

function renderShortcutHint(shortcutString) {
  return shortcutString
    .split("+")
    .map((part) => `<kbd>${part}</kbd>`)
    .join("+");
}
function renderCommandActionButton(command) {
  const { name, shortcut } = command;

  const className = shortcut ? "button-primary" : "button-simple";
  return `
<div>
  <button class="${className}" href="#" id="${ACTION_BUTTON_ID_PREFIX}${name}">
   ${translate(name)} 
  </button>  

  <br/>
  ${`<p class="has-text-centered"> ${
    shortcut
      ? renderShortcutHint(shortcut)
      : "<small>No shortcut configured yet</small>"
  } </p>`}
</div>
  `;
}

function renderConfigurationCheckbox(id, initialValue) {
  return `
<label for=${id}>
  <input type="checkbox" id=${id} ${initialValue ? "checked" : ""}/>
   ${translate(id)} 
</label>
  `;
}

function renderPopup(params) {
  const { isReverse, isAllWindows, allCommands } = params;

  return `
<div id="container">

  <h1> ${translate("extensionName")} </h1>

  <br />

  <h2> ${translate("actions")} </h2>

  ${allCommands
    .map((command) => renderCommandActionButton(command))
    .join("<br/>")}

  <br />

  <h2> ${translate("preferences")} </h2>

  ${renderConfigurationCheckbox(SORT_TABS_REVERSE, isReverse)}
  ${renderConfigurationCheckbox(SORT_TABS_ALL_WINDOWS, isAllWindows)}

  <a href="#" id="click-button-sort-tabs-shuffle"> ${translate("shuffle")} </a>

  <br/>
  
  <!--<a href="about:addons" id="change-addons-preferences-link"> ${translate(
    "change-addons-preferences"
  )} </a>-->

  <small> Tab Sorter </small>

  </div>
  `;
}

// function renderPopup(params) {
//   const { isReverse, isAllWindows } = params;

//   return `
//   <div id="container">

//   <h1> ${translate("extensionName")} </h1>
//   <br />

//   <button class="button-primary" href="#" id="click-button-sort-tabs-mru"> ${translate(
//     "command-sort-tabs-mru"
//   )} </button>
//   <!--<p class="has-text-centered"> (${translate(
//     "shortcutSortTabsByMru"
//   )}) </p>-->
//   <br />

//   <button class="button-primary" href="#" id="click-button-sort-tabs-favicon-and-title"> ${translate(
//     "command-sort-tabs-favicon-and-title"
//   )} </button>
//   <!--<p class="has-text-centered"> (${translate(
//     "shortcutSortTabsByFaviconAndTitle"
//   )}) </p>-->
//   <br />

//   <button class="button-simple" href="#" id="click-button-sort-tabs-title"> ${translate(
//     "command-sort-tabs-title"
//   )} </button>
//   <p> <!--(${translate("shortcutSortTabsByTitle")})--> </p>
//   <br />

//   <button class="button-simple" href="#" id="click-button-sort-tabs-url"> ${translate(
//     "command-sort-tabs-url"
//   )} </button>
//   <p> <!--(${translate("shortcutSortTabsByUrl")})--> </p>
//   <br />

//   <h2> Preferences </h2>

//   <label for=${SORT_TABS_REVERSE}>
//   <input type="checkbox" id=${SORT_TABS_REVERSE} ${isReverse ? "checked" : ""}/>
//    ${translate("reverseSorting")} </label>
//   <br/>

//   <label for=${SORT_TABS_ALL_WINDOWS}>
//   <input type="checkbox" id=${SORT_TABS_ALL_WINDOWS} ${
//     isAllWindows ? "checked" : ""
//   }/>
//    ${translate("allWindows")} </label>
//   <br/>

//   <a href="#" id="click-button-sort-tabs-shuffle"> ${translate("shuffle")} </a>

//   <br/>

//   <!--<a href="about:addons" id="change-addons-preferences-link"> ${translate(
//     "change-addons-preferences"
//   )} </a>-->

//   <small> Tab Sorter </small>

//   </div>
//   `;
// }

// Clicking on the extension "Sort tabs" icon
document.addEventListener("click", (e) => {
  let command = null;
  let value = null;
  switch (e.target.id) {
    case "click-button-command-sort-tabs-url":
      command = "command-sort-tabs-url";
      break;
    case "click-button-command-sort-tabs-mru":
      command = "command-sort-tabs-mru";
      break;
    case "click-button-command-sort-tabs-title":
      command = "command-sort-tabs-title";
      break;
    case "click-button-command-sort-tabs-favicon-and-title":
      command = "command-sort-tabs-favicon-and-title";
      break;
    case "click-button-command-sort-tabs-shuffle":
      command = "command-sort-tabs-shuffle";
      break;

    case SORT_TABS_REVERSE:
      command = SORT_TABS_REVERSE;
      value = e.target.checked;
      break;
    case SORT_TABS_ALL_WINDOWS:
      command = SORT_TABS_ALL_WINDOWS;
      value = e.target.checked;
      break;

    default:
  }

  chrome.runtime.sendMessage({
    type: "clickFromPopup",
    command: command,
    value: value,
  });
});
