import { RegistrationPage } from "./RegistrationPage.js";
import { LoginPage } from "./LoginPage.js";
import { HomePage } from "./HomePage.js";
import { CartPage } from "./CartPage.js";
import { CheckoutPage } from "./CheckoutPage.js";
import { OrdersPage } from "./OrdersPage.js";
import { OrderDetailsPage } from "./OrderDetailsPage.js";
import { OrderViewPage } from "./OrderViewPage.js";
import { SideBar } from "./SideBar.js";

export class POManager {
  constructor(page) {
    this.page = page;
    // page objects are built lazily and cached, keyed by name
    this.pageObjects = {};
  }

  #getOrCreate(key, PageObjectClass) {
    if (!this.pageObjects[key]) {
      this.pageObjects[key] = new PageObjectClass(this.page);
    }
    return this.pageObjects[key];
  }

  getRegistrationPage() {
    return this.#getOrCreate("registrationPage", RegistrationPage);
  }

  getLoginPage() {
    return this.#getOrCreate("loginPage", LoginPage);
  }

  getHomePage() {
    return this.#getOrCreate("homePage", HomePage);
  }

  getCartPage() {
    return this.#getOrCreate("cartPage", CartPage);
  }

  getCheckoutPage() {
    return this.#getOrCreate("checkoutPage", CheckoutPage);
  }

  getOrdersPage() {
    return this.#getOrCreate("ordersPage", OrdersPage);
  }

  getSideBar() {
    return this.#getOrCreate("sideBar", SideBar);
  }

  getOrderDetailsPage() {
    return this.#getOrCreate("orderDetailsPage", OrderDetailsPage);
  }

  getOrderViewPage() {
    return this.#getOrCreate("orderViewPage", OrderViewPage);
  }
}
