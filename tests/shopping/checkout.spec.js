import { test, expect } from "../../fixtures/pageFixtures";
import { ROUTES } from "../../constants/routes";
import AxeBuilder from "@axe-core/playwright";

const CHECKOUT = {
  cardNumber: "4542 9931 9292 2293",
  month: "01",
  year: "28",
  cvv: "123",
  nameOnCard: "Test User",
  country: "Egypt",
};

// ---------------------------------------------------------------------------
// Shared setup — add a product to cart and proceed to checkout
// ---------------------------------------------------------------------------
test.describe("Checkout flow", { tag: ["@regression"] }, () => {
  let productName;

  test.beforeEach(async ({ page, homePage, sideBar, cartPage }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await homePage.products.first().waitFor();

    productName = (
      await homePage.products.first().locator("b").textContent()
    ).trim();

    await homePage.addProductToCart(productName);
    await sideBar.navigateToCartPage();
    await cartPage.checkout();
  });

  test.afterEach(async ({ page, cartPage, ordersPage }) => {
    await page.goto(ROUTES.cart, { waitUntil: "domcontentloaded" });
    await cartPage.clearCart();
    await page.goto(ROUTES.orders, { waitUntil: "domcontentloaded" });
    await ordersPage.clearOrders();
  });

  test("checkout page shows credit card payment method", async ({
    checkoutPage,
  }) => {
    await expect(checkoutPage.paymentMethodCreditCard).toBeVisible();
  });

  test("checkout page shows all payment method options", async ({
    checkoutPage,
  }) => {
    await expect(checkoutPage.paymentMethodCreditCard).toBeVisible();
    await expect(checkoutPage.paymentMethodPaypal).toBeVisible();
    await expect(checkoutPage.paymentMethodSepa).toBeVisible();
    await expect(checkoutPage.paymentMethodInvoice).toBeVisible();
  });

  test("checkout page shows all credit card form fields", async ({
    checkoutPage,
  }) => {
    await expect(checkoutPage.creditCardInput).toBeVisible();
    await expect(checkoutPage.cvvInput).toBeVisible();
    await expect(checkoutPage.nameOnCardInput).toBeVisible();
    await expect(checkoutPage.countryInput).toBeVisible();
  });

  test("placing an order shows the thank-you confirmation message", async ({
    checkoutPage,
    orderDetailsPage,
  }) => {
    await checkoutPage.fillCreditCardDetails(
      CHECKOUT.cardNumber,
      CHECKOUT.month,
      CHECKOUT.year,
      CHECKOUT.cvv,
      CHECKOUT.nameOnCard,
    );
    await checkoutPage.selectCountry(CHECKOUT.country);
    await checkoutPage.placeOrder();

    await expect(orderDetailsPage.thankYouMessage).toBeVisible();
  });

  test("order confirmation page shows a non-empty order ID", async ({
    checkoutPage,
    orderDetailsPage,
  }) => {
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
    expect(orderId).toBeTruthy();
  });

  test("order confirmation shows the purchased product name", async ({
    checkoutPage,
    orderDetailsPage,
  }) => {
    await checkoutPage.fillCreditCardDetails(
      CHECKOUT.cardNumber,
      CHECKOUT.month,
      CHECKOUT.year,
      CHECKOUT.cvv,
      CHECKOUT.nameOnCard,
    );
    await checkoutPage.selectCountry(CHECKOUT.country);
    await checkoutPage.placeOrder();

    // getProductNameCell is filtered by productName already, so we assert
    // visibility rather than re-checking the text — that would just be
    // testing our own filter. It's a method (not a static property) because
    // it needs productName to find the right row when an order has more than
    // one product.
    await expect(
      orderDetailsPage.getProductNameCell(productName),
    ).toBeVisible();
  });

  test("order confirmation shows billing address with selected country", async ({
    page,
    checkoutPage,
    orderDetailsPage,
    ordersPage,
    orderViewPage,
  }) => {
    await checkoutPage.fillCreditCardDetails(
      CHECKOUT.cardNumber,
      CHECKOUT.month,
      CHECKOUT.year,
      CHECKOUT.cvv,
      CHECKOUT.nameOnCard,
    );
    await checkoutPage.selectCountry(CHECKOUT.country);
    await checkoutPage.placeOrder();

    // Billing/delivery address only renders on the Orders -> View page, not
    // on this thank-you page (checked both DOMs). Go there first.
    const orderId = await orderDetailsPage.getOrderId();
    await page.goto(ROUTES.orders, { waitUntil: "domcontentloaded" });
    await ordersPage.viewOrderDetails(orderId);

    const billing = await orderViewPage.getBillingDetails();
    expect(billing.country).toContain(CHECKOUT.country);
  });

  test("visual regression: checkout page layout", async ({
    page,
    checkoutPage,
  }) => {
    await checkoutPage.fillCreditCardDetails(
      CHECKOUT.cardNumber,
      CHECKOUT.month,
      CHECKOUT.year,
      CHECKOUT.cvv,
      CHECKOUT.nameOnCard,
    );
    await checkoutPage.selectCountry(CHECKOUT.country);

    await checkoutPage.placeOrderButton.waitFor();

    await expect(page).toHaveScreenshot("checkout-page.png", {
      mask: [page.locator(".blinkingText"), page.locator(".details__user")],
      maxDiffPixelRatio: 0.02,
    });
  });

  test("accessibility: checkout page has no WCAG 2.1 AA violations", async ({
    page,
    checkoutPage,
  }) => {
    test.fail(
      true,
      "Bug found via automation: checkout form inputs and dropdowns have no labels, plus color-contrast failures on banner/price/payment options/place-order button — axe rules 'label', 'select-name', 'color-contrast', WCAG 2.1 AA.",
    );
    await checkoutPage.fillCreditCardDetails(
      CHECKOUT.cardNumber,
      CHECKOUT.month,
      CHECKOUT.year,
      CHECKOUT.cvv,
      CHECKOUT.nameOnCard,
    );
    await checkoutPage.selectCountry(CHECKOUT.country);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
