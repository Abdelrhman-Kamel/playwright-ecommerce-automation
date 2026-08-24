# Known Issues (Found via Automation)

Real application defects discovered while building this suite — not pre-known bugs, but issues the automation itself caught. All are documented in code via Playwright's `test.fail()` annotation: the tests still run every time, a failure is the _expected_, tracked outcome, and the suite would immediately flag it if any of these were ever silently fixed. See [Tagging Strategy](reference/tagging-strategy.md) for how `@known-issue` integrates with CI and Allure.

## Functional bugs

1. **Login is case-sensitive on email** — most platforms treat email as case-insensitive for login; this one requires an exact case match against how the account was originally registered.
2. **Product search doesn't match case-insensitively** — searching a lowercase term returns zero results even when a matching product exists with different casing.

## Accessibility audit (WCAG 2.1 AA)

`@axe-core/playwright` scans run across the login, dashboard, cart, and checkout pages. Every page failed, split across two categories:

| Category                                                                    | Impact                                                                    | Found on    | Example                                                                                                                                                                                                   |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Missing accessible names (`label`, `select-name`, `image-alt`, `link-name`) | **Critical/Serious** — screen readers announce nothing for these elements | All 4 pages | Checkout's credit card, name, and coupon inputs have no `<label>`; product images have no `alt` text; social media icons have no accessible text                                                          |
| Insufficient color contrast (`color-contrast`)                              | **Serious**                                                               | All 4 pages | The site-wide "Get Shortlisted by Recruiters" banner — confirmed manually, and additionally animates/blinks without a way to pause it (a separate WCAG 2.2.2 concern automated scans don't fully capture) |

The missing-accessible-names findings are the more severe of the two — a screen reader user filling out the checkout form would hear "edit text" with no indication of which field is which.

## A known limitation of the current accessibility tests

These tests assert `results.violations` is empty, rather than checking specific violation IDs. That means if the _documented_ violation above were fixed but a _different, new_ violation appeared, the test would still just read as "failing as expected" — the existing known-issue message wouldn't distinguish a genuine regression from the tracked one. Worth tightening eventually by asserting on specific rule IDs; not done yet.
