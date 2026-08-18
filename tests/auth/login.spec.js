import { test, expect } from "../../fixtures/pageFixtures";
import { getLoginCredentials } from "../../utils/testData";
import { ROUTES } from "../../constants/routes";
import AxeBuilder from "@axe-core/playwright";

test.use({ storageState: { cookies: [], origins: [] } });

// ---------------------------------------------------------------------------
// Functional tests
// ---------------------------------------------------------------------------
test.describe("Login", { tag: ["@regression"] }, () => {
  let credentials;

  test.beforeEach(async ({ page }) => {
    credentials = getLoginCredentials();
    await page.goto(ROUTES.login, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Login" }).waitFor();
  });

  test("a registered user can log in successfully", async ({
    loginPage,
    homePage,
  }) => {
    await loginPage.login(credentials.username, credentials.password);

    await expect(homePage.products.first()).toBeVisible();
  });

  test("successful login redirects to the home page", async ({
    page,
    loginPage,
  }) => {
    await loginPage.login(credentials.username, credentials.password);

    await expect(page).toHaveURL(/.*\/#\/dashboard\/dash/);
  });

  test("logging in with an invalid password shows an error", async ({
    page,
    loginPage,
  }) => {
    await loginPage.userNameInput.fill(credentials.username);
    await loginPage.passwordInput.fill("WrongPassword99!");
    await loginPage.loginButton.click();

    await page
      .getByLabel("Incorrect email or password.")
      .waitFor({ state: "visible", timeout: 5000 });
  });

  test("logging in with an unregistered email shows an error", async ({
    page,
    loginPage,
  }) => {
    await loginPage.userNameInput.fill("notregistered@test.com");
    await loginPage.passwordInput.fill(credentials.password);
    await loginPage.loginButton.click();

    await page
      .getByLabel("Incorrect email or password.")
      .waitFor({ state: "visible", timeout: 5000 });
  });

  test(
    "login is case-insensitive for email",
    { tag: ["@known-issue"] },
    async ({ loginPage, homePage }) => {
      test.fail(
        true,
        "Bug found via automation: login is case-sensitive on email, should not be.",
      );
      await loginPage.login(
        credentials.username.toUpperCase(),
        credentials.password,
      );

      await expect(homePage.products.first()).toBeVisible();
    },
  );

  test("login is case-sensitive for password", async ({ page, loginPage }) => {
    await loginPage.userNameInput.fill(credentials.username);
    await loginPage.passwordInput.fill(credentials.password.toUpperCase());
    await loginPage.loginButton.click();

    await page
      .getByLabel("Incorrect email or password.")
      .waitFor({ state: "visible", timeout: 5000 });
  });

  test("sign out after login returns to the login page", async ({
    page,
    loginPage,
    sideBar,
  }) => {
    await loginPage.login(credentials.username, credentials.password);
    await sideBar.signOut();

    await expect(page).toHaveURL(/.*\/#\/auth\/login/);
    await expect(loginPage.loginButton).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// UI / validation tests
// ---------------------------------------------------------------------------
test.describe("Login page UI", { tag: ["@regression"] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.login, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Login" }).waitFor();
  });

  test("all form elements are visible on page load", async ({
    page,
    loginPage,
  }) => {
    await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
    await expect(loginPage.userNameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
    await expect(loginPage.registerLink).toBeVisible();
  });

  test("Login button has the correct label", async ({ loginPage }) => {
    await expect(loginPage.loginButton).toHaveText("Login");
  });

  test("'Forgot password?' link is visible", async ({ loginPage }) => {
    await expect(loginPage.forgotPasswordLink).toBeVisible();
  });

  test("'Register' link navigates to the registration page", async ({
    page,
    loginPage,
  }) => {
    await loginPage.navigateToRegisteration();

    await expect(page).toHaveURL(/.*\/#\/auth\/register/);
    await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
  });

  test("visual regression: login page layout", async ({ page }) => {
    await expect(page).toHaveScreenshot("login-page.png");
  });

  test("accessibility: login page has no WCAG 2.1 AA violations", async ({
    page,
  }) => {
    test.fail(
      true,
      "Bug found via automation: social media icon links (Facebook, Instagram, Twitter, YouTube) have no accessible name — axe rule 'link-name', WCAG 2.1 AA.",
    );
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
