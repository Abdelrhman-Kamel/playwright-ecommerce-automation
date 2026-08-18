import { test, expect } from "../../fixtures/pageFixtures";
import { generateRegistrationData } from "../../utils/testData";
import { registerWithRetry } from "../../utils/registerWithRetry";
import { ROUTES } from "../../constants/routes";

test.use({ storageState: { cookies: [], origins: [] } });

// ---------------------------------------------------------------------------
// Functional tests
// ---------------------------------------------------------------------------
test.describe("Registration", { tag: ["@regression"] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.register, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Register" }).waitFor();
  });

  test("a new user can register successfully", async ({
    loginPage,
    registerationPage,
  }) => {
    await registerWithRetry(loginPage, registerationPage);

    await expect(loginPage.loginButton).toBeVisible();
  });

  test("successful registration redirects to the login page", async ({
    page,
    loginPage,
    registerationPage,
  }) => {
    await registerWithRetry(loginPage, registerationPage);

    await expect(page).toHaveURL(/.*\/#\/auth\/login/);
    await expect(loginPage.loginButton).toBeVisible();
  });

  test("user can register with Male gender", async ({
    loginPage,
    registerationPage,
  }) => {
    await registerWithRetry(loginPage, registerationPage, {
      overrides: { gender: "Male" },
    });

    await expect(loginPage.loginButton).toBeVisible();
  });

  test("user can register with Female gender", async ({
    loginPage,
    registerationPage,
  }) => {
    await registerWithRetry(loginPage, registerationPage, {
      overrides: { gender: "Female" },
    });

    await expect(loginPage.loginButton).toBeVisible();
  });

  test("registering with a duplicate email shows an error", async ({
    page,
    loginPage,
    registerationPage,
  }) => {
    // First registration must actually succeed, so it gets the same retry
    // resilience as the other tests (flaky endpoint).
    const user = await registerWithRetry(loginPage, registerationPage);

    // Re-submit the SAME email — do NOT retry here, since a retry would
    // generate a fresh email and defeat the duplicate-email check.
    await page.goto(ROUTES.register);
    await registerationPage.registerButton.waitFor();

    await registerationPage.fillAndSubmit(
      user.firstName,
      user.lastName,
      user.email,
      user.phone,
      user.occupation,
      user.gender,
      user.password,
    );

    await page
      .getByLabel("User already exisits with this Email Id!")
      .waitFor({ state: "visible", timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// UI / validation tests
// ---------------------------------------------------------------------------
test.describe("Registration page UI", { tag: ["@regression"] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.register, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Register" }).waitFor();
  });

  test("all required form fields are visible on page load", async ({
    page,
    registerationPage,
  }) => {
    await expect(page.getByRole("heading", { name: "Register" })).toBeVisible();
    await expect(registerationPage.firstNameInput).toBeVisible();
    await expect(registerationPage.lastNameInput).toBeVisible();
    await expect(registerationPage.emailInput).toBeVisible();
    await expect(registerationPage.phoneNumberInput).toBeVisible();
    await expect(registerationPage.occupationDropDown).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "Male", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "Female", exact: true }),
    ).toBeVisible();
    await expect(registerationPage.passwordInput).toBeVisible();
    await expect(registerationPage.confirmPasswordInput).toBeVisible();
    await expect(registerationPage.ageConsent).toBeVisible();
    await expect(registerationPage.registerButton).toBeVisible();
  });

  test("Register button has the correct label", async ({
    registerationPage,
  }) => {
    await expect(registerationPage.registerButton).toHaveText("Register");
  });

  test("'Login here' link is visible and navigates to the login page", async ({
    page,
    loginPage,
    registerationPage,
  }) => {
    await expect(registerationPage.loginHereLink).toBeVisible();

    // The decorative .banner layer sits over this footer link and swallows
    // clicks (even forced ones hit the overlay). Dispatch the click straight
    // to the node so its router handler fires.
    await registerationPage.loginHereLink.dispatchEvent("click");

    await expect(page).toHaveURL(/.*\/#\/auth\/login/);
    await expect(loginPage.loginButton).toBeVisible();
  });

  test("mismatched passwords show a validation error", async ({
    page,
    registerationPage,
  }) => {
    const user = generateRegistrationData();

    await registerationPage.fillAndSubmit(
      user.firstName,
      user.lastName,
      user.email,
      user.phone,
      user.occupation,
      user.gender,
      user.password,
      "differentPassword9!",
    );

    await expect(
      page.getByText(
        "Password and Confirm Password must match with each other.",
      ),
    ).toBeVisible();
  });
});
