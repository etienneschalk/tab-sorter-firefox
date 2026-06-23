import { loadInitialState } from "./lib/load-initial-state.js";
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
  try {
    const initialState = await loadInitialState();
    applyTheme(initialState.theme);
    document.body.innerHTML = renderOptionsPage(initialState);
  } catch (error) {
    console.error("[Tab Sorter] Options page failed to load", error);
    document.body.textContent =
      "Tab Sorter settings failed to load. See the browser console.";
  }
})();
