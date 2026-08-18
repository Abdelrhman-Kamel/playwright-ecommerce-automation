/**
 * The order detail page reached via Orders -> View. Separate page/template
 * from the post-checkout thank-you page (OrderDetailsPage.js) — billing and
 * delivery address only render here (checked against the real DOM).
 */
export class OrderViewPage {
  constructor(page) {
    this.page = page;

    // Assertion: billing and delivery address sections
    this.billingSection = page.locator(".address").filter({
      has: page.getByText("Billing Address"),
    });
    this.deliverySection = page.locator(".address").filter({
      has: page.getByText("Delivery Address"),
    });

    // Only one product card renders per order here, so a plain class-based
    // locator is enough — unlike the thank-you page's nested table, which
    // needed hasText filtering to disambiguate.
    this.productCard = page.locator(".artwork-card");
    this.orderedProductName = this.productCard.locator(".title");
    this.orderedProductPrice = this.productCard.locator(".price");
  }

  async getBillingDetails() {
    await this.billingSection.waitFor();

    const [email, country] = await this.billingSection
      .locator("p")
      .allTextContents();

    return {
      email: email.trim(),
      country: country.replace("Country - ", "").trim(),
    };
  }

  async getDeliveryDetails() {
    await this.deliverySection.waitFor();

    const [email, country] = await this.deliverySection
      .locator("p")
      .allTextContents();

    return {
      email: email.trim(),
      country: country.replace("Country - ", "").trim(),
    };
  }
}
