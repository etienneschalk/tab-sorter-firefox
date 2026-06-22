import { describe, expect, it } from "vitest";
import { isFirefoxExtension } from "../../template-extension/lib/browser-logic.js";

describe("browser logic", () => {
  it("detects Firefox from gecko browser_specific_settings", () => {
    expect(
      isFirefoxExtension(() => ({
        browser_specific_settings: { gecko: { id: "test" } },
      })),
    ).toBe(true);
  });

  it("detects Chrome when gecko settings are absent", () => {
    expect(isFirefoxExtension(() => ({}))).toBe(false);
    expect(
      isFirefoxExtension(() => ({ browser_specific_settings: {} })),
    ).toBe(false);
  });
});
