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
// Orders list and details
//
// Each test places its own order in beforeEach and cleans it up in
// afterEach — same pattern as checkout.spec.js and full-journey.spec.js.
// (This used to place one shared order in beforeAll, but beforeAll only
// gets WORKER-scoped fixtures; page/homePage/cartPage/checkoutPage/
// orderDetailsPage are test-scoped, built on the per-test `page`, so
// destructuring them in beforeAll throws at runtime — not just a style nit.)
// ---------------------------------------------------------------------------
test.describe("Orders management", { tag: ["@regression"] }, () => {
  let orderId;
  let productName;

  test.beforeEach(
    async ({
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

      productName = (
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

      orderId = await orderDetailsPage.getOrderId();

      await page.goto(ROUTES.orders, { waitUntil: "domcontentloaded" });
      await expect(ordersPage.pageHeading).toBeVisible();
    },
  );

  test.afterEach(async ({ page, ordersPage }) => {
    await page.goto(ROUTES.orders, { waitUntil: "domcontentloaded" });
    await ordersPage.clearOrders();
  });

  test("orders page shows the 'Your Orders' heading", async ({
    ordersPage,
  }) => {
    await expect(ordersPage.pageHeading).toBeVisible();
  });

  test("orders page lists at least one order", async ({ ordersPage }) => {
    await expect(ordersPage.orders.first()).toBeVisible();
  });

  test("the placed order appears in the orders list", async ({
    ordersPage,
  }) => {
    await expect(ordersPage.getOrderRow(orderId)).toBeVisible();
  });

  test("viewing an order navigates away from the orders list", async ({
    page,
    ordersPage,
  }) => {
    await ordersPage.viewOrderDetails(orderId);

    await expect(page).not.toHaveURL(/.*\/#\/dashboard\/myorders/);
  });

  test("order details page shows the purchased product name", async ({
    ordersPage,
    orderViewPage,
  }) => {
    await ordersPage.viewOrderDetails(orderId);

    await expect(orderViewPage.orderedProductName).toContainText(productName, {
      ignoreCase: true,
    });
  });

  test("order details page shows the product price", async ({
    ordersPage,
    orderViewPage,
  }) => {
    await ordersPage.viewOrderDetails(orderId);

    await expect(orderViewPage.orderedProductPrice).toBeVisible();
  });

  test("user can navigate back to orders from the order details page", async ({
    page,
    ordersPage,
    sideBar,
  }) => {
    await ordersPage.viewOrderDetails(orderId);
    await sideBar.navigateToOrderPage();

    await expect(ordersPage.pageHeading).toBeVisible();
    await expect(page).toHaveURL(/.*\/#\/dashboard\/myorders/);
  });
});

// ---------------------------------------------------------------------------
// Order deletion — self-contained: places then deletes its own order
// ---------------------------------------------------------------------------
test.describe("Orders - delete", { tag: ["@regression"] }, () => {
  // Clean up any order left behind if the test fails before deletion.
  test.afterEach(async ({ page, ordersPage }) => {
    await page.goto(ROUTES.orders, { waitUntil: "domcontentloaded" });
    await ordersPage.clearOrders();
  });

  test("user can delete an order and it is removed from the list", async ({
    page,
    homePage,
    sideBar,
    cartPage,
    checkoutPage,
    orderDetailsPage,
    ordersPage,
  }) => {
    // Place a fresh order just for this delete test.
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await homePage.products.first().waitFor();

    const toDeleteProduct = (
      await homePage.products.first().locator("b").textContent()
    ).trim();

    await homePage.addProductToCart(toDeleteProduct);
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

    const toDeleteId = await orderDetailsPage.getOrderId();

    await sideBar.navigateToOrderPage();

    await ordersPage.deleteOrder(toDeleteId);

    await expect(ordersPage.getOrderRow(toDeleteId)).toHaveCount(0);
  });
});
