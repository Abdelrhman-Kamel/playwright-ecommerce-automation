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
  /* This demo site has slow API responses, hence the default 30s. */
  timeout: 30000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry once locally too — this site has external response flakiness
     (see pageObjects/RegisterationPage.js and utils/registerWithRetry.js),
     so one local retry cuts false failures without hiding real bugs (still
     fails loudly once retries are exhausted). CI retries more since it's
     unattended and slower. */
  retries: process.env.CI ? 2 : 1,
  /* Keep worker count modest: each worker registers its own account in
     globalSetup, so more workers means more concurrent registration traffic
     against a site that's already flaky under load. CI runners are 2 vCPUs
     anyway. */
  workers: process.env.CI ? 2 : 2,
  /* Two reporters: "list" for readable live terminal output, "html" for the
     full report afterward. open: 'never' stops it auto-launching a browser
     tab after every run — use `npm run test:report` to open it on demand. */
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    [
      "allure-playwright",
      { detail: true, outputFolder: "allure-results", suiteTitle: false },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.BASE_URL,

    /* Bigger viewport than Playwright's default (1280x720). At the default,
       this site's sticky recruiter/ad banner overlaps interactive elements
       (e.g. the "Login here" link) that don't overlap at a normal window
       size — standardizing on a larger viewport avoids CI-only failures
       caused purely by screen size. */
    viewport: { width: 1920, height: 1080 },

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Screenshot only on failure — cheap to leave on, keeps test-results/
       from filling up with screenshots from passing runs. */
    screenshot: "only-on-failure",

    /* Same as screenshot: only keep video for failures, where it's useful. */
    video: "retain-on-failure",
  },

  /* Bump the default 5s assertion timeout a bit given this site's slow API
     responses (selectCountry's wait in pageObjects/CheckoutPage.js is the
     extreme case, but plenty of ordinary assertions want more headroom). */
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
