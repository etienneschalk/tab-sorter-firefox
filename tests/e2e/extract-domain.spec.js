import {
  expect,
  getServiceWorker,
  test,
  withExtensionPage,
} from "./extension.fixture.js";

test.describe("extract domain", () => {
  test("moves same-domain tabs into a new window", async ({
    context,
    extensionId,
  }) => {
    const github = await context.newPage();
    await github.goto("https://github.com");
    const githubExplore = await context.newPage();
    await githubExplore.goto("https://github.com/explore");
    const google = await context.newPage();
    await google.goto("https://google.com");

    await withExtensionPage(context, extensionId, async (page) => {
      await page.evaluate(async () => {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        const githubTab = tabs.find((tab) =>
          tab.url?.includes("github.com/explore"),
        );
        if (githubTab) {
          await chrome.tabs.update(githubTab.id, { active: true });
        }
      });
      await page.click("#ui_click_button_command_command_extract_domain");
    });

    const background = await getServiceWorker(context);
    const windows = await background.evaluate(async () => {
      const allWindows = await chrome.windows.getAll({ populate: true });
      return allWindows.map((window) => ({
        tabUrls: window.tabs.map((tab) => tab.url),
      }));
    });

    expect(windows.length).toBeGreaterThanOrEqual(2);

    const githubWindow = windows.find(
      (window) =>
        window.tabUrls.length >= 2 &&
        window.tabUrls.every((url) => url.includes("github.com")),
    );
    const googleWindow = windows.find((window) =>
      window.tabUrls.some((url) => url.includes("google.com")),
    );

    expect(githubWindow).toBeTruthy();
    expect(googleWindow).toBeTruthy();

    await github.close();
    await githubExplore.close();
    await google.close();
  });
});
