export const TAB_SORTER_PREFIX = "[Tab Sorter]";

export const AVAILABLE_SORT_METHODS = [
  "sort_tabs_mru",
  "sort_tabs_url",
  "sort_tabs_title",
  "sort_tabs_favicon_and_title",
];

export const STORAGE_KEY_REVERSE = "TAB_SORTER_STORAGE_KEY_REVERSE";
export const STORAGE_DEFAULT_VALUE_REVERSE = false;
export const STORAGE_KEY_SORT_ALL_WINDOWS =
  "TAB_SORTER_STORAGE_KEY_SORT_ALL_WINDOWS";
export const STORAGE_DEFAULT_VALUE_SORT_ALL_WINDOWS = false;
export const STORAGE_KEY_AUTO_SORT_BEST_EFFORT =
  "TAB_SORTER_STORAGE_KEY_AUTO_SORT_BEST_EFFORT";
export const STORAGE_DEFAULT_VALUE_AUTO_SORT_ON_NEW_TAB = false;
export const STORAGE_KEY_DEFAULT_SORT_METHOD =
  "TAB_SORTER_STORAGE_KEY_DEFAULT_SORT_METHOD";
export const STORAGE_DEFAULT_VALUE_DEFAULT_SORT_METHOD = "sort_tabs_mru";
export const STORAGE_KEY_RESPECT_TAB_GROUPS =
  "TAB_SORTER_STORAGE_KEY_RESPECT_TAB_GROUPS";
export const STORAGE_DEFAULT_VALUE_RESPECT_TAB_GROUPS = true;
export const STORAGE_KEY_SUSPENDED_TABS_POSITION =
  "TAB_SORTER_STORAGE_KEY_SUSPENDED_TABS_POSITION";
export const STORAGE_DEFAULT_VALUE_SUSPENDED_TABS_POSITION = "ignore";
export const AVAILABLE_SUSPENDED_TABS_POSITIONS = [
  "ignore",
  "end",
  "beginning",
];
export const STORAGE_KEY_SORT_PINNED_TABS =
  "TAB_SORTER_STORAGE_KEY_SORT_PINNED_TABS";
export const STORAGE_DEFAULT_VALUE_SORT_PINNED_TABS = false;
export const STORAGE_KEY_THEME = "TAB_SORTER_STORAGE_KEY_THEME";
export const STORAGE_DEFAULT_VALUE_THEME = "auto";
export const STORAGE_KEY_CLOSE_DUPLICATE_TABS =
  "TAB_SORTER_STORAGE_KEY_CLOSE_DUPLICATE_TABS";
export const STORAGE_DEFAULT_VALUE_CLOSE_DUPLICATE_TABS = false;

export const CACHE_KEY_ALL_COMMANDS = "CACHE_KEY_ALL_COMMANDS";

export const TAB_GROUPS_API_AVAILABLE =
  typeof chrome.tabGroups !== "undefined";

const CACHED_STATE = {};

export async function getReverseAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_REVERSE,
    STORAGE_DEFAULT_VALUE_REVERSE,
  );
}

export async function getAllWindowsAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_SORT_ALL_WINDOWS,
    STORAGE_DEFAULT_VALUE_SORT_ALL_WINDOWS,
  );
}

export async function getAutoOnNewTabAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_AUTO_SORT_BEST_EFFORT,
    STORAGE_DEFAULT_VALUE_AUTO_SORT_ON_NEW_TAB,
  );
}

export async function getDefaultSortMethodAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_DEFAULT_SORT_METHOD,
    STORAGE_DEFAULT_VALUE_DEFAULT_SORT_METHOD,
  );
}

export async function getRespectTabGroupsAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_RESPECT_TAB_GROUPS,
    STORAGE_DEFAULT_VALUE_RESPECT_TAB_GROUPS,
  );
}

export async function getSuspendedTabsPositionAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_SUSPENDED_TABS_POSITION,
    STORAGE_DEFAULT_VALUE_SUSPENDED_TABS_POSITION,
  );
}

export async function getSortPinnedTabsAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_SORT_PINNED_TABS,
    STORAGE_DEFAULT_VALUE_SORT_PINNED_TABS,
  );
}

export async function getThemeAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_THEME,
    STORAGE_DEFAULT_VALUE_THEME,
  );
}

export async function getCloseDuplicateTabsAsync() {
  return await retrieveFromStorage(
    STORAGE_KEY_CLOSE_DUPLICATE_TABS,
    STORAGE_DEFAULT_VALUE_CLOSE_DUPLICATE_TABS,
  );
}

export async function getAllCommandsFromManifest() {
  const allCommands = await chrome.commands.getAll();
  CACHED_STATE[CACHE_KEY_ALL_COMMANDS] = allCommands;
  return allCommands;
}

export function getAvailableSortMethodsSync() {
  return AVAILABLE_SORT_METHODS;
}

export async function resetCacheAsync() {
  await getReverseAsync();
  await getAllWindowsAsync();
  await getAutoOnNewTabAsync();
  await getDefaultSortMethodAsync();
  await getRespectTabGroupsAsync();
  await getSuspendedTabsPositionAsync();
  await getSortPinnedTabsAsync();
  await getThemeAsync();
  await getCloseDuplicateTabsAsync();
  await getAllCommandsFromManifest();
}

export function getReverseCached() {
  console.debug("getReverseCached 1");
  const value = CACHED_STATE[STORAGE_KEY_REVERSE];
  console.debug("getReverseCached 2", `${value}`);
  return value;
}

export function getAllWindowsCached() {
  console.debug("getAllWindowsCached 1");
  const value = CACHED_STATE[STORAGE_KEY_SORT_ALL_WINDOWS];
  console.debug("getAllWindowsCached 2", `${value}`);
  return value;
}

export function getAutoOnNewTabCached() {
  console.debug("getAutoOnNewTabCached 1");
  const value = CACHED_STATE[STORAGE_KEY_AUTO_SORT_BEST_EFFORT];
  console.debug("getAutoOnNewTabCached 2", `${value}`);
  return value;
}

export function getDefaultSortMethodCached() {
  console.debug("getDefaultSortMethodCached 1");
  const value = CACHED_STATE[STORAGE_KEY_DEFAULT_SORT_METHOD];
  console.debug("getDefaultSortMethodCached 2", `${value}`);
  return value;
}

export function getRespectTabGroupsCached() {
  console.debug("getRespectTabGroupsCached 1");
  const value = CACHED_STATE[STORAGE_KEY_RESPECT_TAB_GROUPS];
  console.debug("getRespectTabGroupsCached 2", `${value}`);
  return value;
}

export function getSuspendedTabsPositionCached() {
  console.debug("getSuspendedTabsPositionCached 1");
  const value = CACHED_STATE[STORAGE_KEY_SUSPENDED_TABS_POSITION];
  console.debug("getSuspendedTabsPositionCached 2", `${value}`);
  return value;
}

export function getSortPinnedTabsCached() {
  console.debug("getSortPinnedTabsCached 1");
  const value = CACHED_STATE[STORAGE_KEY_SORT_PINNED_TABS];
  console.debug("getSortPinnedTabsCached 2", `${value}`);
  return value;
}

export function getThemeCached() {
  console.debug("getThemeCached 1");
  const value = CACHED_STATE[STORAGE_KEY_THEME];
  console.debug("getThemeCached 2", `${value}`);
  return value;
}

export function getCloseDuplicateTabsCached() {
  return CACHED_STATE[STORAGE_KEY_CLOSE_DUPLICATE_TABS];
}

export function setReverse(choice) {
  persistInStorage(STORAGE_KEY_REVERSE, choice);
}

export function setAllWindows(choice) {
  persistInStorage(STORAGE_KEY_SORT_ALL_WINDOWS, choice);
}

export function setAutoSortBestEffort(choice) {
  persistInStorage(STORAGE_KEY_AUTO_SORT_BEST_EFFORT, choice);
}

export function setDefaultSortMethod(choice) {
  persistInStorage(STORAGE_KEY_DEFAULT_SORT_METHOD, choice);
}

export function setRespectTabGroups(choice) {
  persistInStorage(STORAGE_KEY_RESPECT_TAB_GROUPS, choice);
}

export function setSuspendedTabsPosition(choice) {
  persistInStorage(STORAGE_KEY_SUSPENDED_TABS_POSITION, choice);
}

export function setSortPinnedTabs(choice) {
  persistInStorage(STORAGE_KEY_SORT_PINNED_TABS, choice);
}

export function setTheme(choice) {
  persistInStorage(STORAGE_KEY_THEME, choice);
}

export function setCloseDuplicateTabs(choice) {
  persistInStorage(STORAGE_KEY_CLOSE_DUPLICATE_TABS, choice);
}

export function buildInitialState() {
  return {
    isReverse: CACHED_STATE[STORAGE_KEY_REVERSE],
    isAllWindows: CACHED_STATE[STORAGE_KEY_SORT_ALL_WINDOWS],
    isAutoOnNewTab: CACHED_STATE[STORAGE_KEY_AUTO_SORT_BEST_EFFORT],
    defaultSortMethod: CACHED_STATE[STORAGE_KEY_DEFAULT_SORT_METHOD],
    isRespectTabGroups: CACHED_STATE[STORAGE_KEY_RESPECT_TAB_GROUPS],
    suspendedTabsPosition: CACHED_STATE[STORAGE_KEY_SUSPENDED_TABS_POSITION],
    availableSuspendedTabsPositions: AVAILABLE_SUSPENDED_TABS_POSITIONS,
    isSortPinnedTabs: CACHED_STATE[STORAGE_KEY_SORT_PINNED_TABS],
    theme: CACHED_STATE[STORAGE_KEY_THEME],
    isTabGroupsApiAvailable: TAB_GROUPS_API_AVAILABLE,
    isCloseDuplicateTabs: CACHED_STATE[STORAGE_KEY_CLOSE_DUPLICATE_TABS],
    availableSortMethods: AVAILABLE_SORT_METHODS,
    allCommands: CACHED_STATE[CACHE_KEY_ALL_COMMANDS],
  };
}

async function retrieveFromStorage(key, default_value) {
  console.debug(key);

  const key_value_obj = await chrome.storage.sync.get(key);
  console.debug(key_value_obj);

  const actual_value =
    key_value_obj === undefined || !(key in key_value_obj)
      ? default_value
      : key_value_obj[key];
  CACHED_STATE[key] = actual_value;
  return actual_value;
}

function persistInStorage(key, value) {
  const payload = {
    [key]: value,
  };

  const log_prefix = `${TAB_SORTER_PREFIX} (persistInStorage):`;

  console.debug(`${log_prefix} ${key}=${value}`);

  function onSuccess(item) {
    console.debug(`${log_prefix} ${item}`);
    CACHED_STATE[key] = value;
  }
  function onError(error) {
    console.error(`${log_prefix} ${error}`);
  }
  chrome.storage.sync.set(payload).then(onSuccess, onError);
}
