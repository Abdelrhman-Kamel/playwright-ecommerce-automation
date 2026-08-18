/**
 * Route paths for the app under test. Used with `baseURL` from
 * playwright.config.js via page.goto(ROUTES.x). One place to update when a
 * route changes, instead of every spec that navigates to it.
 */
export const ROUTES = {
  login: "#/auth/login",
  register: "#/auth/register",
  home: "#/dashboard/dash",
  cart: "#/dashboard/cart",
  orders: "#/dashboard/myorders",
};
