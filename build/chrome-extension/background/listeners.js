import {
  TAB_SORTER_PREFIX,
  buildInitialState,
  getAutoOnNewTabCached,
  getDefaultSortMethodCached,
  resetCacheAsync,
  setAllWindows,
  setAutoSortBestEffort,
  setCloseDuplicateTabs,
  setDefaultSortMethod,
  setRespectTabGroups,
  setReverse,
  setSortPinnedTabs,
  setSuspendedTabsPosition,
  setTheme,
} from "../lib/settings.js";
import { extractDomainTabs } from "./extract-domain.js";
import { sortTabs } from "./sort-tabs.js";

export function addEventListeners() {
  chrome.runtime.onMessage.addListener((message, sender, sendMessage) => {
    if (message === "queryInitialState") {
      console.debug("Start queryInitialState handler");
      (async () => {
        await resetCacheAsync();
        sendMessage(buildInitialState());
      })();
      return true;
    }
  });

  chrome.commands.onCommand.addListener((command) => {
    console.debug(`${TAB_SORTER_PREFIX} Command event received: ${command}`);
    commandEventListener(command);
  });

  chrome.runtime.onMessage.addListener((message) => {
    console.debug(
      `${TAB_SORTER_PREFIX} Message event received: ${message.command} with value=${message.value}`,
    );
    commandEventListener(message.command);
    stateUpdateEventListener(message.command, message.value);
  });

  chrome.tabs.onCreated.addListener((tab) => {
    if (!getAutoOnNewTabCached()) {
      return;
    }
    const sortMethod = getDefaultSortMethodCached();
    if (sortMethod != "sort_tabs_mru") {
      return;
    }
    console.debug(
      `New tab created, sorting as soon as possible. ${tab.lastAccessed}`,
    );
    sortTabs(sortMethod);
  });

  chrome.tabs.onActivated.addListener((tab) => {
    if (!getAutoOnNewTabCached()) {
      return;
    }
    const sortMethod = getDefaultSortMethodCached();
    if (sortMethod != "sort_tabs_mru") {
      return;
    }
    console.debug("Tab activated, sorting as soon as possible");
    console.debug(tab.lastAccessed);

    setTimeout(() => {
      sortTabs(sortMethod);
    }, 100);
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.debug(
      `${TAB_SORTER_PREFIX} Tab updated: ${tabId} ${changeInfo.status} ${changeInfo.title} ${changeInfo.url}...`,
    );
    console.debug(changeInfo);
    console.debug(tab);

    if (!getAutoOnNewTabCached()) {
      return;
    }

    const sortMethod = getDefaultSortMethodCached();

    if (changeInfo.url && sortMethod === "sort_tabs_url") {
      console.debug(
        `URL changed and sort method is ${sortMethod}, sorting as soon as possible. ${changeInfo.url}`,
      );
      sortTabs(sortMethod);
    } else if (changeInfo.title && sortMethod === "sort_tabs_title") {
      console.debug(
        `Title changed and sort method is ${sortMethod}, sorting as soon as possible. ${changeInfo.title}`,
      );
      sortTabs(sortMethod);
    } else if (
      changeInfo.title &&
      tab.favIconUrl &&
      sortMethod === "sort_tabs_favicon_and_title"
    ) {
      console.debug(
        `Title changed and sort method is ${sortMethod}, sorting as soon as possible. ${changeInfo.title} ${tab.favIconUrl}`,
      );
      sortTabs(sortMethod);
    } else if (
      changeInfo.favIconUrl &&
      tab.title &&
      sortMethod === "sort_tabs_favicon_and_title"
    ) {
      console.debug(
        `Favicon changed and sort method is ${sortMethod}, sorting as soon as possible. ${changeInfo.favIconUrl} ${tab.title}`,
      );
      sortTabs(sortMethod);
    }
  });
}

function commandEventListener(command) {
  switch (command) {
    case "command_sort_tabs_url":
      sortTabs("sort_tabs_url");
      break;
    case "command_sort_tabs_mru":
      sortTabs("sort_tabs_mru");
      break;
    case "command_sort_tabs_title":
      sortTabs("sort_tabs_title");
      break;
    case "command_sort_tabs_favicon_and_title":
      sortTabs("sort_tabs_favicon_and_title");
      break;
    case "command_sort_tabs_shuffle":
      sortTabs("sort_tabs_mru", true);
      break;
    case "command_extract_domain":
      extractDomainTabs();
      break;
    default:
  }
}

function stateUpdateEventListener(command, value) {
  if (command === "ui_click_checkbox_sort_tabs_reverse") {
    setReverse(value);
  } else if (command === "ui_click_checkbox_sort_tabs_all_windows") {
    setAllWindows(value);
  } else if (command === "ui_click_checkbox_sort_tabs_auto_best_effort") {
    setAutoSortBestEffort(value);
  } else if (command === "ui_click_checkbox_sort_tabs_respect_tab_groups") {
    setRespectTabGroups(value);
  } else if (command === "ui_change_select_suspended_tabs_position") {
    setSuspendedTabsPosition(value);
  } else if (command === "ui_click_checkbox_sort_tabs_pinned") {
    setSortPinnedTabs(value);
  } else if (
    command === "ui_change_select_sort_select_tabs_default_sort_method"
  ) {
    setDefaultSortMethod(value);
  } else if (command === "ui_change_select_theme") {
    setTheme(value);
  } else if (command === "ui_click_checkbox_sort_tabs_close_duplicates") {
    setCloseDuplicateTabs(value);
  }
}
