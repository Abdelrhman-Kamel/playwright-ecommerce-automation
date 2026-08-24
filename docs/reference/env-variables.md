# Environment Variables

All required variables are documented in `.env.example` at the repo root. Copy it to `.env` and fill in real values before running anything.

| Variable                                                 | Purpose                                                                                                                                                                                                                                                            |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `BASE_URL`                                               | Base URL of the app under test                                                                                                                                                                                                                                     |
| `LOGIN_USERNAME` / `LOGIN_PASSWORD`                      | Stable, pre-existing account used only by `login.spec.js` — that flow needs an account that already exists, unlike the fresh accounts `globalSetup` registers for everything else. See [ADR 0001](../architecture/decisions/0001-per-worker-account-isolation.md). |
| `SECURITY_TEST_EMAIL` / `SECURITY_TEST_PASSWORD`         | Primary account for the security test suite's API calls                                                                                                                                                                                                            |
| `SECONDARY_ACCOUNT_EMAIL` / `SECONDARY_ACCOUNT_PASSWORD` | A second, distinct account used to test cross-account authorization boundaries                                                                                                                                                                                     |
| `CI`                                                     | Set automatically by GitHub Actions; set explicitly in the `Jenkinsfile` since Jenkins doesn't set it by default. Controls `playwright.config.js`'s retry count, worker count, and `forbidOnly`, and labels the Allure report's Environment as CI vs. Local.       |

## Where `BASE_URL` is actually used

`playwright.config.js`'s `baseURL` (for `page.goto()` navigation) and `utils/API_Utils.js` (for raw API calls, via `new URL(BASE_URL).origin` — API endpoints live at the domain root, while `BASE_URL` itself may include a navigation path, so only the origin is extracted, not the full string).
