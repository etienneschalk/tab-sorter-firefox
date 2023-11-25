renderTemplateAsync();

async function renderTemplateAsync() {
  const backgroundWindow = await chrome.extension.getBackgroundPage();

  const isReverse = await backgroundWindow.getReverseAsync();
  const isAllWindows = await backgroundWindow.getAllWindowsAsync();
  const isAutoOnNewTab = await backgroundWindow.getAutoOnNewTabAsync();
  const defaultSortMethod = await backgroundWindow.getDefaultSortMethodAsync();

  console.log("isReverse", isReverse);
  console.log("isAllWindows", isAllWindows);
  console.log("isAutoOnNewTab", isAutoOnNewTab);
  console.log("defaultSortMethod", defaultSortMethod);

  const allCommands = await browser.commands.getAll();
  logCommands(allCommands);

  const availableSortMethods = backgroundWindow.getAvailableSortMethodsSync();
  console.log("availableSortMethods", availableSortMethods);

  const popupHtmlString = renderPopup({
    isReverse,
    isAllWindows,
    isAutoOnNewTab,
    defaultSortMethod,
    availableSortMethods,
    allCommands,
  });

  const container = new DOMParser()
    .parseFromString(popupHtmlString, "text/html")
    .getElementById("container");
  document.getElementById("container").innerHTML = "";
  document.getElementById("container").appendChild(container);
}

const SORT_TABS_REVERSE = "ui-checkbox-sort-tabs-reverse";
const SORT_TABS_ALL_WINDOWS = "ui-checkbox-sort-tabs-all-windows";
const SORT_TABS_AUTO_ON_NEW_TAB = "ui-checkbox-sort-tabs-auto-on-new-tab";
const SORT_TABS_DEFAULT_SORT_METHOD = "ui-sort-select-tabs-default-sort-method";

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
  const {
    isReverse,
    isAllWindows,
    isAutoOnNewTab,
    defaultSortMethod,
    availableSortMethods,
    allCommands,
  } = params;

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

  ${renderConfigurationCheckbox(SORT_TABS_AUTO_ON_NEW_TAB, isAutoOnNewTab)}

  <label for="${SORT_TABS_DEFAULT_SORT_METHOD}">[TBT] Choose an automatic sorting method:</label>

  <select id="${SORT_TABS_DEFAULT_SORT_METHOD}" >
  ${availableSortMethods
    .map(
      (sortMethod) =>
        `<option value="${sortMethod}" ${
          sortMethod === defaultSortMethod ? "selected" : ""
        }>[TBT] ${sortMethod}</option>`
    )
    .join()}
  </select>

  <a href="#" id="click-button-sort-tabs-shuffle"> ${translate("shuffle")} </a>

  <br/>
  
  <!--<a href="about:addons" id="change-addons-preferences-link"> ${translate(
    "change-addons-preferences"
  )} </a>-->

  <small> Tab Sorter </small>

  </div>
  `;
}

// Clicking on the extension "Sort tabs" icon buttons and checkboxes
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
    case SORT_TABS_AUTO_ON_NEW_TAB:
      command = SORT_TABS_AUTO_ON_NEW_TAB;
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

document.addEventListener("change", (e) => {
  let command = null;
  let value = null;

  switch (e.target.id) {
    case SORT_TABS_DEFAULT_SORT_METHOD:
      command = SORT_TABS_DEFAULT_SORT_METHOD;
      value = e.target.value;
      break;
    default:
  }

  chrome.runtime.sendMessage({
    type: "changeFromPopup",
    command: command,
    value: value,
  });
});
