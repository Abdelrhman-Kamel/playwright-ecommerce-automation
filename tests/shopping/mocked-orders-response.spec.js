import { expect, request, test } from "@playwright/test";
import dotenv from "dotenv";
import { API_Utils } from "../../utils/API_Utils";

dotenv.config();

const loginPayLoad = {
  userEmail: process.env.SECURITY_TEST_EMAIL,
  userPassword: process.env.SECURITY_TEST_PASSWORD,
};
const fakeEmptyOrdersResponse = { data: [], message: "No Orders" };

let token;

test.beforeAll(async () => {
  const apiContext = await request.newContext({ ignoreHTTPSErrors: true });
  const api = new API_Utils(apiContext, loginPayLoad);

  // Just need a valid session — no real order, since the API response is
  // fully replaced below regardless of real data.
  token = await api.getToken();
});

test(
  "renders the empty orders state via a mocked API response (network interception)",
  { tag: ["@regression"] },
  async ({ page }) => {
    await page.addInitScript((value) => {
      window.localStorage.setItem("token", value);
    }, token);
    await page.goto("https://rahulshettyacademy.com/client/");

    // Replace the real orders response with a fake "no orders" payload,
    // whatever the account actually has — checks the frontend renders the
    // empty state instead of crashing on an unexpected data shape.
    await page.route(
      "https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*",
      async (route) => {
        const response = await page.request.fetch(route.request(), {
          ignoreHTTPSErrors: true,
        });
        await route.fulfill({
          response,
          body: JSON.stringify(fakeEmptyOrdersResponse),
        });
      },
    );

    await page
      .getByRole("listitem")
      .getByRole("button", { name: "ORDERS" })
      .click();
    await page.waitForResponse(
      "https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*",
    );
    await page.locator(".mt-4").waitFor();

    await expect(page.locator(".mt-4")).toContainText("No Orders");
  },
);
