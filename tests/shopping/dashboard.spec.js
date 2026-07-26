import { test, expect } from "../../fixtures/pageFixtures";
import { ROUTES } from "../../constants/routes";

// ---------------------------------------------------------------------------
// Shared setup — navigate to dashboard (already authenticated)
// ---------------------------------------------------------------------------
test.describe("Dashboard - Product listing", () => {
  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await homePage.products.first().waitFor();
  });

  test("products are displayed after login", async ({ homePage }) => {
    await expect(homePage.products.first()).toBeVisible();
  });

  test("multiple product cards are rendered", async ({ homePage }) => {
    const count = await homePage.products.count();
    expect(count).toBeGreaterThan(1);
  });

  test("each product card shows a price", async ({ homePage }) => {
    await expect(homePage.productPrice.first()).toBeVisible();
  });

  test("results count label is visible", async ({ homePage }) => {
    await expect(homePage.resultsCount).toBeVisible();
  });

  test("each product card has 'Add To Cart' and 'View' buttons", async ({
    homePage,
  }) => {
    const firstCard = homePage.products.first();
    await expect(
      firstCard.getByRole("button", { name: "Add To Cart" }),
    ).toBeVisible();
    await expect(firstCard.getByRole("button", { name: "View" })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------
test.describe("Dashboard - Search", () => {
  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await homePage.products.first().waitFor();
  });

  test("searching for a product filters the results", async ({
    page,
    homePage,
  }) => {
    const totalBefore = await homePage.products.count();

    await homePage.searchProduct("ZARA");

    await expect(homePage.products.first()).toBeVisible();
    const totalAfter = await homePage.products.count();
    expect(totalAfter).toBeLessThan(totalBefore);
  });

  test("search results only contain cards matching the query", async ({
    homePage,
  }) => {
    await homePage.searchProduct("ZARA");

    const count = await homePage.products.count();
    for (let i = 0; i < count; i++) {
      await expect(homePage.products.nth(i)).toContainText("ZARA", {
        ignoreCase: true,
      });
    }
  });

  test("clearing search restores all products", async ({ page, homePage }) => {
    const totalBefore = await homePage.products.count();

    await homePage.searchProduct("ZARA");
    await homePage.searchInput.clear();
    await Promise.all([
      page.waitForResponse((res) =>
        res.url().includes("/api/ecom/product/get-all-products"),
      ),
      homePage.searchInput.press("Enter"),
    ]);

    await expect(homePage.products).toHaveCount(totalBefore);
  });

  test("search is case-insensitive", async ({ homePage }) => {
    await homePage.searchProduct("zara");

    await expect(homePage.products.first()).toContainText("zara", {
      ignoreCase: true,
    });
  });
});

// ---------------------------------------------------------------------------
// Cart interactions
// ---------------------------------------------------------------------------
test.describe("Dashboard - Cart interactions", () => {
  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await homePage.products.first().waitFor();
  });

  test.afterEach(async ({ page, cartPage }) => {
    await page.goto(ROUTES.cart, { waitUntil: "domcontentloaded" });
    await cartPage.clearCart();
  });

  test("adding a product increments the cart badge", async ({
    homePage,
    sideBar,
  }) => {
    await homePage.addProductToCart(
      await homePage.products.first().locator("b").textContent(),
    );

    await expect(sideBar.cartItemCount).toHaveText("1");
  });

  test("added product appears in the cart", async ({
    homePage,
    sideBar,
    cartPage,
  }) => {
    const productName = await homePage.products
      .first()
      .locator("b")
      .textContent();

    await homePage.addProductToCart(productName);
    await sideBar.navigateToCartPage();

    await expect(cartPage.getCartItem(productName.trim())).toBeVisible();
  });

  test("cart page shows 'My Cart' heading", async ({
    homePage,
    sideBar,
    cartPage,
  }) => {
    const productName = await homePage.products
      .first()
      .locator("b")
      .textContent();

    await homePage.addProductToCart(productName);
    await sideBar.navigateToCartPage();

    await expect(cartPage.cartHeading).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Price range filter
// ---------------------------------------------------------------------------
test.describe("Dashboard - Price range filter", () => {
  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await homePage.products.first().waitFor();
  });

  test("price filter inputs are visible", async ({ homePage }) => {
    await expect(homePage.minPriceInput).toBeVisible();
    await expect(homePage.maxPriceInput).toBeVisible();
  });

  test("applying a price range filters the product list", async ({
    homePage,
  }) => {
    const totalBefore = await homePage.products.count();

    await homePage.minPriceInput.fill("10");
    await homePage.maxPriceInput.fill("50");
    await homePage.maxPriceInput.press("Enter");

    await expect(homePage.products.first()).toBeVisible();
    const totalAfter = await homePage.products.count();
    expect(totalAfter).toBeLessThanOrEqual(totalBefore);
  });
});

// ---------------------------------------------------------------------------
// Sidebar navigation
// ---------------------------------------------------------------------------
test.describe("Dashboard - Sidebar navigation", () => {
  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await homePage.products.first().waitFor();
  });

  test("navigating to Orders via sidebar lands on the orders page", async ({
    page,
    sideBar,
  }) => {
    await sideBar.navigateToOrderPage();

    await expect(page).toHaveURL(/.*\/#\/dashboard\/myorders/);
  });

  test("navigating to Cart via sidebar lands on the cart page", async ({
    page,
    sideBar,
  }) => {
    await sideBar.navigateToCartPage();

    await expect(page).toHaveURL(/.*\/#\/dashboard\/cart/);
  });

  test("navigating Home from Orders returns to the dashboard", async ({
    homePage,
    sideBar,
  }) => {
    await sideBar.navigateToOrderPage();
    await sideBar.navigateToHomePage();

    await expect(homePage.products.first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Product details
// ---------------------------------------------------------------------------
test.describe("Dashboard - Product details", () => {
  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await homePage.products.first().waitFor();
  });

  test("clicking View on a product navigates away from the dashboard", async ({
    page,
    homePage,
  }) => {
    const productName = await homePage.products
      .first()
      .locator("b")
      .textContent();

    await homePage.viewProductDetails(productName.trim());

    await expect(page).not.toHaveURL(/.*\/#\/dashboard\/dash/);
  });

  test("'Continue Shopping' returns to the dashboard", async ({
    page,
    homePage,
  }) => {
    const productName = await homePage.products
      .first()
      .locator("b")
      .textContent();

    await homePage.viewProductDetails(productName.trim());
    await homePage.continueShopping();

    await expect(page).toHaveURL(/.*\/#\/dashboard\/dash/);
    await expect(homePage.products.first()).toBeVisible();
  });
});
