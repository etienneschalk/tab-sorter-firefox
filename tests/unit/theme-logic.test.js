import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import {
  AVAILABLE_THEMES,
  THEME_AUTO,
  THEME_DARK,
  THEME_LIGHT,
  applyTheme,
  getSystemTheme,
  resolveTheme,
} from "../../template-extension/lib/theme-logic.js";

function createDom(prefersDark) {
  const dom = new JSDOM("<!DOCTYPE html><html></html>");
  const matchMedia = (query) => ({
    matches: query === "(prefers-color-scheme: dark)" ? prefersDark : false,
  });
  return { document: dom.window.document, matchMedia };
}

describe("theme logic (issue #16)", () => {
  it("exposes auto, dark, and light theme options", () => {
    expect(AVAILABLE_THEMES).toEqual([THEME_AUTO, THEME_DARK, THEME_LIGHT]);
  });

  it("resolves auto theme from system preference", () => {
    expect(getSystemTheme(() => ({ matches: true }))).toBe(THEME_DARK);
    expect(getSystemTheme(() => ({ matches: false }))).toBe(THEME_LIGHT);
  });

  it("applies explicit dark and light themes", () => {
    const { document, matchMedia } = createDom(false);

    expect(applyTheme(THEME_DARK, document, matchMedia)).toBe(THEME_DARK);
    expect(document.documentElement.getAttribute("data-theme")).toBe(THEME_DARK);

    expect(applyTheme(THEME_LIGHT, document, matchMedia)).toBe(THEME_LIGHT);
    expect(document.documentElement.getAttribute("data-theme")).toBe(THEME_LIGHT);
  });

  it("applies auto theme based on system dark mode", () => {
    const darkSystem = createDom(true);
    expect(resolveTheme(THEME_AUTO, darkSystem.matchMedia)).toBe(THEME_DARK);
    expect(applyTheme(THEME_AUTO, darkSystem.document, darkSystem.matchMedia)).toBe(
      THEME_DARK,
    );

    const lightSystem = createDom(false);
    expect(resolveTheme(THEME_AUTO, lightSystem.matchMedia)).toBe(THEME_LIGHT);
  });
});
