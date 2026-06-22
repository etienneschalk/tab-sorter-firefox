import { renderPreferencesControls } from "../lib/preferences-render.js";
import { OPEN_SETTINGS_PAGE } from "./constants.js";

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
<div class="command-action">
  <button class="${className}" href="#" id="${"ui_click_button_command_"}${name}">
   ${translate(name)} 
  </button>
  <p class="command-shortcut has-text-centered">${
    shortcut
      ? renderShortcutHint(shortcut)
      : `<small>${translate("no_shortcut_configured")}</small>`
  }</p>
</div>
  `;
}

export function renderPopup(params) {
  const { allCommands, ...preferencesState } = params;

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
            ${renderPreferencesControls(preferencesState)}
            <p class="settings-link">
              <a href="#" id="${OPEN_SETTINGS_PAGE}">${translate("open_settings_page")}</a>
            </p>
        </div>
        <div class="flexcol">
            <h2> 🧹 ${translate("actions")} </h2>
            <br> 
            ${allCommands
              .map((command) => renderCommandActionButton(command))
              .join("")}
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
