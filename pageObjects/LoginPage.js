export class LoginPage {
  constructor(page) {
    this.page = page;
    this.backgroundTitle = page.getByText("Rahul Shetty Academy");
    this.userNameInput = page.locator("#userEmail");
    this.passwordInput = page.locator("#userPassword");
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.forgotPasswordLink = page.getByRole("link", {
      name: "Forgot password?",
    });
    this.registerLink = page.getByRole("link", { name: "Register" });
  }

  async login(userName, password) {
    await this.userNameInput.fill(userName);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    // Explicit, shorter timeout (successful logins consistently take
    // ~3-4s) — without this, a genuinely failed login inherits the full
    // 30s default and eats the whole test's time budget. Playwright then
    // classifies the overall test as "timedOut" rather than "failed",
    // which test.fail() does NOT recognize as the expected outcome (only
    // status: "failed" counts) — causing tests/auth/login.spec.js's
    // "login is case-insensitive for email" test.fail() test to be
    // reported as a hard, unexpected failure instead of an accepted
    // expected failure.
    await this.page.locator(".card-body").first().waitFor({ timeout: 8000 });
  }

  async navigateToRegisteration() {
    await this.registerLink.click();
    await this.page.getByRole("button", { name: "Register" }).waitFor();
  }
}
