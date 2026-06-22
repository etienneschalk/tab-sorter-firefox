import {
  expect,
  getServiceWorker,
  runExtensionCommand,
  setExtensionPreference,
  test,
  waitForSortedHttpTabs,
} from "./extension.fixture.js";

test.describe("pinned tab sorting (issue #9)", () => {
  test("sorts pinned tabs when the option is enabled", async ({
    context,
    extensionId,
  }) => {
    const youtube = await context.newPage();
    await youtube.goto("https://youtube.com");
    const github = await context.newPage();
    await github.goto("https://github.com");
    const amazon = await context.newPage();
    await amazon.goto("https://amazon.com");

    const background = await getServiceWorker(context);
    await background.evaluate(async () => {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      for (const tab of tabs) {
        if (tab.url?.startsWith("http")) {
          await chrome.tabs.update(tab.id, { pinned: true });
        }
      }
    });

    await setExtensionPreference(
      context,
      extensionId,
      "ui_click_checkbox_sort_tabs_pinned",
      true,
    );
    await runExtensionCommand(context, extensionId, "command_sort_tabs_url");
    const domains = await waitForSortedHttpTabs(context);

    expect(domains).toEqual(["amazon.com", "github.com", "youtube.com"]);

    await youtube.close();
    await github.close();
    await amazon.close();
  });
});
