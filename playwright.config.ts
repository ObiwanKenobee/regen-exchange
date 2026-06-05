import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 4173);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

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
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
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