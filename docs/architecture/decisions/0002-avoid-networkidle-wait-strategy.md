# 0002 — Avoid `networkidle` as a Wait Strategy

## Status

Accepted

## Context

`waitForLoadState("networkidle")` is a common, tempting default for "wait until the page is really done loading" — it waits until there's been no network activity for a set window. On this site specifically, it proved unreliable: a persistent third-party banner/ad script keeps making background requests indefinitely, so the network genuinely never goes idle. Tests using `networkidle` either timed out waiting for a state that would never arrive, or (worse) occasionally resolved early on a lucky quiet moment that didn't actually mean the page was ready.

## Decision

Replace every `networkidle` wait with a wait tied to a **specific, meaningful outcome** — whichever one actually matters for that step:

- `waitFor()` on a specific element becoming visible
- `waitForURL()` for navigation completion
- `waitForResponse()` for a specific API call finishing
- Polling assertions (`expect().toHaveCount()`) for count-based state changes

## Consequences

- **Positive:** Zero hardcoded sleeps and zero reliance on a wait condition this specific site can't reliably satisfy.
- **Positive:** Each wait documents _what the test is actually waiting for_, which makes failures more diagnosable — a timeout on `waitForResponse(".../get-orders-for-customer/")` tells you exactly what didn't happen, where a generic `networkidle` timeout tells you nothing.
- **Trade-off:** More upfront thought per action — you have to identify the actual signal of "this step is done," rather than reaching for one wait strategy everywhere. In practice this paid off directly: it's the same discipline that surfaced the checkout visual-regression timing bug (a screenshot fired during a "Loading...." state before we added an explicit wait for the Place Order button) — a `networkidle`-based approach would likely have hidden that bug rather than exposing it.
