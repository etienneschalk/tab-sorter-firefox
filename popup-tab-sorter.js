renderTemplateAsync();

async function renderTemplateAsync() {
  // > This a synchronous function.
  // See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/extension/getBackgroundPage
  const backgroundWindow = chrome.extension.getBackgroundPage();

  const isReverse = await backgroundWindow.getReverseAsync();
  const isAllWindows = await backgroundWindow.getAllWindowsAsync();
  const isAutoOnNewTab = await backgroundWindow.getAutoOnNewTabAsync();
  const defaultSortMethod = await backgroundWindow.getDefaultSortMethodAsync();
  const availableSortMethods = backgroundWindow.getAvailableSortMethodsSync();

  const logPrefix = "[Tab Sorter] Initial State: ";
  console.log(logPrefix + "isReverse", isReverse);
  console.log(logPrefix + "isAllWindows", isAllWindows);
  console.log(logPrefix + "isAutoOnNewTab", isAutoOnNewTab);
  console.log(logPrefix + "defaultSortMethod", defaultSortMethod);
  console.log(logPrefix + "availableSortMethods", availableSortMethods);

  const allCommands = await browser.commands.getAll();
  logCommands(allCommands);

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

const CHECKBOX_REVERSE = "ui-click-checkbox-sort-tabs-reverse";
const CHECKBOX_ALL_WINDOWS = "ui-click-checkbox-sort-tabs-all-windows";
const CHECKBOX_AUTO_ON_NEW_TAB = "ui-click-checkbox-sort-tabs-auto-on-new-tab";
const SELECT_DEFAULT_SORT_METHOD =
  "ui-change-select-sort-select-tabs-default-sort-method";

function translate(message) {
  return chrome.i18n.getMessage(message);
}

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
  <button class="${className}" href="#" id="${"ui-click-button-command-"}${name}">
   ${translate(name)} 
  </button>  

  <br/>
  ${`<p class="has-text-centered"> ${
    shortcut
      ? renderShortcutHint(shortcut)
      : `<small>${translate("no-shortcut-configured")}</small>`
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
    ${translate(`command-${value}`)}
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
            <h3> ${translate("help.how-to-update-shortcuts.question")} </h3>
            <p> ${translate("help.how-to-update-shortcuts.answer")}
            <p>
            <br>
            <h3>❗${translate("help.encountered-a-problem.question")} </h3>
            <p> ${translate("help.encountered-a-problem.answer")}
        </div>
        <div class="flexcol">
            <h2> ⚙️ ${translate("preferences")} </h2>
            <br> 
            <h3> ${translate("preferences-general")}</h3>
            ${renderCheckbox(CHECKBOX_REVERSE, isReverse)}
            ${renderCheckbox(CHECKBOX_ALL_WINDOWS, isAllWindows)}
            <br> 
            <h3> ${translate("preferences-auto")}</h3>
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
        <small> Tab Sorter - ${browser.runtime.getManifest().version} </small>
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

  if (id.startsWith("ui-click-button-command-")) {
    command = id.replace("ui-click-button-command-", "");
  } else if (id.startsWith("ui-click-checkbox-")) {
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

  if (id.startsWith("ui-change-select-")) {
    command = id;
    value = e.target.value;
  }

  chrome.runtime.sendMessage({
    type: "changeFromPopup",
    command: command,
    value: value,
  });
});
