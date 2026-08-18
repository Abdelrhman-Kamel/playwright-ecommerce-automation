import { RegisterationPage } from "./RegisterationPage.js";
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

  getRegisterationPage() {
    if (!this.pageObjects.registerationPage) {
      this.pageObjects.registerationPage = new RegisterationPage(this.page);
    }
    return this.pageObjects.registerationPage;
  }

  getLoginPage() {
    if (!this.pageObjects.loginPage) {
      this.pageObjects.loginPage = new LoginPage(this.page);
    }
    return this.pageObjects.loginPage;
  }

  getHomePage() {
    if (!this.pageObjects.homePage) {
      this.pageObjects.homePage = new HomePage(this.page);
    }
    return this.pageObjects.homePage;
  }

  getCartPage() {
    if (!this.pageObjects.cartPage) {
      this.pageObjects.cartPage = new CartPage(this.page);
    }
    return this.pageObjects.cartPage;
  }

  getCheckoutPage() {
    if (!this.pageObjects.checkoutPage) {
      this.pageObjects.checkoutPage = new CheckoutPage(this.page);
    }
    return this.pageObjects.checkoutPage;
  }

  getOrdersPage() {
    if (!this.pageObjects.ordersPage) {
      this.pageObjects.ordersPage = new OrdersPage(this.page);
    }
    return this.pageObjects.ordersPage;
  }

  getSideBar() {
    if (!this.pageObjects.sideBar) {
      this.pageObjects.sideBar = new SideBar(this.page);
    }
    return this.pageObjects.sideBar;
  }

  getOrderDetailsPage() {
    if (!this.pageObjects.orderDetailsPage) {
      this.pageObjects.orderDetailsPage = new OrderDetailsPage(this.page);
    }
    return this.pageObjects.orderDetailsPage;
  }

  getOrderViewPage() {
    if (!this.pageObjects.orderViewPage) {
      this.pageObjects.orderViewPage = new OrderViewPage(this.page);
    }
    return this.pageObjects.orderViewPage;
  }
}
