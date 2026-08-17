import { test as base, expect } from "@playwright/test";
import { allure } from "allure-playwright";
import path from "path";
import { fileURLToPath } from "url";
import { POManager } from "../pageObjects/POManager";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Custom test object that extends Playwright's base `test`.
 * Each key below becomes a fixture you can destructure directly in a test:
 *
 *   test('...', async ({ loginPage, homePage }) => { ... })
 */
export const test = base.extend({
  // -------------------------------------------------------------------------
  // Auto-fixture (auto: true) — runs for EVERY test automatically, no
  // destructuring needed. Maps our existing @smoke/@regression/@security
  // tags into Allure's epic/feature hierarchy, so the Allure report can
  // group and filter by them visually without annotating every spec file
  // individually.
  // -------------------------------------------------------------------------
  allureLabels: [
    async ({}, use, testInfo) => {
      for (const tag of testInfo.tags) {
        if (tag === "@smoke") allure.epic("Smoke Suite");
        if (tag === "@regression") allure.epic("Regression Suite");
        if (tag === "@security") allure.feature("Security");
        if (tag === "@known-issue") {
          // These tests use test.fail() to document real bugs found via
          // automation. Playwright counts an expected failure as an
          // overall "pass" (that's the point — CI stays green rather than
          // blocking on an already-known issue), which means Allure's own
          // pass/fail status can't be used to distinguish them from an
          // ordinary passing test. Grouping them into their own feature +
          // marking severity here makes them visually distinct in the
          // report regardless of that pass/fail status quirk.
          allure.feature("Known Issues (tracked via test.fail())");
          allure.severity("minor");
        }
      }
      await use();
    },
    { auto: true },
  ],

  // -------------------------------------------------------------------------
  // Picks the storage state file that globalSetup.js created for THIS
  // worker (.auth/worker-{parallelIndex}.json). This is cheap and test-scoped
  // — all the actual expensive work (registering + logging in) already
  // happened once upfront in globalSetup, not here.
  // -------------------------------------------------------------------------
  storageState: async ({}, use, testInfo) => {
    await use(
      path.join(__dirname, `../.auth/worker-${testInfo.parallelIndex}.json`),
    );
  },

  poManager: async ({ page }, use) => {
    const poManager = new POManager(page);
    await use(poManager);
  },

  loginPage: async ({ poManager }, use) => {
    await use(poManager.getLoginPage());
  },

  registerationPage: async ({ poManager }, use) => {
    await use(poManager.getRegisterationPage());
  },

  homePage: async ({ poManager }, use) => {
    await use(poManager.getDashboardPage());
  },

  cartPage: async ({ poManager }, use) => {
    await use(poManager.getCartPage());
  },

  checkoutPage: async ({ poManager }, use) => {
    await use(poManager.getCheckoutPage());
  },

  ordersPage: async ({ poManager }, use) => {
    await use(poManager.getOrdersPage());
  },

  orderDetailsPage: async ({ poManager }, use) => {
    await use(poManager.getOrderDetailsPage());
  },

  orderViewPage: async ({ poManager }, use) => {
    await use(poManager.getOrderViewPage());
  },

  sideBar: async ({ poManager }, use) => {
    await use(poManager.getSideBar());
  },
});

export { expect };
