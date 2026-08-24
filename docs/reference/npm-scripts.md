# npm Scripts Reference

| Script                    | What it does                                                                  |
| ------------------------- | ----------------------------------------------------------------------------- |
| `npm test`                | Full suite, all 3 configured browsers                                         |
| `npm run test:chromium`   | Chromium only — fastest local feedback loop                                   |
| `npm run test:smoke`      | Just tests tagged `@smoke`                                                    |
| `npm run test:regression` | Just tests tagged `@regression` (see [Tagging Strategy](tagging-strategy.md)) |
| `npm run test:security`   | Just tests tagged `@security`                                                 |
| `npm run test:ui`         | Playwright's interactive UI mode                                              |
| `npm run test:headed`     | Runs with a visible browser window, useful for debugging                      |
| `npm run test:report`     | Opens Playwright's built-in HTML report from the last run                     |
| `npm run allure:generate` | Builds the Allure report from the last run's `allure-results/`                |
| `npm run allure:open`     | Opens the generated Allure report in your browser                             |
| `npm run lint`            | Runs ESLint across the repo                                                   |
| `npm run format`          | Runs Prettier in check mode (does not auto-fix)                               |
| `npm run codegen`         | Launches Playwright's codegen tool against `$BASE_URL`                        |
