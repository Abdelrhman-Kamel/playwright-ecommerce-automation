import { expect } from "@playwright/test";

export class CartPage {
  constructor(page) {
    this.page = page;
    this.checkoutButton = page.locator("text=Checkout");
    this.cartItems = page.locator("li.items");
    this.continueShoppingButton = page.getByRole("button", {
      name: "Continue Shopping",
    });

    this.cartHeading = page.getByRole("heading", { name: "My Cart" });
    // stock status inside a cart item, e.g. "In Stock"
    this.stockStatus = page.locator(".stockStatus");
    // subtotal / total rows in the summary
    this.subtotalPrice = page
      .locator(".subtotal .totalRow")
      .nth(0)
      .locator(".value");
    this.totalPrice = page
      .locator(".subtotal .totalRow")
      .nth(1)
      .locator(".value");
  }

  // one place to resolve a cart item by product name
  getCartItem(productName) {
    return this.cartItems.filter({ hasText: productName }).first();
  }

  async checkout() {
    await this.checkoutButton.click();
    await this.page.locator("a.action__submit").waitFor();
  }

  async buyProduct(productName) {
    await this.getCartItem(productName)
      .getByRole("button", { name: "Buy Now" })
      .click();
    await this.page.waitForURL((url) => !url.href.includes("/dashboard/cart"));
  }

  async deleteProductFromCart(productName) {
    const cartItem = this.getCartItem(productName);
    await cartItem.locator("button.btn-danger").click();
    await cartItem.waitFor({ state: "detached" });
  }

  // clear the cart; no-op if it's already empty
  async clearCart() {
    while ((await this.cartItems.count()) > 0) {
      const countBefore = await this.cartItems.count();
      await this.cartItems.first().locator("button.btn-danger").click();
      await expect(this.cartItems).toHaveCount(countBefore - 1);
    }
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
    await this.page.locator(".card-body").first().waitFor();
  }
}
