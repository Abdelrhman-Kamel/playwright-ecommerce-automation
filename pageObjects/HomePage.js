export class HomePage {
  constructor(page) {
    this.page = page;
    this.products = page.locator(".card-body");
    this.continueShoppingButton = page.getByRole("link", {
      name: "Continue Shopping",
    });

    // price label inside each product card (.text-muted, no price-specific class)
    this.productPrice = page.locator(".card-body .text-muted");
    // "Showing X results" count text
    this.resultsCount = page.locator("#res");

    // search box
    this.searchInput = page.getByPlaceholder("search").last();
    // price range inputs
    this.minPriceInput = page.getByPlaceholder("Min Price").last();
    this.maxPriceInput = page.getByPlaceholder("Max Price").last();
    // ngx-pagination next / previous
    this.paginationNext = page.locator(".pagination-next a");
    this.paginationPrev = page.locator(".pagination-previous a");
  }

  // resolve a product card by name
  getProductCard(productName) {
    return this.products.filter({ hasText: productName }).first();
  }

  // checkbox for a category/subcategory/gender filter. Matches on label text
  // since the checkboxes all share the same 'for' attribute value.
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
