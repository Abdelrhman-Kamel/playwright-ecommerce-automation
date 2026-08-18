export class CheckoutPage {
  constructor(page) {
    this.page = page;

    // payment + coupon fields
    this.creditCardInput = this.getInputField("Credit Card Number");
    this.cvvInput = this.getInputField("CVV");
    this.nameOnCardInput = this.getInputField("Name on Card");
    this.applyCouponInput = this.getInputField("Apply Coupon");
    this.monthDropdown = page.locator("select").first();
    this.yearDropdown = page.locator("select").nth(1);

    this.countryInput = page.getByPlaceholder("Select Country");
    this.applyCouponButton = page.locator("text=Apply Coupon");
    this.placeOrderButton = page.locator("a.action__submit");

    // payment method tiles (Credit Card, Paypal, SEPA, Invoice)
    this.paymentMethodCreditCard = page.locator(".payment__type--cc");
    this.paymentMethodPaypal = page.getByText("Paypal");
    this.paymentMethodSepa = page.getByText("SEPA");
    this.paymentMethodInvoice = page.getByText("Invoice");
  }

  // resolve an input by its field label
  getInputField(fieldLabel) {
    return this.page
      .locator(".field")
      .filter({ hasText: fieldLabel })
      .locator("input");
  }

  async fillCreditCardDetails(cardNumber, month, year, cvv, nameOnCard) {
    await this.creditCardInput.fill(cardNumber);
    await this.monthDropdown.selectOption(month);
    await this.yearDropdown.selectOption(year);
    await this.cvvInput.fill(cvv);
    await this.nameOnCardInput.fill(nameOnCard);
  }

  async selectCountry(countryName) {
    await this.countryInput.pressSequentially(countryName, { delay: 150 });
    // typing fires an autocomplete call; the suggestion button only shows once it resolves
    await this.page.getByRole("button", { name: countryName }).click();
  }

  async placeOrder() {
    await this.placeOrderButton.click();
    await this.page.getByText("THANKYOU FOR THE ORDER.").waitFor();
  }
}
