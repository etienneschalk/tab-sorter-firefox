// BROWSER = "firefox";
// BROWSER = "chrome";

chrome.runtime.sendMessage("queryInitialState", (initialState) => {
  console.log("Received initial state", initialState);
  initializeUserInterface(initialState);
});

// async function getInitialStateForFirefox() {
//   // > This a synchronous function.
//   // See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/extension/getBackgroundPage
//   const backgroundWindow = chrome.extension.getBackgroundPage();

//   const isReverse = await backgroundWindow.getReverseAsync();
//   const isAllWindows = await backgroundWindow.getAllWindowsAsync();
//   const isAutoOnNewTab = await backgroundWindow.getAutoOnNewTabAsync();
//   const defaultSortMethod = await backgroundWindow.getDefaultSortMethodAsync();
//   const availableSortMethods = backgroundWindow.getAvailableSortMethodsSync();

//   return {
//     isReverse,
//     isAllWindows,
//     isAutoOnNewTab,
//     defaultSortMethod,
//     availableSortMethods,
//   };
// }
// async function getInitialStateForChrome() {
//   // > Send data from the service worker to a content script
//   // See https://developer.chrome.com/docs/extensions/reference/runtime/

//   chrome.runtime.sendMessage({
//     type: "getInitialStateForChrome",
//     command: "getInitialStateForChrome",
//     value: null,
//   });

//   // from bg page
//   const AVAILABLE_SORT_METHODS = [
//     "sort_tabs_url",
//     "sort_tabs_mru",
//     "sort_tabs_title",
//     "sort_tabs_favicon_and_title",
//   ];
//   const STORAGE_DEFAULT_VALUE_DEFAULT_SORT_METHOD = AVAILABLE_SORT_METHODS[1];
//   // end

//   const isReverse = false;
//   const isAllWindows = false;
//   const isAutoOnNewTab = false;
//   const defaultSortMethod = STORAGE_DEFAULT_VALUE_DEFAULT_SORT_METHOD;
//   const availableSortMethods = AVAILABLE_SORT_METHODS;

//   return {
//     isReverse,
//     isAllWindows,
//     isAutoOnNewTab,
//     defaultSortMethod,
//     availableSortMethods,
//   };
// }

// async function getInitialState() {
//   if (BROWSER === "firefox") {
//     return getInitialStateForFirefox();
//   } else if (BROWSER === "chrome") {
//     return getInitialStateForChrome();
//   }
//   return undefined;
// }
function initializeUserInterface(initialState) {
  const {
    isReverse,
    isAllWindows,
    isAutoOnNewTab,
    defaultSortMethod,
    availableSortMethods,
    allCommands,
  } = initialState;

  const logPrefix = "[Tab Sorter] Initial State: ";
  console.log(logPrefix + "isReverse", isReverse);
  console.log(logPrefix + "isAllWindows", isAllWindows);
  console.log(logPrefix + "isAutoOnNewTab", isAutoOnNewTab);
  console.log(logPrefix + "defaultSortMethod", defaultSortMethod);
  console.log(logPrefix + "availableSortMethods", availableSortMethods);

  logCommands(allCommands);

  const commandDisplayPriority = {
    command_sort_tabs_favicon_and_title: 1,
    command_sort_tabs_title: 2,
    command_sort_tabs_url: 3,
    command_sort_tabs_mru: 4,
    command_sort_tabs_shuffle: 5,
  };

  const popupHtmlString = renderPopup({
    isReverse,
    isAllWindows,
    isAutoOnNewTab,
    defaultSortMethod,
    availableSortMethods,
    allCommands: allCommands
      .filter((command) => command.name.startsWith("command_sort_tabs"))
      .sort(
        (a, b) =>
          commandDisplayPriority[a.name] - commandDisplayPriority[b.name]
      ),
  });

  const container = new DOMParser()
    .parseFromString(popupHtmlString, "text/html")
    .getElementById("container");
  document.getElementById("container").innerHTML = "";
  document.getElementById("container").appendChild(container);
}

const CHECKBOX_REVERSE = "ui_click_checkbox_sort_tabs_reverse";
const CHECKBOX_ALL_WINDOWS = "ui_click_checkbox_sort_tabs_all_windows";
const CHECKBOX_AUTO_ON_NEW_TAB = "ui_click_checkbox_sort_tabs_auto_on_new_tab";
const SELECT_DEFAULT_SORT_METHOD =
  "ui_change_select_sort_select_tabs_default_sort_method";

function translate(message) {
  return chrome.i18n.getMessage(message);
}

function logCommands(commands) {
  commands.forEach((command) => {
    console.info(command);
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
  <button class="${className}" href="#" id="${"ui_click_button_command_"}${name}">
   ${translate(name)} 
  </button>  

  <br/>
  ${`<p class="has-text-centered"> ${
    shortcut
      ? renderShortcutHint(shortcut)
      : `<small>${translate("no_shortcut_configured")}</small>`
  } </p>`}
</div>
  `;
}

function renderCheckbox(id, initialValue) {
  return `
<label for=${id}>
  <input type="checkbox" id=${id} ${initialValue ? "checked" : ""}/>
   ${translate(id)} 
</label>
  `;
}
function renderSelect(id, options, initialSelectedValue) {
  return `
<label for="${id}">${translate(id)}</label>
<select id="${id}">
    ${options
      .map((option) => renderOption(option, initialSelectedValue))
      .join()}
</select>
`;
}

function renderOption(value, initialSelectedValue) {
  return `
<option value="${value}" ${value === initialSelectedValue ? "selected" : ""}>
    ${translate(`command_${value}`)}
</option>
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
    <div class="">
        <h1>  🗂️ ${translate("extensionName")} </h1>
    </div>
    <div class="flexcontainer">
        <div class="flexcol">
            <h2>❓ ${translate("help")} </h2>

            <br>
            <h3> ${translate("help_how_to_update_shortcuts_question")} </h3>
            <p> ${translate("help_how_to_update_shortcuts_answer")} </p>

            <br>
            <h3> ${translate("help_mru_not_working_chrome_question")} </h3>
            <p> ${translate("help_mru_not_working_chrome_answer")} </p>

            <br>
            <h3>${translate("help_encountered_a_problem_question")} </h3>
            <p> ${translate("help_encountered_a_problem_answer")} </p>
        </div>
        <div class="flexcol">
            <h2> ⚙️ ${translate("preferences")} </h2>
            <br> 
            <h3> ${translate("preferences_general")}</h3>
            ${renderCheckbox(CHECKBOX_REVERSE, isReverse)}
            ${renderCheckbox(CHECKBOX_ALL_WINDOWS, isAllWindows)}
            <br> 
            <h3> ${translate("preferences_auto")}</h3>
            ${renderCheckbox(CHECKBOX_AUTO_ON_NEW_TAB, isAutoOnNewTab)}
            <br>
            ${renderSelect(
              SELECT_DEFAULT_SORT_METHOD,
              availableSortMethods,
              defaultSortMethod
            )}
        </div>
        <div class="flexcol">
            <h2> 🧹 ${translate("actions")} </h2>
            <br> 
            ${allCommands
              .map((command) => renderCommandActionButton(command))
              .join("<br>")}
            <br>
        </div>
    </div>
    <div class="">
        <small> Tab Sorter - ${chrome.runtime.getManifest().version} </small>
    </div>
</div>
  `;
}

// Event listeners

// Clicking on the extension "Sort tabs" icon buttons and checkboxes
document.addEventListener("click", (e) => {
  const id = e.target.id;

  let command = null;
  let value = null;

  if (id.startsWith("ui_click_button_command_")) {
    command = id.replace("ui_click_button_command_", "");
  } else if (id.startsWith("ui_click_checkbox_")) {
    command = id;
    value = e.target.checked;
  }

  chrome.runtime.sendMessage({
    type: "clickFromPopup",
    command: command,
    value: value,
  });
});

// Changing a select
document.addEventListener("change", (e) => {
  const id = e.target.id;

  let command = null;
  let value = null;

  if (id.startsWith("ui_change_select_")) {
    command = id;
    value = e.target.value;
  }

  chrome.runtime.sendMessage({
    type: "changeFromPopup",
    command: command,
    value: value,
  });
});
