import { expect } from "@playwright/test";

export class OrdersPage {
  constructor(page) {
    this.page = page;
    this.orders = page.locator("tbody").locator("tr");
    this.goBackToShopButton = page.getByRole("button", {
      name: "Go Back To Shop",
    });
    this.goBackToCartButton = page.getByRole("button", {
      name: "Go Back To Cart",
    });
    // Assertion: orders page heading
    this.pageHeading = page.getByRole("heading", { name: "Your Orders" });
  }

  // one place to resolve an order row by ID
  getOrderRow(orderId) {
    return this.orders.filter({ hasText: orderId }).first();
  }

  // product name, price, and date for a given order row
  async getOrderDetails(orderId) {
    const row = this.getOrderRow(orderId);
    return {
      productName: await row.locator("td").nth(1).textContent(),
      price: await row.locator("td").nth(2).textContent(),
      date: await row.locator("td").nth(3).textContent(),
    };
  }

  async viewOrderDetails(orderId) {
    const row = this.getOrderRow(orderId);
    await row.getByRole("button", { name: "View" }).click();
  }

  async deleteOrder(orderId) {
    const row = this.getOrderRow(orderId);
    // Wait for the row to actually render before counting — goToOrders()
    // only waits for the URL to change, not for the orders table to finish
    // fetching/rendering. Counting too early can catch an empty table and
    // grab the wrong baseline.
    await row.waitFor({ state: "visible" });
    const countBefore = await this.orders.count();
    await row.getByRole("button", { name: "Delete" }).click();
    await expect(this.orders).toHaveCount(countBefore - 1);
  }

  // clear the orders list; no-op if it's already empty
  async clearOrders() {
    while ((await this.orders.count()) > 0) {
      const countBefore = await this.orders.count();
      await this.orders.first().getByRole("button", { name: "Delete" }).click();
      await expect(this.orders).toHaveCount(countBefore - 1);
    }
  }

  async goBackToShop() {
    await this.goBackToShopButton.click();
    await this.page.locator(".card-body").first().waitFor();
  }

  async goBackToCart() {
    await this.goBackToCartButton.click();
    await this.page.waitForURL((url) => url.href.includes("/dashboard/cart"));
  }
}
