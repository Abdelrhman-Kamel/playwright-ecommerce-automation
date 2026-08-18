import { ROUTES } from "../constants/routes.js";

export class SideBar {
  constructor(page) {
    this.page = page;
    this.homeButton = page.getByRole("button", { name: "HOME" });
    this.ordersButton = page.getByRole("button", { name: "ORDERS" });
    this.cartButton = page.locator('button[routerlink="/dashboard/cart"]');
    this.signOutButton = page.getByRole("button", { name: "Sign Out" });
    // cart badge showing the item count (a <label> inside the cart button)
    this.cartItemCount = page.locator(
      'button[routerlink="/dashboard/cart"] label',
    );
  }

  async navigateToHomePage() {
    await this.navigateAndWait(this.homeButton, ROUTES.home);
  }

  async navigateToOrderPage() {
    await this.navigateAndWait(this.ordersButton, ROUTES.orders);
  }

  async navigateToCartPage() {
    await this.navigateAndWait(this.cartButton, ROUTES.cart);
  }

  // click a button and wait for the URL to contain the route fragment.
  // State-independent — confirms navigation happened without assuming any
  // data is on the page.
  async navigateAndWait(button, routeFragment) {
    await button.click();
    await this.page.waitForURL((url) => url.href.includes(routeFragment));
  }

  async signOut() {
    await this.signOutButton.click();
    await this.page.waitForURL((url) => url.href.includes("/auth/login"));
  }
}
