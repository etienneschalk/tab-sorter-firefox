import { test as base, chromium } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const extensionPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../build/chrome-extension",
);

export async function getServiceWorker(context) {
  let [background] = context.serviceWorkers();
  if (!background) {
    background = await context.waitForEvent("serviceworker");
  }
  return background;
}

export async function withExtensionPage(context, extensionId, run) {
  const page = await context.newPage();
  try {
    await page.goto(`chrome-extension://${extensionId}/tab-sorter.html`);
    await page.waitForSelector("#ui_click_button_command_command_sort_tabs_url", {
      timeout: 10_000,
    });
    await run(page);
    await page.waitForTimeout(1500);
  } finally {
    await page.close();
  }
}

export async function runExtensionCommand(context, extensionId, command) {
  await withExtensionPage(context, extensionId, async (page) => {
    await page.click(`#ui_click_button_command_${command}`);
  });
}

export async function setExtensionPreference(
  context,
  extensionId,
  command,
  value,
) {
  await withExtensionPage(context, extensionId, async (page) => {
    const checkbox = page.locator(`#${command}`);
    if (await checkbox.count()) {
      if (value) {
        await checkbox.check();
      } else {
        await checkbox.uncheck();
      }
      return;
    }

    await page.selectOption(`#${command}`, String(value));
  });
}

export async function getHttpTabDomains(context) {
  const background = await getServiceWorker(context);
  return background.evaluate(async () => {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    return tabs
      .filter((tab) => tab.url?.startsWith("http"))
      .map((tab) => new URL(tab.url).hostname.replace(/^www\./, ""));
  });
}

export async function waitForSortedHttpTabs(context, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const domains = await getHttpTabDomains(context);
    const sorted = [...domains].sort((a, b) => a.localeCompare(b));
    if (JSON.stringify(domains) === JSON.stringify(sorted)) {
      return domains;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  const domains = await getHttpTabDomains(context);
  throw new Error(
    `Tabs were not sorted within ${timeoutMs}ms. Last order: ${domains.join(", ")}`,
  );
}

export async function activateTabMatching(context, urlPart) {
  const background = await getServiceWorker(context);
  await background.evaluate(async (needle) => {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const match = tabs.find((tab) => tab.url?.includes(needle));
    if (match) {
      await chrome.tabs.update(match.id, { active: true });
    }
  }, urlPart);
}

export const test = base.extend({
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext("", {
      channel: "chromium",
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });

    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    const background = await getServiceWorker(context);
    const extensionId = background.url().split("/")[2];
    await use(extensionId);
  },
});

export { expect } from "@playwright/test";
