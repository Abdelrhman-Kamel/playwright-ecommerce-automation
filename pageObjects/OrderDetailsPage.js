/**
 * The post-checkout "Thankyou for the order" page. Different page/template
 * from the order detail page reached via Orders -> View (OrderViewPage.js) —
 * billing/delivery address lives there, not here.
 */
export class OrderDetailsPage {
  constructor(page) {
    this.page = page;

    // confirmation message shown after a successful order
    this.thankYouMessage = page.getByText("THANKYOU FOR THE ORDER.");

    // the placed order ID
    this.orderIdText = page.locator("td.em-spacer-1 label").last();

    // back to the orders list from the confirmation page
    this.viewOrdersButton = page.locator(
      'div[routerlink="/dashboard/myorders"]',
    );
  }

  // The confirmation table wraps each product in several nested <td>s
  // (content-wrap > order-summary-box > line-item), and hasText matches
  // ancestors too — so filtering on "Qty:" alone hit all three levels
  // (strict mode violation). .line-item.product-info-column is the actual
  // innermost cell class, from the real DOM.
  getProductNameCell(productName) {
    return this.page
      .locator("td.line-item.product-info-column")
      .filter({ hasText: productName });
  }

  async getOrderId() {
    await this.orderIdText.waitFor();
    const raw = await this.orderIdText.textContent();
    return raw.replace(/\|/g, "").trim();
  }
}
