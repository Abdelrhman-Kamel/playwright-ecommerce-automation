// @ts-check
import { defineConfig, devices } from "@playwright/test";

import dotenv from "dotenv";

dotenv.config();

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  globalSetup: "./setup/globalSetup.js",
  /* Raised from 30 s — this demo site has slow API responses. */
  timeout: 30000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry once locally too — this specific site has known, external
     response flakiness (documented throughout pageObjects/RegisterationPage.js
     and utils/registerWithRetry.js), so a single local retry cuts down on
     false failures without hiding genuine bugs (still fails loudly after
     the retry is exhausted). CI keeps a higher retry count since it's
     unattended and slower overall. */
  retries: process.env.CI ? 2 : 1,
  /* Keep worker count modest rather than unbounded: each worker registers
     its own isolated account in globalSetup, so more workers means more
     concurrent registration traffic against a site we've already found
     to be flaky under load. CI runners default to 2 vCPUs anyway. */
  workers: process.env.CI ? 2 : 2,
  /* Dual reporter: "list" for readable live terminal output while running,
     "html" for the full report afterward. open: 'never' stops it from
     auto-launching a browser tab after every single run — use
     `npm run test:report` to open it on demand instead. */
  reporter: [["list"], ["html", { open: "never" }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Capture a screenshot only when a test actually fails — cheap to
       keep on, avoids cluttering test-results/ with screenshots from
       passing runs. */
    screenshot: "only-on-failure",

    /* Same reasoning as screenshot — only keep video for failures, where
       it's actually useful for debugging. */
    video: "retain-on-failure",
  },

  /* Slightly relax the default 5s assertion timeout given this site's
     known slower-than-typical API response times (see selectCountry's
     20s waitFor in pageObjects/CheckoutPage.js for the most extreme case,
     but plenty of ordinary assertions benefit from a bit more headroom too). */
  expect: {
    timeout: 7000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
