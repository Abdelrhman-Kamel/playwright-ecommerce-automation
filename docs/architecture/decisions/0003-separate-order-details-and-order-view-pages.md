# 0003 — Separate `OrderDetailsPage` and `OrderViewPage` Objects

## Status

Accepted

## Context

Two pages in the checkout/orders flow look superficially similar and could easily be assumed to be "the same page, just accessed two ways": the immediate post-checkout thank-you page, and the Orders → View detail page reached later from the orders list. Forcing them into one shared page object seemed like the more DRY choice at first glance.

Direct DOM inspection showed otherwise: they're genuinely different templates. The thank-you page shows order ID and a product-name cell; billing and delivery address details **only render on the Orders → View page**, not on the thank-you page at all — confirmed by checking both DOMs directly rather than assuming from visual similarity.

## Decision

Keep them as two separate page objects — `OrderDetailsPage` for the immediate post-checkout confirmation, `OrderViewPage` for the Orders → View detail page — rather than one page object trying to conditionally represent both.

## Consequences

- **Positive:** Each page object accurately represents what's actually on its page. Tests asserting on billing details correctly target `OrderViewPage`, not a shared object with fields that are sometimes undefined depending on which "mode" it's in.
- **Positive:** Avoids the common false-DRY failure mode — merging two things that look similar but aren't, producing a page object full of conditional logic and optional fields that's harder to reason about than two small, honest ones.
- **Trade-off:** Two files to maintain instead of one, and a newcomer has to learn which object corresponds to which page rather than there being one obvious "orders" page object. Worth it here because the underlying pages really are different, not an arbitrary split.
