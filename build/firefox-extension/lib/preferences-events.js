import { SELECT_THEME } from "./ui-constants.js";

export function sendPreferenceUpdate(command, value) {
  return chrome.runtime.sendMessage({
    type: "preferenceUpdate",
    command,
    value,
  });
}

export function registerPreferencesEventListeners(root, applyTheme) {
  root.addEventListener("click", (e) => {
    const id = e.target.id;
    if (!id.startsWith("ui_click_checkbox_")) {
      return;
    }
    sendPreferenceUpdate(id, e.target.checked);
  });

  root.addEventListener("change", (e) => {
    const id = e.target.id;
    if (!id.startsWith("ui_change_select_")) {
      return;
    }

    const value = e.target.value;
    if (id === SELECT_THEME && applyTheme) {
      applyTheme(value);
    }
    sendPreferenceUpdate(id, value);
  });
}
