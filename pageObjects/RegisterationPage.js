export class RegisterationPage {
  constructor(page) {
    this.page = page;
    this.firstNameInput = page.getByPlaceholder("First Name");
    this.lastNameInput = page.getByPlaceholder("Last Name");
    this.emailInput = page.getByPlaceholder("email@example.com");
    this.phoneNumberInput = page.getByPlaceholder("enter your number");
    this.occupationDropDown = page.getByRole("combobox");
    this.passwordInput = page.getByPlaceholder("Passsword", { exact: true });
    this.confirmPasswordInput = page.getByPlaceholder("Confirm Passsword", {
      exact: true,
    });
    this.ageConsent = page.getByRole("checkbox");
    this.registerButton = page.getByRole("button", { name: "Register" });
    this.loginHereLink = page.locator(
      'p:has-text("Already have an account? Login here")',
    );
    // success modal shown after registration
    this.accountCreatedMsg = page.getByText("Account Created Successfully");
    this.loginAfterRegisterBtn = page.getByRole("button", { name: "Login" });
  }

  /**
   * Fills every field and clicks Register, but doesn't wait for any
   * post-submit signal. Use for error states (duplicate email, password
   * mismatch) where the success redirect never happens.
   *
   * @param {string} [confirmPassword]  Defaults to `password` when omitted.
   */
  async fillAndSubmit(
    firstName,
    lastName,
    email,
    phone,
    occupation,
    gender,
    password,
    confirmPassword = password,
  ) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.phoneNumberInput.fill(phone);
    await this.occupationDropDown.selectOption(occupation);
    await this.page.getByRole("radio", { name: gender, exact: true }).check();
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.ageConsent.check();
    await this.registerButton.click();
  }

  /** Happy path: fill the form, then wait for the success modal. */
  async register(
    firstName,
    lastName,
    email,
    phone,
    occupation,
    gender,
    password,
  ) {
    await this.fillAndSubmit(
      firstName,
      lastName,
      email,
      phone,
      occupation,
      gender,
      password,
    );

    // The page stays on the register URL and shows an "Account Created
    // Successfully" modal — click Login to finish and land on the login page.
    await this.accountCreatedMsg.waitFor();
    await this.loginAfterRegisterBtn.click();
    await this.page.waitForURL("**/#/auth/login");
  }
}
