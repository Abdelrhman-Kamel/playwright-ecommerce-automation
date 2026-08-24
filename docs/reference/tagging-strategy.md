# Tagging Strategy

Tests are tagged so they can be selectively run — both locally via npm scripts and in CI.

| Tag            | Meaning                                                                                                                                                                       | Run via                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `@smoke`       | Core, high-value user journeys — the smallest set of tests that would catch a genuinely broken build                                                                          | `npm run test:smoke`                                                          |
| `@regression`  | The full tagged suite — broader coverage across all domains                                                                                                                   | `npm run test:regression`, and what both GitHub Actions and Jenkins run in CI |
| `@security`    | Security-specific tests (currently the IDOR authorization test)                                                                                                               | `npm run test:security`                                                       |
| `@known-issue` | Tests documenting a real, confirmed application bug via `test.fail()` — the test is _expected_ to fail, and CI treats that as a pass. See [Known Issues](../known-issues.md). |

A test can carry multiple tags — e.g. `full-journey.spec.js`'s tests are tagged both `@smoke` and `@regression`, since they're core journeys that also belong in the broader regression run.

## Allure integration

`fixtures/pageFixtures.js` includes an auto-fixture that reads each test's tags and maps them to Allure labels — `@smoke`/`@regression` become Allure epics, `@security` becomes an Allure feature, and `@known-issue` gets its own feature grouping plus a `minor` severity marker, so documented bugs are visually distinguishable in the report from an accidental unexpected failure. See [Allure Reporting](allure-reporting.md).
