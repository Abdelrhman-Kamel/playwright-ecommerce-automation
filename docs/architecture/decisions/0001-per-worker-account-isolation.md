# 0001 — Per-Worker Account Isolation

## Status

Accepted

## Context

Playwright runs tests in parallel across multiple workers. Early on, using one shared login account across all workers meant tests acting on cart/order state could race against each other — one test's `afterEach` cleanup could clear a cart another worker's test was mid-way through using, producing intermittent, hard-to-reproduce failures that had nothing to do with the actual feature being tested.

## Decision

`setup/globalSetup.js` registers a **separate, fresh account per worker**, before any test runs. Each worker's account is cached to a local file with a 24-hour staleness window, so repeat local runs don't pay the full registration cost every time — but even a cache hit re-clears that worker's cart/orders first, in case a previous run left it in an incomplete state.

Registration itself uses `utils/registerWithRetry.js`, which retries with **freshly generated credentials on each attempt** rather than resubmitting the same email — the registration endpoint is a known source of external flakiness (the "Account Created Successfully" modal occasionally doesn't render in time even when the account really was created), and retrying with the same email in that case just fails differently ("already exists") instead of actually recovering.

## Consequences

- **Positive:** Cross-worker test races on shared cart/order state are structurally impossible — each worker has its own account, its own cart, its own orders.
- **Positive:** Local development is fast after the first run (cached accounts), while CI always gets a clean environment (no persisted cache between CI runs).
- **Trade-off:** Slightly more complex setup than "one login for everything." A newcomer reading a test in isolation doesn't immediately see where their account came from — worth understanding this file first.
- **Trade-off:** `login.spec.js` specifically needs a **stable, pre-existing account** (its own tests exist to verify login itself works), which is why `LOGIN_USERNAME`/`LOGIN_PASSWORD` exist as separate, manually-provisioned env vars rather than using the auto-registered worker accounts.
