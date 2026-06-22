import { extractDomain } from "../lib/sort-logic.js";
import {
  TAB_SORTER_PREFIX,
  getAutoOnNewTabCached,
  getDefaultSortMethodCached,
} from "../lib/settings.js";
import { sortTabs } from "./sort-tabs.js";

export async function extractDomainTabs() {
  const log_prefix = `${TAB_SORTER_PREFIX} (extractDomainTabs):`;

  try {
    console.log(`${log_prefix} Starting domain extraction...`);

    console.log(`${log_prefix} Chrome APIs available:`, {
      windows: !!chrome.windows,
      tabs: !!chrome.tabs,
      runtime: !!chrome.runtime,
    });

    const manifest = chrome.runtime.getManifest();
    console.log(`${log_prefix} Manifest permissions:`, manifest.permissions);

    const [currentTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    console.log(`${log_prefix} Current tab:`, currentTab);

    if (!currentTab) {
      console.error(`${log_prefix} No active tab found`);
      return;
    }

    const currentDomain = extractDomain(currentTab.url);
    console.log(
      `${log_prefix} Extracted domain: ${currentDomain} from URL: ${currentTab.url}`,
    );

    if (!currentDomain) {
      console.error(
        `${log_prefix} Could not extract domain from current tab URL: ${currentTab.url}`,
      );
      return;
    }

    const allTabs = await chrome.tabs.query({});
    console.log(`${log_prefix} Total tabs found: ${allTabs.length}`);

    const matchingTabs = allTabs.filter((tab) => {
      const tabDomain = extractDomain(tab.url);
      const isMatch = tabDomain === currentDomain;
      if (isMatch) {
        console.log(
          `${log_prefix} Found matching tab: ${tab.id} (domain: ${tabDomain}) - ${tab.url} `,
        );
      }
      return isMatch;
    });

    console.log(`${log_prefix} Matching tabs count: ${matchingTabs.length}`);

    if (matchingTabs.length === 0) {
      console.log(
        `${log_prefix} No other tabs found for domain: ${currentDomain}. No extraction needed.`,
      );
      return;
    }

    const currentWindowTabs = await chrome.tabs.query({ currentWindow: true });
    console.log(
      `${log_prefix} Current window tabs count: ${currentWindowTabs.length}`,
    );

    const otherWindowsTabs = allTabs.filter(
      (tab) =>
        !currentWindowTabs.some((currentTab) => currentTab.id === tab.id),
    );
    console.log(
      `${log_prefix} Other windows tabs count: ${otherWindowsTabs.length}`,
    );

    const otherWindowsMatchingTabs = otherWindowsTabs.filter((tab) => {
      const tabDomain = extractDomain(tab.url);
      return tabDomain === currentDomain;
    });

    console.log(
      `${log_prefix} Other windows matching tabs count: ${otherWindowsMatchingTabs.length}`,
    );

    const currentWindowOtherDomains = currentWindowTabs.filter((tab) => {
      const tabDomain = extractDomain(tab.url);
      return tabDomain !== currentDomain;
    });

    console.log(
      `${log_prefix} Current window tabs with other domains: ${currentWindowOtherDomains.length}`,
    );

    if (
      currentWindowOtherDomains.length === 0 &&
      otherWindowsMatchingTabs.length === 0
    ) {
      console.log(
        `${log_prefix} Current window already contains all tabs of domain ${currentDomain} and no other windows have this domain. No extraction needed.`,
      );
      return;
    }

    console.log(
      `${log_prefix} About to create new window with tabId: ${currentTab.id}`,
    );

    const newWindow = await chrome.windows.create({
      tabId: currentTab.id,
      focused: true,
      type: "normal",
    });

    console.log(`${log_prefix} New window created:`, newWindow);

    if (chrome.runtime.lastError) {
      console.error(
        `${log_prefix} Chrome runtime error after window creation:`,
        chrome.runtime.lastError,
      );
      return;
    }

    if (matchingTabs.length > 0) {
      const tabIds = matchingTabs.map((tab) => tab.id);
      console.log(
        `${log_prefix} Moving ${tabIds.length} tabs to new window:`,
        tabIds,
      );

      await chrome.tabs.move(tabIds, {
        windowId: newWindow.id,
        index: 1,
      });

      if (chrome.runtime.lastError) {
        console.error(
          `${log_prefix} Chrome runtime error after moving tabs:`,
          chrome.runtime.lastError,
        );
        return;
      }

      console.log(`${log_prefix} Successfully moved tabs to new window`);
    }

    console.log(`${log_prefix} Domain extraction completed successfully`);

    if (getAutoOnNewTabCached()) {
      console.log(
        `${log_prefix} Auto-sort is enabled, performing sort after extraction`,
      );
      const defaultSortMethod = getDefaultSortMethodCached();
      console.log(
        `${log_prefix} Using default sort method: ${defaultSortMethod}`,
      );

      chrome.tabs.query({ windowId: newWindow.id }, (tabs) => {
        if (tabs && tabs.length > 0) {
          console.log(
            `${log_prefix} Sorting ${tabs.length} tabs in the new window`,
          );
          sortTabs(defaultSortMethod);
        }
      });
    }
  } catch (error) {
    console.error(`${log_prefix} Error during domain extraction:`, error);
    console.error(`${log_prefix} Error stack:`, error.stack);

    if (chrome.runtime.lastError) {
      console.error(
        `${log_prefix} Chrome runtime error:`,
        chrome.runtime.lastError,
      );
    }
  }
}
