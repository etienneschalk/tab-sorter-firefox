import { SELECT_THEME } from "./constants.js";

export function registerPopupEventListeners(applyTheme) {
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

  document.addEventListener("change", (e) => {
    const id = e.target.id;

    let command = null;
    let value = null;

    if (id.startsWith("ui_change_select_")) {
      command = id;
      value = e.target.value;

      if (id === SELECT_THEME) {
        applyTheme(value);
      }
    }

    chrome.runtime.sendMessage({
      type: "changeFromPopup",
      command: command,
      value: value,
    });
  });
}
