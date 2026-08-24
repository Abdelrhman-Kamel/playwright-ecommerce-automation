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
    // Shorter timeout so a failed login fails clean instead of eating the
    // full 30s budget. Otherwise Playwright marks the test "timedOut" rather
    // than "failed", and test.fail() only accepts "failed" — which would flip
    // the case-insensitive-email known-issue test into a hard failure.
    await this.page.locator(".card-body").first().waitFor({ timeout: 8000 });
  }

  async navigateToRegistration() {
    await this.registerLink.click();
    await this.page.getByRole("button", { name: "Register" }).waitFor();
  }
}
