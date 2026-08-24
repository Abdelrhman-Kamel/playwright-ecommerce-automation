# Getting Started

## Prerequisites

- Node.js (LTS)
- Java (required by Allure's report generator — `allure-commandline` runs on the JVM)

## Setup

```bash
git clone https://github.com/Abdelrhman-Kamel/playwright-ecommerce-automation.git
cd playwright-ecommerce-automation
npm install
```

Copy `.env.example` to `.env` and fill in real values — see [Environment Variables](reference/env-variables.md) for what each one does and why.

```bash
cp .env.example .env
```

## Running tests

```bash
npm test                    # full suite, all 3 browsers
npm run test:chromium       # chromium only — fastest local feedback loop
npm run test:smoke          # just the smoke suite
npm run test:regression     # the full tagged regression suite
npm run test:security       # just the security suite
npm run test:ui             # Playwright's interactive UI mode
npm run test:headed         # headed browser, useful for debugging
```

Full script list: [npm scripts reference](reference/npm-scripts.md).

## Viewing reports

```bash
npm run test:report         # Playwright's built-in HTML report
npm run allure:generate     # build the Allure report from the last run
npm run allure:open         # open it in your browser
```

More on what Allure adds beyond Playwright's default report: [Allure reporting reference](reference/allure-reporting.md).

## What to read next

- New to this codebase and want the big picture first? → [Architecture overview](architecture/overview.md)
- Adding a test? → [Writing a new test](guides/writing-a-new-test.md)
- Something's failing intermittently? → [Debugging flaky tests](guides/debugging-flaky-tests.md)
