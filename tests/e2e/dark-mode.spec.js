import { expect, test, withExtensionPage } from "./extension.fixture.js";

const SELECT_THEME = "ui_change_select_theme";

test.describe("dark mode popup (issue #16)", () => {
  test("switches between dark and light themes", async ({
    context,
    extensionId,
  }) => {
    await withExtensionPage(context, extensionId, async (page) => {
      await page.selectOption(`#${SELECT_THEME}`, "dark");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

      await page.selectOption(`#${SELECT_THEME}`, "light");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    });
  });

  test("auto theme follows emulated system preference", async ({
    context,
    extensionId,
  }) => {
    await withExtensionPage(context, extensionId, async (page) => {
      await page.emulateMedia({ colorScheme: "dark" });
      await page.selectOption(`#${SELECT_THEME}`, "auto");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

      await page.emulateMedia({ colorScheme: "light" });
      await page.selectOption(`#${SELECT_THEME}`, "light");
      await page.selectOption(`#${SELECT_THEME}`, "auto");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    });
  });
});
