import { describe, expect, it } from "vitest";
import {
  comparisonByUrl,
  computeGroupAwareTabOrder,
  computeLegacyTabOrder,
  computePinnedTabOrder,
  groupSuspendedTabs,
  organizeTabsByGroup,
  removeParenthesisNotification,
} from "../../template-extension/lib/sort-logic.js";
import { tab, tabsFromUrls } from "../helpers/tab-fixtures.js";

describe("comparisonByUrl", () => {
  it("sorts by domain regardless of www prefix (issue #20)", () => {
    const tabs = tabsFromUrls([
      "https://www.youtube.com",
      "https://github.com",
      "https://amazon.com",
      "https://google.com",
    ]);

    const order = [...tabs]
      .sort(comparisonByUrl)
      .map((t) => extractHostname(t.url));

    expect(order).toEqual(["amazon.com", "github.com", "google.com", "youtube.com"]);
  });
});

describe("pinned tab sorting (issue #9)", () => {
  it("sorts pinned tabs independently by URL", () => {
    const pinnedTabs = tabsFromUrls(
      [
        "https://youtube.com",
        "https://github.com",
        "https://amazon.com",
        "https://google.com",
      ],
      { pinned: true },
    );

    const order = computePinnedTabOrder(pinnedTabs, {
      comparisonFunction: comparisonByUrl,
    });

    expect(order).toEqual([3, 2, 4, 1]);
  });
});

describe("suspended tabs grouping (issue #18)", () => {
  it("groups suspended tabs at the end", () => {
    const tabs = [
      tab(1, "https://google.com"),
      tab(2, "https://amazon.com", { discarded: true }),
      tab(3, "https://github.com"),
      tab(4, "https://wikipedia.org", { discarded: true }),
    ];

    const sorted = [...tabs].sort(comparisonByUrl);
    const grouped = groupSuspendedTabs(sorted, "end");

    expect(grouped.map((t) => t.id)).toEqual([3, 1, 2, 4]);
    expect(grouped.slice(0, 2).every((t) => !t.discarded)).toBe(true);
    expect(grouped.slice(2).every((t) => t.discarded)).toBe(true);
  });

  it("groups suspended tabs at the beginning via legacy sort order", () => {
    const tabs = [
      tab(1, "https://google.com"),
      tab(2, "https://amazon.com", { discarded: true }),
      tab(3, "https://github.com"),
    ];

    const order = computeLegacyTabOrder(tabs, {
      comparisonFunction: comparisonByUrl,
      suspendedPosition: "beginning",
    });

    expect(order[0]).toBe(2);
    expect(order.slice(1)).toEqual([3, 1]);
  });

  it("groups suspended tabs at the end via legacy sort order", () => {
    const tabs = [
      tab(1, "https://google.com"),
      tab(2, "https://amazon.com", { discarded: true }),
      tab(3, "https://github.com"),
    ];

    const order = computeLegacyTabOrder(tabs, {
      comparisonFunction: comparisonByUrl,
      suspendedPosition: "end",
    });

    expect(order).toEqual([3, 1, 2]);
  });
});

describe("tab groups support (issue #19)", () => {
  it("sorts within groups while preserving group positions", () => {
    const tabs = [
      tab(1, "https://github.com", { groupId: 100 }),
      tab(2, "https://youtube.com"),
      tab(3, "https://google.com", { groupId: 100 }),
      tab(4, "https://amazon.com", { groupId: 200 }),
      tab(5, "https://wikipedia.org", { groupId: 100 }),
      tab(6, "https://reddit.com", { groupId: 200 }),
    ];

    const order = computeGroupAwareTabOrder(tabs, {
      comparisonFunction: comparisonByUrl,
    });

    expect(order).toEqual([1, 3, 5, 2, 4, 6]);
  });

  it("organizeTabsByGroup separates grouped and ungrouped tabs", () => {
    const tabs = [
      tab(1, "https://github.com", { groupId: 42 }),
      tab(2, "https://google.com"),
      tab(3, "https://amazon.com", { groupId: 42 }),
    ];

    const { groups, ungrouped } = organizeTabsByGroup(tabs);
    expect(groups.size).toBe(1);
    expect(groups.get(42).tabs).toHaveLength(2);
    expect(ungrouped).toHaveLength(1);
  });
});

describe("removeParenthesisNotification", () => {
  it("removes notification counts from titles", () => {
    expect(removeParenthesisNotification("(20) My Video")).toBe("My Video");
  });
});

function extractHostname(url) {
  return new URL(url).hostname.replace(/^www\./, "");
}
