import { buildInitialState, resetCacheAsync } from "./settings.js";

/** Read preferences in the current extension page (popup, options, etc.). */
export async function loadInitialState() {
  await resetCacheAsync();
  return buildInitialState();
}
