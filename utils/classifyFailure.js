/**
 * Classifies a genuine test failure into exactly one bucket, based on the
 * real error message — same four classes discussed with Mohammed Rahman on
 * LinkedIn: env / data / selector / app-bug.
 *
 * Checked in priority order, first match wins — this is what guarantees
 * exactly one class per result. Never OR multiple classes together; if a
 * failure looks like it could match two patterns, that's a sign the
 * priority order (or the patterns themselves) need tightening, not a
 * reason to tag it twice.
 */
export function classifyFailure(errorMessage = "") {
  const msg = errorMessage;

  // env — external site flakiness, network-level failures, and
  // cross-platform rendering differences (font/antialiasing variance
  // between OSes) all belong here: none of these reflect a real defect
  // in the app under test or in the test's own logic.
  if (
    /socket hang up|ETIMEDOUT|ECONNRESET|net::ERR_/.test(msg) ||
    /Registration attempt.*failed|cached account stale/.test(msg) ||
    /pixels.*ratio.*of all image pixels.*are different/.test(msg)
  ) {
    return "env";
  }

  // selector — a locator that never resolved. Usually means the site's
  // markup shifted and a selector needs updating, not a real product bug.
  if (/waiting for (locator|selector)/.test(msg)) {
    return "selector";
  }

  // data — test data collisions or invalid fixture data (e.g. a
  // duplicate-email conflict that isn't the intentional "duplicate email"
  // test itself, or a malformed generated value).
  if (/already exists|invalid.*(email|value|data)/i.test(msg)) {
    return "data";
  }

  // app-bug — the fallback. Anything that doesn't match a known
  // infrastructure/data/selector pattern is treated as a genuine
  // application defect until shown otherwise.
  return "app-bug";
}
