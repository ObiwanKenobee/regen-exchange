import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

const PORT = Number(process.env.E2E_PORT ?? 4173);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * Capability-aware WebKit gate. WebKit ships with Playwright but its
 * runtime browser bundle is not always installed in every CI image
 * (e.g. minimal Linux runners often skip `playwright install webkit`).
 * Skip the WebKit project when the bundle is missing OR when the caller
 * opts out via `E2E_SKIP_WEBKIT=1`, so Chromium + Firefox still report
 * deterministic results instead of failing on a missing browser.
 */
function webkitAvailable(): boolean {
  if (process.env.E2E_SKIP_WEBKIT === "1") return false;
  if (process.env.E2E_FORCE_WEBKIT === "1") return true;
  try {
    // Resolve the playwright-core package and probe its bundled browsers
    // registry. Missing bundle => skip the project.
    const pwCore = require.resolve("playwright-core/package.json");
    const root = pwCore.replace(/package\.json$/, "");
    return (
      existsSync(`${root}.local-browsers`) ||
      existsSync(`${process.env.HOME ?? ""}/.cache/ms-playwright`)
    );
  } catch {
    return false;
  }
}

const WEBKIT_ENABLED = webkitAvailable();
if (!WEBKIT_ENABLED) {
  // eslint-disable-next-line no-console
  console.warn(
    "[playwright] WebKit project disabled (bundle missing or E2E_SKIP_WEBKIT=1). " +
      "Chromium + Firefox will still run.",
  );
}

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  // Default retries; per-test fixtures upgrade this for network-flagged tests
  // (see tests/e2e/fixtures.ts -> retryByFailureType).
  retries: process.env.CI ? 2 : 1,
  fullyParallel: false,
  reporter: process.env.CI
    ? [["github"], ["list"], ["html", { outputFolder: "playwright-report", open: "never" }]]
    : [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  outputDir: "test-results",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    ...(WEBKIT_ENABLED
      ? [{ name: "webkit", use: { ...devices["Desktop Safari"] } }]
      : []),
  ],
  // Bring your own server in CI: start the preview before invoking playwright.
  webServer: process.env.E2E_NO_WEBSERVER
    ? undefined
    : {
        command: `bun run preview --port ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});