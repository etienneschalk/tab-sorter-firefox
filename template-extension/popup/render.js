import { AVAILABLE_THEMES } from "../lib/theme-logic.js";
import {
  CHECKBOX_ALL_WINDOWS,
  CHECKBOX_AUTO_ON_NEW_TAB,
  CHECKBOX_CLOSE_DUPLICATES,
  CHECKBOX_RESPECT_TAB_GROUPS,
  CHECKBOX_REVERSE,
  CHECKBOX_SORT_PINNED,
  SELECT_DEFAULT_SORT_METHOD,
  SELECT_SUSPENDED_TABS_POSITION,
  SELECT_THEME,
} from "./constants.js";

function translate(message) {
  return chrome.i18n.getMessage(message);
}

export function logCommands(commands) {
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

function renderThemeOption(themeValue, selectedTheme) {
  return `
<option value="${themeValue}" ${themeValue === selectedTheme ? "selected" : ""}>
    ${translate(`theme_${themeValue}`)}
</option>
  `;
}

function renderSuspendedTabsPositionOption(positionValue, selectedPosition) {
  return `
<option value="${positionValue}" ${positionValue === selectedPosition ? "selected" : ""}>
    ${translate(`suspended_tabs_position_${positionValue}`)}
</option>
  `;
}

export function renderPopup(params) {
  const {
    isReverse,
    isAllWindows,
    isAutoOnNewTab,
    isCloseDuplicateTabs,
    defaultSortMethod,
    isRespectTabGroups,
    suspendedTabsPosition,
    availableSuspendedTabsPositions,
    isSortPinnedTabs,
    theme,
    isTabGroupsApiAvailable,
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
            <h3> ⭐ ${translate("preferences_general")}</h3>
            ${renderCheckbox(CHECKBOX_REVERSE, isReverse)}
            ${renderCheckbox(CHECKBOX_ALL_WINDOWS, isAllWindows)}
            ${renderCheckbox(CHECKBOX_SORT_PINNED, isSortPinnedTabs)}
            ${renderCheckbox(CHECKBOX_CLOSE_DUPLICATES, isCloseDuplicateTabs)}
            <br>
            <h3> 💤 ${translate("preferences_suspended_tabs")}</h3>
            <div class="suspended-tabs-selector">
              <label for="${SELECT_SUSPENDED_TABS_POSITION}">${translate("suspended_tabs_position_label")}</label>
              <select id="${SELECT_SUSPENDED_TABS_POSITION}">
                ${availableSuspendedTabsPositions.map((p) => renderSuspendedTabsPositionOption(p, suspendedTabsPosition)).join("")}
              </select>
            </div>
            <br> 
            <h3> 📁 ${translate("preferences_tab_groups")}</h3>
            ${renderCheckboxWithDisabled(
              CHECKBOX_RESPECT_TAB_GROUPS,
              isRespectTabGroups,
              !isTabGroupsApiAvailable,
              "tab_groups_not_supported"
            )}
            <br> 
            <h3> 🤖 ${translate("preferences_auto")}</h3>
            ${renderCheckbox(CHECKBOX_AUTO_ON_NEW_TAB, isAutoOnNewTab)}
            <br>
            ${renderSelect(
              SELECT_DEFAULT_SORT_METHOD,
              availableSortMethods,
              defaultSortMethod
            )}
            <br>
            <br>
            <h3> 🎨 ${translate("preferences_appearance")}</h3>
            <div class="theme-selector">
              <label for="${SELECT_THEME}">${translate("theme_label")}</label>
              <select id="${SELECT_THEME}">
                ${AVAILABLE_THEMES.map((t) => renderThemeOption(t, theme)).join("")}
              </select>
            </div>
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

export function mountPopup(initialState, allCommands) {
  const popupHtmlString = renderPopup({
    ...initialState,
    allCommands,
  });

  const container = new DOMParser()
    .parseFromString(popupHtmlString, "text/html")
    .getElementById("container");
  document.getElementById("container").innerHTML = "";
  document.getElementById("container").appendChild(container);
}
