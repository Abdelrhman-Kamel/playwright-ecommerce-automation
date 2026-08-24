# Writing a New Test

## 1. Pick the right file, or create one

Tests are organized by domain, not by type — a new checkout test goes in `tests/shopping/checkout.spec.js`, not a separate `e2e/` folder. If nothing fits, create a new spec file under the closest matching folder (`auth/`, `shopping/`, `security/`, `smoke/`).

## 2. Import from the custom fixtures, not `@playwright/test` directly

```javascript
import { test, expect } from "../../fixtures/pageFixtures";
```

This is what gives you access to page objects as test parameters (see below) and the per-worker authenticated session — importing straight from `@playwright/test` skips both.

## 3. Ask for the page objects you need as parameters

```javascript
test("some checkout behavior", async ({ page, checkoutPage, cartPage }) => {
  // ...
});
```

Available fixtures match `POManager`'s getters — check `pageObjects/POManager.js` for the full list, or [Adding a Page Object](adding-a-page-object.md) if what you need doesn't exist yet.

## 4. Prefer semantic locators already defined on the page object

Don't write raw `page.locator(".some-css-class")` inline in a test — add it to the relevant page object first, then use it from there. Keeps locator strategy centralized and consistent with the rest of the suite (see [Architecture Overview](../architecture/overview.md)).

## 5. Wait for outcomes, not arbitrary time

Never use `waitForTimeout()`. Use `waitFor()`, `waitForURL()`, `waitForResponse()`, or a polling `expect()` — see [ADR 0002](../architecture/decisions/0002-avoid-networkidle-wait-strategy.md) for why this matters specifically on this site.

## 6. Tag it correctly

Add the relevant tag(s) so it runs in the right CI/npm-script scope — see [Tagging Strategy](../reference/tagging-strategy.md).

## 7. If you find a real bug, don't delete the test

Document it with `test.fail()` and a specific message, matching the existing pattern (search the codebase for `@known-issue` to see examples) — see [Known Issues](../known-issues.md).

## 8. Run it in isolation before running the full suite

```bash
npx playwright test path/to/your.spec.js --project=chromium -g "your test name"
```

Faster feedback loop than waiting for the full 76-test run every time you iterate.
