import { expect, request, test } from "@playwright/test";
import dotenv from "dotenv";
import { API_Utils } from "../../utils/API_Utils";

dotenv.config();

const primaryLoginPayLoad = {
  userEmail: process.env.SECURITY_TEST_EMAIL,
  userPassword: process.env.SECURITY_TEST_PASSWORD,
};
const secondaryLoginPayLoad = {
  userEmail: process.env.SECONDARY_ACCOUNT_EMAIL,
  userPassword: process.env.SECONDARY_ACCOUNT_PASSWORD,
};
const createOrderPayload = {
  orders: [
    { country: "Antarctica", productOrderedId: "6960eae1c941646b7a8b3ed3" },
  ],
};

let token;
let foreignOrderId;

test.beforeAll(async () => {
  const apiContext = await request.newContext({ ignoreHTTPSErrors: true });

  // Primary account: the one that will attempt the unauthorized access.
  // Needs a real order of its own first, just so there's a "View" button
  // to click — its own order's ID isn't used directly below.
  const primaryApi = new API_Utils(apiContext, primaryLoginPayLoad);
  await primaryApi.createOrder(createOrderPayload);
  token = await primaryApi.getToken();

  // Secondary account: owns a genuinely separate order, created fresh
  // here rather than hardcoded to a specific pre-existing ID — removes
  // the dependency on an external, uncontrolled account/order this test
  // doesn't own and can't guarantee still exists.
  const secondaryApi = new API_Utils(apiContext, secondaryLoginPayLoad);
  foreignOrderId = await secondaryApi.createOrder(createOrderPayload);
});

test(
  "user cannot view another account's order details via a tampered request",
  { tag: ["@security", "@regression"] },
  async ({ page }) => {
    await page.addInitScript((value) => {
      window.localStorage.setItem("token", value);
    }, token);
    await page.goto("https://rahulshettyacademy.com/client/");

    await page
      .getByRole("listitem")
      .getByRole("button", { name: "ORDERS" })
      .click();

    // Intercept the "get order details" request and redirect it to the
    // secondary account's order ID — simulates a user tampering with the
    // request to try to view an order that isn't theirs.
    await page.route(
      "https://rahulshettyacademy.com/api/ecom/order/get-orders-details?id=*",
      (route) =>
        route.continue({
          url: `https://rahulshettyacademy.com/api/ecom/order/get-orders-details?id=${foreignOrderId}`,
        }),
    );

    await page.locator("button").filter({ hasText: "View" }).first().click();

    await expect(page.locator("p.blink_me")).toHaveText(
      "You are not authorize to view this order",
    );
  },
);
