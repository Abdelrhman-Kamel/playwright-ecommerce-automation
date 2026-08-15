import { test, expect } from "../../fixtures/pageFixtures";
import { ROUTES } from "../../constants/routes";

// ---------------------------------------------------------------------------
// Cart management — adding, removing, and navigating from the cart
// ---------------------------------------------------------------------------
test.describe("Cart management", { tag: ["@regression"] }, () => {
  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await homePage.products.first().waitFor();
  });

  // Remove any cart items left behind by the test that just ran.
  test.afterEach(async ({ page, cartPage }) => {
    await page.goto(ROUTES.cart, { waitUntil: "domcontentloaded" });
    await cartPage.clearCart();
  });

  test("adding two different products increments the cart badge to 2", async ({
    homePage,
    sideBar,
  }) => {
    const first = (
      await homePage.products.nth(0).locator("b").textContent()
    ).trim();
    const second = (
      await homePage.products.nth(1).locator("b").textContent()
    ).trim();

    await homePage.addProductToCart(first);
    await homePage.addProductToCart(second);

    await expect(sideBar.cartItemCount).toHaveText("2");
  });

  test("cart page shows subtotal and total price labels", async ({
    homePage,
    sideBar,
    cartPage,
  }) => {
    const productName = (
      await homePage.products.first().locator("b").textContent()
    ).trim();

    await homePage.addProductToCart(productName);
    await sideBar.navigateToCartPage();

    await expect(cartPage.subtotalPrice).toBeVisible();
    await expect(cartPage.totalPrice).toBeVisible();
  });

  test("cart item shows stock status", async ({
    homePage,
    sideBar,
    cartPage,
  }) => {
    const productName = (
      await homePage.products.first().locator("b").textContent()
    ).trim();

    await homePage.addProductToCart(productName);
    await sideBar.navigateToCartPage();

    await expect(cartPage.stockStatus.first()).toBeVisible();
  });

  test("cart page shows 'My Cart' heading", async ({
    homePage,
    sideBar,
    cartPage,
  }) => {
    const productName = (
      await homePage.products.first().locator("b").textContent()
    ).trim();

    await homePage.addProductToCart(productName);
    await sideBar.navigateToCartPage();

    await expect(cartPage.cartHeading).toBeVisible();
  });

  test("removing a product from the cart removes it from the list", async ({
    homePage,
    sideBar,
    cartPage,
  }) => {
    const productName = (
      await homePage.products.first().locator("b").textContent()
    ).trim();

    await homePage.addProductToCart(productName);
    await sideBar.navigateToCartPage();

    await cartPage.deleteProductFromCart(productName);

    await expect(cartPage.getCartItem(productName)).toHaveCount(0);
  });

  test("cart badge decrements after removing a product", async ({
    homePage,
    sideBar,
    cartPage,
  }) => {
    const first = (
      await homePage.products.nth(0).locator("b").textContent()
    ).trim();
    const second = (
      await homePage.products.nth(1).locator("b").textContent()
    ).trim();

    await homePage.addProductToCart(first);
    await homePage.addProductToCart(second);
    await sideBar.navigateToCartPage();

    await cartPage.deleteProductFromCart(first);

    await expect(sideBar.cartItemCount).toHaveText("1");
  });

  test("clicking 'Continue Shopping' from the cart returns to the dashboard", async ({
    page,
    homePage,
    sideBar,
    cartPage,
  }) => {
    const productName = (
      await homePage.products.first().locator("b").textContent()
    ).trim();

    await homePage.addProductToCart(productName);
    await sideBar.navigateToCartPage();

    await cartPage.continueShopping();

    await expect(page).toHaveURL(/.*\/#\/dashboard\/dash/);
    await expect(homePage.products.first()).toBeVisible();
  });

  test("checkout button is visible when the cart has items", async ({
    homePage,
    sideBar,
    cartPage,
  }) => {
    const productName = (
      await homePage.products.first().locator("b").textContent()
    ).trim();

    await homePage.addProductToCart(productName);
    await sideBar.navigateToCartPage();

    await expect(cartPage.checkoutButton).toBeVisible();
  });
});
