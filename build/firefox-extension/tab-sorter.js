import { addEventListeners } from "./background/listeners.js";
import { resetCacheAsync } from "./lib/settings.js";

function initTabSorter() {
  // Warm the cache in the background; listeners must register immediately so the
  // popup's queryInitialState message is not lost on a cold service worker start.
  resetCacheAsync();
  addEventListeners();
}

initTabSorter();
