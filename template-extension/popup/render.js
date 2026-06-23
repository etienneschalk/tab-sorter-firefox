import { replaceHtmlContent } from "../lib/replace-html-content.js";
import { renderPreferencesControls } from "../lib/preferences-render.js";
import { OPEN_SETTINGS_PAGE } from "./constants.js";
import { renderHelpSection } from "./help-render.js";

function translate(message) {
  return chrome.i18n.getMessage(message);
}

export function logCommands(commands) {
  if (!commands) {
    return;
  }

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
    <div class="">
        <h1>  🗂️ ${translate("extensionName")} v${chrome.runtime.getManifest().version}  </h1>
    </div>
    <div class="flexcontainer">
        <div class="flexcol">
            <h2>❓ ${translate("help")} </h2>
            ${renderHelpSection()}
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
  `;
}

export function mountPopup(initialState, allCommands) {
  const container = document.getElementById("container");
  if (!container) {
    throw new Error("[Tab Sorter] Popup container element is missing");
  }

  replaceHtmlContent(
    container,
    renderPopup({
      ...initialState,
      allCommands,
    }),
  );
}
