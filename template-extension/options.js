import { applyDocumentLocale } from "./lib/locale-logic.js";
import { registerPreferencesEventListeners } from "./lib/preferences-events.js";
import { renderOptionsPage } from "./lib/preferences-render.js";
import { applyTheme as applyThemeToDocument } from "./lib/theme-logic.js";

function applyTheme(theme) {
  applyThemeToDocument(theme, document);
}

registerPreferencesEventListeners(document, applyTheme);

applyDocumentLocale(document);

(async () => {
  const initialState = await chrome.runtime.sendMessage("queryInitialState");
  applyTheme(initialState.theme);
  document.body.innerHTML = renderOptionsPage(initialState);
})();
