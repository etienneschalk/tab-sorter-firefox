import { registerPreferencesEventListeners } from "../lib/preferences-events.js";
import { OPEN_SETTINGS_PAGE } from "./constants.js";

export function registerPopupEventListeners(applyTheme) {
  registerPreferencesEventListeners(document, applyTheme);

  document.addEventListener("click", (e) => {
    const id = e.target.id;

    if (id === OPEN_SETTINGS_PAGE) {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
      return;
    }

    if (id.startsWith("ui_click_button_command_")) {
      const command = id.replace("ui_click_button_command_", "");
      chrome.runtime.sendMessage({
        type: "clickFromPopup",
        command,
        value: null,
      });
    }
  });
}
