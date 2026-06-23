import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const localesDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../template-extension/_locales",
);

function messageKeys(locale) {
  const filePath = path.join(localesDir, locale, "messages.json");
  const messages = JSON.parse(readFileSync(filePath, "utf8"));
  return Object.keys(messages).sort();
}

const allLocales = readdirSync(localesDir);
const referenceKeys = messageKeys("en");

describe("locale messages.json", () => {
  it("includes all supported languages", () => {
    expect(allLocales.sort()).toEqual(
      [
        "ar",
        "cs",
        "da",
        "de",
        "el",
        "en",
        "es",
        "fi",
        "fr",
        "he",
        "hu",
        "it",
        "ja",
        "ko",
        "nb",
        "nl",
        "pl",
        "pt_BR",
        "pt_PT",
        "ro",
        "ru",
        "sv",
        "tr",
        "zh_CN",
        "zh_TW",
      ].sort(),
    );
  });

  for (const locale of allLocales) {
    it(`${locale} has the same keys as en`, () => {
      expect(messageKeys(locale)).toEqual(referenceKeys);
    });
  }
});
