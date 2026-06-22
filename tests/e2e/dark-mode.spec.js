import { expect, test } from "./extension.fixture.js";

const SELECT_THEME = "ui_change_select_theme";

test.describe("dark mode popup (issue #16)", () => {
  test("switches between dark and light themes", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/tab-sorter.html`);
    await page.waitForSelector(`#${SELECT_THEME}`);

    await page.selectOption(`#${SELECT_THEME}`, "dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.selectOption(`#${SELECT_THEME}`, "light");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.close();
  });

  test("auto theme follows emulated system preference", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(`chrome-extension://${extensionId}/tab-sorter.html`);
    await page.waitForSelector(`#${SELECT_THEME}`);

    await page.selectOption(`#${SELECT_THEME}`, "auto");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.emulateMedia({ colorScheme: "light" });
    await page.selectOption(`#${SELECT_THEME}`, "light");
    await page.selectOption(`#${SELECT_THEME}`, "auto");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.close();
  });
});
