import { describe, expect, it } from "vitest";
import {
  extractDomain,
  findDuplicateTabIds,
  getUrlMatchKey,
} from "../../template-extension/lib/sort-logic.js";
import { tab } from "../helpers/tab-fixtures.js";

describe("extractDomain", () => {
  it("strips www prefix", () => {
    expect(extractDomain("https://www.github.com/user/repo")).toBe("github.com");
    expect(extractDomain("https://github.com/user/repo")).toBe("github.com");
  });

  it("returns null for invalid URLs", () => {
    expect(extractDomain("not-a-url")).toBeNull();
  });
});

describe("getUrlMatchKey", () => {
  it("normalizes host, path, and casing", () => {
    expect(getUrlMatchKey("https://WWW.Example.com/Page/")).toBe(
      "https://example.com/page",
    );
    expect(getUrlMatchKey("https://example.com/page?q=1#hash")).toBe(
      "https://example.com/page",
    );
  });
});

describe("findDuplicateTabIds", () => {
  it("keeps the leftmost tab and skips pinned tabs", () => {
    const tabs = [
      tab(1, "https://github.com/a"),
      tab(2, "https://github.com/b"),
      tab(3, "https://www.github.com/a"),
      tab(4, "https://github.com/a", { pinned: true }),
    ];

    expect(findDuplicateTabIds(tabs)).toEqual([3]);
  });

  it("detects duplicates by title when loaded", () => {
    const tabs = [
      tab(1, "https://a.example/1", { title: "Same Title" }),
      tab(2, "https://b.example/2", { title: "Same Title" }),
    ];

    expect(findDuplicateTabIds(tabs)).toEqual([2]);
  });
});
