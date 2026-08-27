# Debugging Flaky Tests

Real patterns encountered and resolved while building this suite — not hypothetical advice.

## First question: is it actually flaky, or a one-off?

Don't fix anything off a single failure. Rerun the exact same test first. This suite has real external-site flakiness (see below) that self-resolves on retry — chasing every single occurrence with a code change would mean fixing things that were never actually broken. The threshold used throughout this project: a genuinely new, unexplained failure gets investigated once it happens _again_, not on first occurrence, unless it comes with a concrete clue (see the checkout example below).

## Pattern: external site flakiness (registration, page loads)

The practice site this suite runs against has a known-flaky registration endpoint — the form submits, but the "Account Created Successfully" confirmation occasionally doesn't render within a normal timeout, even though the account may have been created anyway. `utils/registerWithRetry.js` handles this by retrying with **freshly generated credentials each attempt**, never resubmitting the same email (resubmitting just fails differently — "already exists" — instead of actually recovering).

If you see an unexplained timeout during account setup or general page navigation, check whether it self-resolves on a plain rerun before assuming it's a real bug.

## Pattern: `test.fail()` reporting as an unexpected hard failure

If a test correctly marked `test.fail()` still shows up as a genuine failure in CI (not the expected "documented known issue" outcome), check whether the underlying failure is a **timeout** rather than a clean assertion failure. Playwright only recognizes a `test.fail()` test as "expected" if its status is `failed` — a `timedOut` status doesn't count, even though both look like "the test didn't pass" to a human. If a wait inside the failing path has no explicit timeout, it can inherit the full default (30s) and eat the whole test's time budget, getting classified as `timedOut` instead of a fast, clean `failed`. Fix: give that specific wait an explicit, shorter timeout so a real failure surfaces quickly as `failed`, not slowly as `timedOut`.

## Pattern: visual regression "it passed before, fails now" (or vice versa)

Before assuming this is random flakiness, check whether the page has any of:

- **An animating/blinking element** (this site has one — a recruiter banner with class `blinkingText`) — mask it in the `toHaveScreenshot()` call rather than trying to time around it.
- **Content whose length varies per run** (e.g. a randomly-generated account email displayed on the page) — masking hides the _content_, but if that content's length affects page layout, elements below it can still shift position even when masked, since layout is calculated before the mask is drawn. A small `maxDiffPixelRatio` tolerance absorbs this; more masking doesn't fix it.
- **Content that's genuinely different per load, not just per-run** (e.g. a hero section that randomly rotates between multiple unrelated background/content variants) — this is a different category from the two above. Masking and tolerance solve _localized_ instability; they can't solve "half the page is randomly different content." The right call here may be to not run full-page visual comparison on that page at all, rather than weakening the check into something that no longer verifies anything real.

## Pattern: cross-platform visual regression baseline mismatches

`toHaveScreenshot()` baselines are platform-specific by filename (`-win32.png` vs. `-linux.png`) because font rendering differs between operating systems. A baseline generated locally on Windows won't exist for a Linux CI runner on first run — this is expected, not a bug, and shows up as "snapshot doesn't exist, writing actual" rather than a pixel-diff failure. Generate the missing platform's baseline from a real CI run's report (open it via `npx playwright show-report`, save the actual screenshot from a passing/correct run, place it in the matching `-snapshots/` folder) rather than guessing at what it should look like.

## Pattern: a fix works on one platform, not the other

If a mask or tolerance change is added but only one platform's baseline gets regenerated, the other platform will start failing — not because the fix is wrong, but because its baseline is now stale relative to the new `toHaveScreenshot()` call. Any change to what a screenshot call actually does requires regenerating **every** platform's baseline it applies to, not just whichever one you happen to run locally.

## General principle: verify against the real DOM before writing a selector

Several debugging sessions in this project's history were resolved not by guessing a fix, but by asking for the actual rendered HTML and checking a selector against it directly, rather than assuming a plausible-sounding class name is correct. When a locator-based test fails unexpectedly, get the real DOM before changing the selector.

## Pattern: intermittent unexplained layout shift, root cause not found

Not every flaky test has a clean, fully-diagnosed fix — worth documenting honestly when that happens rather than papering over it.

The checkout page's visual regression test went through several real, confirmed fixes (masking an animating banner, masking a variable-length account email plus a small pixel tolerance for its layout reflow, waiting for genuine render completion before the screenshot) — each one addressed a real, verified cause. Despite all of that, it continued to intermittently capture the page in a narrower, single-column layout (form fields that should render side-by-side collapsing into one column) even with an explicit `viewport: { width: 1920, height: 1080 }` set globally, no per-file override, and a confirmed-correct baseline.

No confident root cause was found — candidates considered but not confirmed included a CSS breakpoint evaluation race and CI-runner-specific window sizing, but none were verified against real evidence strong enough to justify a fix.

**Decision: removed the test rather than keep patching around an undiagnosed cause.** A test that fails unpredictably for reasons unrelated to real regressions actively erodes trust in CI — the point of automated checks is confidence, and a check that cries wolf for unknown reasons undermines that regardless of how many real bugs it might also catch. The page's functional tests (payment method display, order confirmation, billing address) still provide real coverage of what actually matters on this page; only the full-page pixel comparison was removed.

Worth revisiting if a genuine root cause surfaces later — this is a "not solved" entry, not a "doesn't matter" one.
