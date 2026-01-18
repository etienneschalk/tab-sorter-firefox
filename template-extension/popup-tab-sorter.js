// chrome.runtime.sendMessage("queryInitialState", (initialState) => {
//   console.log("Received initial state", initialState);
//   initializeUserInterface(initialState);
// });

(async () => {
  const initialState = await chrome.runtime.sendMessage("queryInitialState");
  console.debug("== After await chrome.runtime.sendMessage");
  initializeUserInterface(initialState);
})();

function initializeUserInterface(initialState) {
  const {
    isReverse,
    isAllWindows,
    isAutoOnNewTab,
    defaultSortMethod,
    isRespectTabGroups,
    isReorderTabGroups,
    isGroupSuspendedTabs,
    isSortPinnedTabs,
    isTabGroupsApiAvailable,
    availableSortMethods,
    allCommands,
  } = initialState;

  const logPrefix = "[Tab Sorter] Initial State: ";
  console.log(logPrefix + "isReverse", isReverse);
  console.log(logPrefix + "isAllWindows", isAllWindows);
  console.log(logPrefix + "isAutoOnNewTab", isAutoOnNewTab);
  console.log(logPrefix + "defaultSortMethod", defaultSortMethod);
  console.log(logPrefix + "isRespectTabGroups", isRespectTabGroups);
  console.log(logPrefix + "isReorderTabGroups", isReorderTabGroups);
  console.log(logPrefix + "isGroupSuspendedTabs", isGroupSuspendedTabs);
  console.log(logPrefix + "isSortPinnedTabs", isSortPinnedTabs);
  console.log(logPrefix + "isTabGroupsApiAvailable", isTabGroupsApiAvailable);
  console.log(logPrefix + "availableSortMethods", availableSortMethods);

  logCommands(allCommands);

  const commandDisplayPriority = {
    command_sort_tabs_favicon_and_title: 1,
    command_sort_tabs_title: 2,
    command_sort_tabs_url: 3,
    command_sort_tabs_mru: 4,
    command_sort_tabs_shuffle: 5,
    command_extract_domain: 6,
  };

  const popupHtmlString = renderPopup({
    isReverse,
    isAllWindows,
    isAutoOnNewTab,
    defaultSortMethod,
    isRespectTabGroups,
    isReorderTabGroups,
    isGroupSuspendedTabs,
    isSortPinnedTabs,
    isTabGroupsApiAvailable,
    availableSortMethods,
    allCommands: allCommands
      .filter((command) => command.name.startsWith("command_sort_tabs") || command.name === "command_extract_domain")
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
const CHECKBOX_AUTO_ON_NEW_TAB = "ui_click_checkbox_sort_tabs_auto_best_effort";
const CHECKBOX_RESPECT_TAB_GROUPS = "ui_click_checkbox_sort_tabs_respect_tab_groups";
const CHECKBOX_REORDER_TAB_GROUPS = "ui_click_checkbox_sort_tabs_reorder_tab_groups";
const CHECKBOX_GROUP_SUSPENDED = "ui_click_checkbox_sort_tabs_group_suspended";
const CHECKBOX_SORT_PINNED = "ui_click_checkbox_sort_tabs_pinned";
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

  console.log(command);

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

function renderCheckboxWithDisabled(id, initialValue, disabled, disabledMessage) {
  if (disabled) {
    return `
<label for=${id} class="disabled-checkbox">
  <input type="checkbox" id=${id} disabled />
   ${translate(id)} 
  <br><small class="warning-text">${translate(disabledMessage)}</small>
</label>
    `;
  }
  return renderCheckbox(id, initialValue);
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
    isRespectTabGroups,
    isReorderTabGroups,
    isGroupSuspendedTabs,
    isSortPinnedTabs,
    isTabGroupsApiAvailable,
    availableSortMethods,
    allCommands,
  } = params;

  // Reorder groups checkbox is only enabled when respect tab groups is enabled
  const isReorderDisabled = !isTabGroupsApiAvailable || !isRespectTabGroups;

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
            ${renderCheckbox(CHECKBOX_GROUP_SUSPENDED, isGroupSuspendedTabs)}
            ${renderCheckbox(CHECKBOX_SORT_PINNED, isSortPinnedTabs)}
            <br> 
            <h3> ${translate("preferences_tab_groups")}</h3>
            ${renderCheckboxWithDisabled(
              CHECKBOX_RESPECT_TAB_GROUPS,
              isRespectTabGroups,
              !isTabGroupsApiAvailable,
              "tab_groups_not_supported"
            )}
            <div class="sub-checkbox">
            ${renderCheckboxWithDisabled(
              CHECKBOX_REORDER_TAB_GROUPS,
              isReorderTabGroups,
              isReorderDisabled,
              isTabGroupsApiAvailable ? "reorder_groups_requires_respect" : "tab_groups_not_supported"
            )}
            </div>
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
        <small> Tab Sorter - v${chrome.runtime.getManifest().version} </small>
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
