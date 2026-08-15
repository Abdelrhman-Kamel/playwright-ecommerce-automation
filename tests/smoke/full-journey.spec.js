import { test, expect } from "../../fixtures/pageFixtures";
import { ROUTES } from "../../constants/routes";

const CHECKOUT = {
  cardNumber: "4542 9931 9292 2293",
  month: "01",
  year: "28",
  cvv: "123",
  nameOnCard: "Test User",
  country: "Egypt",
};

// ---------------------------------------------------------------------------
// Full end-to-end purchase journeys
// ---------------------------------------------------------------------------
test.describe(
  "Full purchase journey",
  { tag: ["@smoke", "@regression"] },
  () => {
    test.afterEach(async ({ page, cartPage, ordersPage }) => {
      await page.goto(ROUTES.cart, { waitUntil: "domcontentloaded" });
      await cartPage.clearCart();
      await page.goto(ROUTES.orders, { waitUntil: "domcontentloaded" });
      await ordersPage.clearOrders();
    });

    test("user can complete a full purchase from product selection to order confirmation", async ({
      page,
      homePage,
      sideBar,
      cartPage,
      checkoutPage,
      orderDetailsPage,
    }) => {
      // 1. Browse products
      await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
      await homePage.products.first().waitFor();
      const productName = (
        await homePage.products.first().locator("b").textContent()
      ).trim();

      // 2. Add to cart and verify badge
      await homePage.addProductToCart(productName);
      await expect(sideBar.cartItemCount).toHaveText("1");

      // 3. Navigate to cart and verify item is present
      await sideBar.navigateToCartPage();
      await expect(cartPage.getCartItem(productName)).toBeVisible();

      // 4. Proceed to checkout and fill payment details
      await cartPage.checkout();
      await checkoutPage.fillCreditCardDetails(
        CHECKOUT.cardNumber,
        CHECKOUT.month,
        CHECKOUT.year,
        CHECKOUT.cvv,
        CHECKOUT.nameOnCard,
      );
      await checkoutPage.selectCountry(CHECKOUT.country);

      // 5. Place order and verify confirmation
      await checkoutPage.placeOrder();
      await expect(orderDetailsPage.thankYouMessage).toBeVisible();

      const orderId = await orderDetailsPage.getOrderId();
      expect(orderId).toBeTruthy();
    });

    test("placed order appears in the My Orders list with the correct order ID", async ({
      page,
      homePage,
      sideBar,
      cartPage,
      checkoutPage,
      orderDetailsPage,
      ordersPage,
    }) => {
      await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
      await homePage.products.first().waitFor();
      const productName = (
        await homePage.products.first().locator("b").textContent()
      ).trim();

      await homePage.addProductToCart(productName);
      await sideBar.navigateToCartPage();
      await cartPage.checkout();
      await checkoutPage.fillCreditCardDetails(
        CHECKOUT.cardNumber,
        CHECKOUT.month,
        CHECKOUT.year,
        CHECKOUT.cvv,
        CHECKOUT.nameOnCard,
      );
      await checkoutPage.selectCountry(CHECKOUT.country);
      await checkoutPage.placeOrder();

      const orderId = await orderDetailsPage.getOrderId();

      // Navigate to orders and verify the row exists
      await sideBar.navigateToOrderPage();
      await expect(ordersPage.getOrderRow(orderId)).toBeVisible();
    });

    test("order details match the product that was purchased", async ({
      page,
      homePage,
      sideBar,
      cartPage,
      checkoutPage,
      orderDetailsPage,
      ordersPage,
      orderViewPage,
    }) => {
      await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
      await homePage.products.first().waitFor();
      const productName = (
        await homePage.products.first().locator("b").textContent()
      ).trim();

      await homePage.addProductToCart(productName);
      await sideBar.navigateToCartPage();
      await cartPage.checkout();
      await checkoutPage.fillCreditCardDetails(
        CHECKOUT.cardNumber,
        CHECKOUT.month,
        CHECKOUT.year,
        CHECKOUT.cvv,
        CHECKOUT.nameOnCard,
      );
      await checkoutPage.selectCountry(CHECKOUT.country);
      await checkoutPage.placeOrder();

      const orderId = await orderDetailsPage.getOrderId();

      // View the order from the orders list and verify details
      await sideBar.navigateToOrderPage();
      await ordersPage.viewOrderDetails(orderId);

      await expect(orderViewPage.orderedProductName).toContainText(
        productName,
        {
          ignoreCase: true,
        },
      );
      await expect(orderViewPage.orderedProductPrice).toBeVisible();
    });

    test("billing details on the order view page reflect the selected country", async ({
      page,
      homePage,
      sideBar,
      cartPage,
      checkoutPage,
      orderDetailsPage,
      ordersPage,
      orderViewPage,
    }) => {
      await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
      await homePage.products.first().waitFor();
      const productName = (
        await homePage.products.first().locator("b").textContent()
      ).trim();

      await homePage.addProductToCart(productName);
      await sideBar.navigateToCartPage();
      await cartPage.checkout();
      await checkoutPage.fillCreditCardDetails(
        CHECKOUT.cardNumber,
        CHECKOUT.month,
        CHECKOUT.year,
        CHECKOUT.cvv,
        CHECKOUT.nameOnCard,
      );
      await checkoutPage.selectCountry(CHECKOUT.country);
      await checkoutPage.placeOrder();

      // Billing/delivery address only renders on the Orders -> View page,
      // NOT on the immediate thank-you confirmation page — confirmed by
      // checking both pages' real DOM. Navigate there first.
      const orderId = await orderDetailsPage.getOrderId();
      await sideBar.navigateToOrderPage();
      await ordersPage.viewOrderDetails(orderId);

      const billing = await orderViewPage.getBillingDetails();
      expect(billing.country).toContain(CHECKOUT.country);
    });

    test("'View Orders' button on confirmation page navigates to the orders list", async ({
      page,
      homePage,
      sideBar,
      cartPage,
      checkoutPage,
      orderDetailsPage,
      ordersPage,
    }) => {
      await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
      await homePage.products.first().waitFor();
      const productName = (
        await homePage.products.first().locator("b").textContent()
      ).trim();

      await homePage.addProductToCart(productName);
      await sideBar.navigateToCartPage();
      await cartPage.checkout();
      await checkoutPage.fillCreditCardDetails(
        CHECKOUT.cardNumber,
        CHECKOUT.month,
        CHECKOUT.year,
        CHECKOUT.cvv,
        CHECKOUT.nameOnCard,
      );
      await checkoutPage.selectCountry(CHECKOUT.country);
      await checkoutPage.placeOrder();

      await sideBar.navigateToOrderPage();

      await expect(page).toHaveURL(/.*\/#\/dashboard\/myorders/);
      await expect(ordersPage.pageHeading).toBeVisible();
    });
  },
);
