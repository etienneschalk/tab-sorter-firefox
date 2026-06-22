import {
  expect,
  runExtensionCommand,
  test,
  waitForSortedHttpTabs,
} from "./extension.fixture.js";

test.describe("sort by URL", () => {
  test("sorts tabs in the current window", async ({ context, extensionId }) => {
    const first = await context.newPage();
    await first.goto("https://youtube.com");
    const second = await context.newPage();
    await second.goto("https://github.com");
    const third = await context.newPage();
    await third.goto("https://amazon.com");

    await runExtensionCommand(context, extensionId, "command_sort_tabs_url");
    const domains = await waitForSortedHttpTabs(context);

    expect(domains).toEqual(["amazon.com", "github.com", "youtube.com"]);

    await first.close();
    await second.close();
    await third.close();
  });
});
