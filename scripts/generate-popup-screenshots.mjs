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
 * Output: screenshots/amo/<locale>/popup-1280x800.jpg
 *
 * Chromium cannot load the Firefox MV3 background page, so this script copies
 * the Firefox build and patches the manifest to use a service worker while
 * keeping gecko settings (Firefox-specific help text).
 *
 * Extensions require a headed browser. On Linux without a display:
 *   xvfb-run npm run generate:screenshots
 */

import { chromium } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const firefoxExtensionPath = path.join(rootDir, "build/firefox-extension");
const localesDir = path.join(rootDir, "template-extension/_locales");
const outputRoot = path.join(rootDir, "screenshots/amo");

const WIDTH = 1280;
const HEIGHT = 800;
const POPUP_WIDTH = 780;

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

/** Chromium needs a service worker; keep gecko block for Firefox-specific UI. */
function prepareScreenshotExtension() {
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "tab-sorter-screenshot-ext-"),
  );
  fs.cpSync(firefoxExtensionPath, tempDir, { recursive: true });

  const manifestPath = path.join(tempDir, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.background = {
    service_worker: "tab-sorter.js",
    type: "module",
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  return tempDir;
}

async function getExtensionId(context) {
  for (const serviceWorker of context.serviceWorkers()) {
    const id = extensionIdFromUrl(serviceWorker.url());
    if (id) {
      return id;
    }
  }

  const serviceWorker = await context.waitForEvent("serviceworker", {
    timeout: 30_000,
  });
  const id = extensionIdFromUrl(serviceWorker.url());
  if (!id) {
    throw new Error(`Unexpected service worker URL: ${serviceWorker.url()}`);
  }
  return id;
}

async function prepareScreenshotPage(page) {
  await page.setViewportSize({ width: WIDTH, height: HEIGHT });
  await page.emulateMedia({ colorScheme: "light" });

  await page.addStyleTag({
    content: `
      html {
        width: ${WIDTH}px !important;
        height: ${HEIGHT}px !important;
        background: #f0f0f0 !important;
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
        background: #f0f0f0 !important;
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

  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "light");
  });
}

async function captureLocaleScreenshot(extensionPath, locale) {
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

  try {
    const extensionId = await getExtensionId(context);

    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/tab-sorter.html`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector("h2", { timeout: 15_000 });
    await page.waitForTimeout(300);

    await prepareScreenshotPage(page);

    const localeDir = path.join(outputRoot, locale);
    fs.mkdirSync(localeDir, { recursive: true });
    const outputPath = path.join(localeDir, "popup-1280x800.jpg");

    await page.screenshot({
      path: outputPath,
      type: "jpeg",
      quality: 92,
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    });

    return outputPath;
  } finally {
    await context.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
}

async function main() {
  if (!fs.existsSync(firefoxExtensionPath)) {
    console.error("Firefox extension build not found. Run: npm run build");
    process.exit(1);
  }

  const extensionPath = prepareScreenshotExtension();

  console.log(`Generating ${locales.length} localized screenshots…`);
  fs.mkdirSync(outputRoot, { recursive: true });

  const results = [];

  try {
    for (const locale of locales) {
      process.stdout.write(`  ${locale}… `);
      try {
        const outputPath = await captureLocaleScreenshot(extensionPath, locale);
        console.log(`✓ ${path.relative(rootDir, outputPath)}`);
        results.push({ locale, outputPath, ok: true });
      } catch (error) {
        console.log(`✗ ${error.message}`);
        results.push({ locale, ok: false, error });
      }
    }
  } finally {
    fs.rmSync(extensionPath, { recursive: true, force: true });
  }

  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(`\n${failed.length} locale(s) failed.`);
    process.exit(1);
  }

  console.log(`\nDone. Screenshots saved under screenshots/amo/<locale>/`);
}

main();
