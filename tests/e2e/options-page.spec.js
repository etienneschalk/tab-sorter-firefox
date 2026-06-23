import { expect, test } from "./extension.fixture.js";

const CHECKBOX_REVERSE = "ui_click_checkbox_sort_tabs_reverse";

test.describe("settings page (issue #7)", () => {
  test("loads preferences and persists changes to storage", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    try {
      await page.goto(`chrome-extension://${extensionId}/options.html`);
      await page.waitForSelector(`#${CHECKBOX_REVERSE}`, { timeout: 10_000 });

      const wasChecked = await page.isChecked(`#${CHECKBOX_REVERSE}`);
      if (wasChecked) {
        await page.uncheck(`#${CHECKBOX_REVERSE}`);
      } else {
        await page.check(`#${CHECKBOX_REVERSE}`);
      }

      await page.waitForTimeout(500);

      const background = context.serviceWorkers()[0];
      const stored = await background.evaluate(async () => {
        const result = await chrome.storage.sync.get(
          "TAB_SORTER_STORAGE_KEY_REVERSE",
        );
        return result.TAB_SORTER_STORAGE_KEY_REVERSE;
      });

      expect(stored).toBe(!wasChecked);
    } finally {
      await page.close();
    }
  });
});
