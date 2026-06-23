#!/usr/bin/env node
/**
 * Generate AMO-ready localized popup screenshots (1280x800 JPEG, 24-bit RGB).
 *
 * Requirements (Firefox Add-ons):
 * - 1280x800 or 640x400
 * - JPEG or PNG 24-bit (no alpha)
 *
 * Usage: npm run generate:screenshots
 *        node scripts/generate-popup-screenshots.mjs [locale ...]
 * Output:
 *   screenshots/amo/light_theme/<locale>/popup-1280x800.jpg
 *   screenshots/amo/dark_theme/<locale>/popup-1280x800.jpg
 *
 * Uses the Chrome extension build (service worker) under Chromium.
 * Extensions require a headed browser. On Linux without a display:
 *   xvfb-run npm run generate:screenshots
 */

import { chromium } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const extensionPath = path.join(rootDir, "build/chrome-extension");
const localesDir = path.join(rootDir, "template-extension/_locales");
const outputRoot = path.join(rootDir, "screenshots/amo");

const WIDTH = 1280;
const HEIGHT = 800;
const POPUP_WIDTH = 780;
const STORAGE_KEY_THEME = "TAB_SORTER_STORAGE_KEY_THEME";

const THEMES = [
  { name: "light", colorScheme: "light", canvasBackground: "#f0f0f0" },
  { name: "dark", colorScheme: "dark", canvasBackground: "#12121f" },
];

const requestedLocales = process.argv.slice(2);

const locales = (requestedLocales.length > 0
  ? requestedLocales
  : fs
      .readdirSync(localesDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
).sort();

function toBrowserLang(locale) {
  return locale.replace(/_/g, "-");
}

function extensionIdFromUrl(url) {
  const match = url.match(/^chrome-extension:\/\/([^/]+)/);
  return match?.[1] ?? null;
}

async function getServiceWorker(context) {
  for (const serviceWorker of context.serviceWorkers()) {
    if (extensionIdFromUrl(serviceWorker.url())) {
      return serviceWorker;
    }
  }

  const serviceWorker = await context.waitForEvent("serviceworker", {
    timeout: 30_000,
  });
  if (!extensionIdFromUrl(serviceWorker.url())) {
    throw new Error(`Unexpected service worker URL: ${serviceWorker.url()}`);
  }
  return serviceWorker;
}

async function getExtensionId(context) {
  const serviceWorker = await getServiceWorker(context);
  return extensionIdFromUrl(serviceWorker.url());
}

async function setStoredTheme(context, theme) {
  const serviceWorker = await getServiceWorker(context);
  await serviceWorker.evaluate(
    ([key, value]) => chrome.storage.sync.set({ [key]: value }),
    [STORAGE_KEY_THEME, theme],
  );
}

async function prepareScreenshotPage(page, theme) {
  await page.setViewportSize({ width: WIDTH, height: HEIGHT });
  await page.emulateMedia({ colorScheme: theme.colorScheme });

  await page.addStyleTag({
    content: `
      html {
        width: ${WIDTH}px !important;
        height: ${HEIGHT}px !important;
        background: ${theme.canvasBackground} !important;
      }

      body.popup-page {
        width: ${WIDTH}px !important;
        min-width: ${WIDTH}px !important;
        max-width: ${WIDTH}px !important;
        min-height: ${HEIGHT}px !important;
        max-height: none !important;
        height: ${HEIGHT}px !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        background: ${theme.canvasBackground} !important;
      }

      body.popup-page > .container {
        width: ${POPUP_WIDTH}px !important;
        max-width: ${POPUP_WIDTH}px !important;
        max-height: ${HEIGHT - 48}px !important;
        overflow: hidden !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.14);
        border-radius: 4px;
        background: var(--bg-primary) !important;
      }
    `,
  });
}

async function captureLocaleScreenshots(locale) {
  const browserLang = toBrowserLang(locale);
  const userDataDir = fs.mkdtempSync(
    path.join(os.tmpdir(), `tab-sorter-screenshot-${locale}-`),
  );

  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: "chromium",
    // Extensions do not load in legacy Chromium headless mode.
    headless: false,
    locale: browserLang,
    args: [
      `--lang=${browserLang}`,
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  const outputPaths = [];

  try {
    const extensionId = await getExtensionId(context);
    const page = await context.newPage();

    for (const theme of THEMES) {
      await setStoredTheme(context, theme.name);
      await page.goto(`chrome-extension://${extensionId}/tab-sorter.html`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForSelector("h2", { timeout: 15_000 });
      await page.waitForTimeout(300);

      await prepareScreenshotPage(page, theme);

      const localeDir = path.join(outputRoot, `${theme.name}_theme`, locale);
      fs.mkdirSync(localeDir, { recursive: true });
      const outputPath = path.join(localeDir, "popup-1280x800.jpg");

      await page.screenshot({
        path: outputPath,
        type: "jpeg",
        quality: 92,
        clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
      });

      outputPaths.push(outputPath);
    }

    return outputPaths;
  } finally {
    await context.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
}

async function main() {
  if (!fs.existsSync(extensionPath)) {
    console.error("Chrome extension build not found. Run: npm run build");
    process.exit(1);
  }

  console.log(
    `Generating ${locales.length * THEMES.length} screenshots (${THEMES.length} themes × ${locales.length} locales)…`,
  );
  fs.mkdirSync(outputRoot, { recursive: true });

  const results = [];

  for (const locale of locales) {
    process.stdout.write(`  ${locale}… `);
    try {
      const outputPaths = await captureLocaleScreenshots(locale);
      console.log(
        `✓ ${outputPaths.map((p) => path.relative(rootDir, p)).join(", ")}`,
      );
      results.push({ locale, outputPaths, ok: true });
    } catch (error) {
      console.log(`✗ ${error.message}`);
      results.push({ locale, ok: false, error });
    }
  }

  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(`\n${failed.length} locale(s) failed.`);
    process.exit(1);
  }

  console.log(
    `\nDone. Screenshots saved under screenshots/amo/<light_theme|dark_theme>/<locale>/`,
  );
}

main();
