# Allure Reporting

## Why Allure, in addition to Playwright's built-in report

Playwright's own HTML report is good for a single local run. Allure adds: trend history across runs, environment metadata, executor tracking (which CI run produced this report), and epic/feature grouping driven by test tags — see [Tagging Strategy](tagging-strategy.md).

## The two packages involved

- **`allure-playwright`** — a reporter registered in `playwright.config.js`. While tests run, it writes raw result data (`allure-results/*.json`) — one file per test, including status, timing, steps, and any custom labels.
- **`allure-commandline`** — a separate CLI tool (Java-based) that reads those raw files and generates the actual HTML report. This is what `npm run allure:generate` invokes locally, and what both CI pipelines invoke in their own way.

## Where the report lives on each platform

- **GitHub Actions** deploys the generated report to GitHub Pages on every run — see the live report link in the root README.
- **Jenkins** renders the report natively inside its own UI via the Allure Jenkins Plugin.

## Trend data across runs

Allure's Trend graph needs the previous run's `history/` folder carried into the next report generation. The Allure Jenkins Plugin manages this automatically. GitHub Pages deployments fully replace the site's content on every deploy, so there's no persistent storage holding that folder between runs — the GitHub Actions workflow works around this by fetching the previous run's `history/*.json` files directly from the live Pages site (which _is_ the last report) before generating the new one.

## Environment metadata

`setup/globalSetup.js` writes `allure-results/environment.properties`, including `Browsers=Chromium` (CI only ever runs Chromium — this value used to inaccurately claim three-browser coverage; see the project's commit history for the fix) and `Environment=CI` or `Local` depending on whether `CI` is set.
