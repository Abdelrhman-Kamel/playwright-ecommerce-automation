import js from "@eslint/js";
import globals from "globals";
import playwright from "eslint-plugin-playwright";

export default [
  {
    ignores: [
      "node_modules/",
      "allure-report/",
      "allure-results/",
      "playwright-report/",
      "test-results/",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ...playwright.configs["flat/recommended"],
    files: [
      "tests/**/*.js",
      "fixtures/**/*.js",
      "setup/**/*.js",
      "utils/**/*.js",
    ],
  },
  {
    // page.evaluate() callbacks run in the browser, so specs reference
    // browser globals like window/document.
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
];
