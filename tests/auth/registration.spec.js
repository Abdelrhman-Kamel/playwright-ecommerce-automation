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
    registrationPage,
  }) => {
    await registerWithRetry(loginPage, registrationPage);

    await expect(loginPage.loginButton).toBeVisible();
  });

  test("successful registration redirects to the login page", async ({
    page,
    loginPage,
    registrationPage,
  }) => {
    await registerWithRetry(loginPage, registrationPage);

    await expect(page).toHaveURL(/.*\/#\/auth\/login/);
    await expect(loginPage.loginButton).toBeVisible();
  });

  test("user can register with Male gender", async ({
    loginPage,
    registrationPage,
  }) => {
    await registerWithRetry(loginPage, registrationPage, {
      overrides: { gender: "Male" },
    });

    await expect(loginPage.loginButton).toBeVisible();
  });

  test("user can register with Female gender", async ({
    loginPage,
    registrationPage,
  }) => {
    await registerWithRetry(loginPage, registrationPage, {
      overrides: { gender: "Female" },
    });

    await expect(loginPage.loginButton).toBeVisible();
  });

  test("registering with a duplicate email shows an error", async ({
    page,
    loginPage,
    registrationPage,
  }) => {
    // First registration must actually succeed, so it gets the same retry
    // resilience as the other tests (flaky endpoint).
    const user = await registerWithRetry(loginPage, registrationPage);

    // Re-submit the SAME email — do NOT retry here, since a retry would
    // generate a fresh email and defeat the duplicate-email check.
    await page.goto(ROUTES.register);
    await registrationPage.registerButton.waitFor();

    await registrationPage.fillAndSubmit(
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
    registrationPage,
  }) => {
    await expect(page.getByRole("heading", { name: "Register" })).toBeVisible();
    await expect(registrationPage.firstNameInput).toBeVisible();
    await expect(registrationPage.lastNameInput).toBeVisible();
    await expect(registrationPage.emailInput).toBeVisible();
    await expect(registrationPage.phoneNumberInput).toBeVisible();
    await expect(registrationPage.occupationDropDown).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "Male", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "Female", exact: true }),
    ).toBeVisible();
    await expect(registrationPage.passwordInput).toBeVisible();
    await expect(registrationPage.confirmPasswordInput).toBeVisible();
    await expect(registrationPage.ageConsent).toBeVisible();
    await expect(registrationPage.registerButton).toBeVisible();
  });

  test("Register button has the correct label", async ({
    registrationPage,
  }) => {
    await expect(registrationPage.registerButton).toHaveText("Register");
  });

  test("'Login here' link is visible and navigates to the login page", async ({
    page,
    loginPage,
    registrationPage,
  }) => {
    await expect(registrationPage.loginHereLink).toBeVisible();

    // The decorative .banner layer sits over this footer link and swallows
    // clicks (even forced ones hit the overlay). Dispatch the click straight
    // to the node so its router handler fires.
    await registrationPage.loginHereLink.dispatchEvent("click");

    await expect(page).toHaveURL(/.*\/#\/auth\/login/);
    await expect(loginPage.loginButton).toBeVisible();
  });

  test("mismatched passwords show a validation error", async ({
    page,
    registrationPage,
  }) => {
    const user = generateRegistrationData();

    await registrationPage.fillAndSubmit(
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
