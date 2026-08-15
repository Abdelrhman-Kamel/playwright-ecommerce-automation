export class HomePage {
  constructor(page) {
    this.page = page;
    this.products = page.locator(".card-body");
    this.continueShoppingButton = page.getByRole("link", {
      name: "Continue Shopping",
    });

    // Assertion: price label inside each product card (class text-muted, no price-specific class)
    this.productPrice = page.locator(".card-body .text-muted");
    // Assertion: "Showing X results" count text (element has id="res")
    this.resultsCount = page.locator("#res");

    // Filter: search box
    this.searchInput = page.getByPlaceholder("search").last();
    // Filter: price range inputs
    this.minPriceInput = page.getByPlaceholder("Min Price").last();
    this.maxPriceInput = page.getByPlaceholder("Max Price").last();
    // Pagination: the ngx-pagination list next/previous items
    this.paginationNext = page.locator(".pagination-next a");
    this.paginationPrev = page.locator(".pagination-previous a");
  }

  // A shared product-card locator to reduce repetition.
  getProductCard(productName) {
    return this.products.filter({ hasText: productName }).first();
  }

  // Filter: returns the checkbox for a specific category, subcategory, or gender filter.
  // Uses label text matching since checkboxes share the same 'for' attribute value.
  getCategoryFilterCheckbox(filterName) {
    return this.page
      .locator(".form-group")
      .filter({ hasText: filterName })
      .locator('input[type="checkbox"]')
      .first();
  }

  async searchProduct(productName) {
    await this.searchInput.click();
    await this.searchInput.pressSequentially(productName);
    await Promise.all([
      this.page.waitForResponse((res) =>
        res.url().includes("/api/ecom/product/get-all-products"),
      ),
      this.searchInput.press("Enter"),
    ]);
  }

  async addProductToCart(productName) {
    // Optimization: remove unused counting and use the shared product-card helper.
    await Promise.all([
      this.page.waitForResponse((res) =>
        res.url().includes("/api/ecom/user/add-to-cart"),
      ),
      this.getProductCard(productName)
        .getByRole("button", { name: "Add To Cart" })
        .click(),
    ]);
  }

  async viewProductDetails(productName) {
    // Optimization: use direct filtering instead of a full manual scan loop.
    await this.getProductCard(productName)
      .getByRole("button", { name: "View" })
      .click();
    await this.continueShoppingButton.waitFor();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
    await this.products.first().waitFor();
  }
}
