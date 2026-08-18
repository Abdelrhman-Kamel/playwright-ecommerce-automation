import { test as base, expect } from "@playwright/test";
import { allure } from "allure-playwright";
import path from "path";
import { fileURLToPath } from "url";
import { POManager } from "../pageObjects/POManager";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Extends Playwright's base `test`. Each key below is a fixture you can
 * destructure directly in a test:
 *
 *   test('...', async ({ loginPage, homePage }) => { ... })
 */
export const test = base.extend({
  // Auto-fixture (runs for every test, no destructuring). Maps our
  // @smoke/@regression/@security tags into Allure's epic/feature hierarchy
  // so the report can group/filter by them without annotating every spec.
  allureLabels: [
    async ({}, use, testInfo) => {
      for (const tag of testInfo.tags) {
        if (tag === "@smoke") allure.epic("Smoke Suite");
        if (tag === "@regression") allure.epic("Regression Suite");
        if (tag === "@security") allure.feature("Security");
        if (tag === "@known-issue") {
          // These use test.fail() to document real bugs found via
          // automation. Playwright counts an expected failure as an overall
          // "pass" (the point — CI stays green rather than blocking on a
          // known issue), so Allure's pass/fail status can't tell them apart
          // from an ordinary passing test. Group them into their own feature
          // and mark severity so they stand out in the report anyway.
          allure.feature("Known Issues (tracked via test.fail())");
          allure.severity("minor");
        }
      }
      await use();
    },
    { auto: true },
  ],

  // Picks the storage state file globalSetup.js created for THIS worker
  // (.auth/worker-{parallelIndex}.json). Cheap and test-scoped — the
  // expensive part (register + login) already ran once upfront in
  // globalSetup, not here.
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
    await use(poManager.getHomePage());
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
