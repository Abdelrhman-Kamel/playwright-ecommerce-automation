import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { ROUTES } from "../constants/routes.js";
import { LoginPage } from "../pageObjects/LoginPage.js";
import { RegisterationPage } from "../pageObjects/RegisterationPage.js";
import { CartPage } from "../pageObjects/CartPage.js";
import { OrdersPage } from "../pageObjects/OrdersPage.js";
import { generateRegistrationData } from "../utils/testData.js";
import { registerWithRetry } from "../utils/registerWithRetry.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL;
const AUTH_DIR = path.join(__dirname, "../.auth");
const ALLURE_RESULTS_DIR = path.join(__dirname, "../allure-results");

// Cached worker accounts older than this get re-registered from scratch
// rather than trusted forever — guards against a stale/expired session
// causing confusing auth failures deep into a run.
const STALE_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours

// registerWithRetry lives in utils/registerWithRetry.js, shared with
// tests/auth/registration.spec.js so both get the same resilience against
// this site's flaky registration endpoint instead of duplicating the logic.

/**
 * Registers and logs in one isolated account per worker, all upfront before
 * any test runs. Each worker writes its own .auth/worker-N.json, so parallel
 * workers never share cart or order state — no cross-worker races from a
 * single shared account.
 *
 * Accounts are cached across runs: if a worker's storage state file exists
 * and isn't stale, registration is skipped for that worker. That's the real
 * startup fix — the bottleneck was re-registering a brand-new account every
 * run, not the storage format.
 */
export default async function globalSetup(config) {
  const workerCount = config.workers;
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  // Write Allure's environment.properties every run so the report shows
  // current run context instead of the empty "no environment variables"
  // state. allure-results/ gets wiped and rebuilt each run (allure generate
  // --clean), so this has to be written fresh here, not committed statically.
  fs.mkdirSync(ALLURE_RESULTS_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(ALLURE_RESULTS_DIR, "environment.properties"),
    [
      `Base_URL=${BASE_URL}`,
      `Framework=Playwright`,
      `Browsers=Chromium, Firefox, Webkit`,
      `Environment=${process.env.CI ? "CI" : "Local"}`,
      `Run_Date=${new Date().toISOString()}`,
    ].join("\n"),
  );

  const browser = await chromium.launch();

  for (let workerIndex = 0; workerIndex < workerCount; workerIndex++) {
    const authFile = path.join(AUTH_DIR, `worker-${workerIndex}.json`);

    if (fs.existsSync(authFile)) {
      const ageMs = Date.now() - fs.statSync(authFile).mtimeMs;
      if (ageMs < STALE_AFTER_MS) {
        console.log(
          `Worker ${workerIndex}: reusing existing account (${Math.round(ageMs / 60000)}m old)`,
        );

        // Cached accounts can persist across runs now, so a previous run's
        // failed/incomplete afterEach cleanup can carry forward. Clear
        // cart/orders here using the cached session, without redoing
        // registration/login.
        const cachePage = await browser.newPage({ storageState: authFile });
        await cachePage.goto(BASE_URL + ROUTES.cart, {
          waitUntil: "domcontentloaded",
        });
        await new CartPage(cachePage).clearCart();
        await cachePage.goto(BASE_URL + ROUTES.orders, {
          waitUntil: "domcontentloaded",
        });
        await new OrdersPage(cachePage).clearOrders();
        await cachePage.close();

        continue;
      }
      console.log(
        `Worker ${workerIndex}: cached account stale, re-registering`,
      );
    }

    const page = await browser.newPage();
    const loginPage = new LoginPage(page);
    const registerationPage = new RegisterationPage(page);

    await page.goto(BASE_URL + ROUTES.login, {
      waitUntil: "domcontentloaded",
    });
    await loginPage.navigateToRegisteration();
    const user = await registerWithRetry(loginPage, registerationPage, {
      tag: `w${workerIndex}`,
    });
    await loginPage.login(user.email, user.password);

    await page.waitForURL("**/dashboard/dash**");
    await page.locator(".card-body").first().waitFor();

    // Safety net: clear anything the site might seed for new accounts.
    await page.goto(BASE_URL + ROUTES.cart, {
      waitUntil: "domcontentloaded",
    });
    await new CartPage(page).clearCart();
    await page.goto(BASE_URL + ROUTES.orders, {
      waitUntil: "domcontentloaded",
    });
    await new OrdersPage(page).clearOrders();

    await page.context().storageState({ path: authFile });

    await page.close();
  }

  await browser.close();
}
