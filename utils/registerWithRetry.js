import { test } from "@playwright/test";
import { generateRegistrationData } from "./testData.js";

/**
 * Registers up to `attempts` times, generating a FRESH unique user each
 * time — never resubmits the same email on retry. This site's registration
 * endpoint is externally flaky: the form submits fine, but the "Account
 * Created Successfully" modal sometimes never renders in time (~30s), even
 * though the account may have been created server-side. Retrying the same
 * email would then just fail as "already exists", so each attempt uses new
 * data instead.
 *
 * @param {object} options
 * @param {object} [options.overrides] - fixed fields (e.g. { gender: "Female" })
 *   merged over the generated data, for tests that need a specific value.
 * @param {string} [options.tag] - extra uniqueness segment for the email
 *   (e.g. a worker index), for when many callers register concurrently and
 *   the attempt-number suffix alone isn't distinct enough.
 * @param {number} [options.attempts] - max attempts before giving up (default 3).
 * @returns the user object that succeeded.
 */
export async function registerWithRetry(
  loginPage,
  registrationPage,
  { overrides = {}, tag = "", attempts = 3 } = {},
) {
  // Each attempt can take ~30s (waiting on the flaky modal) plus fill/submit
  // time. Budget the worst case plus a buffer so a full set of genuine
  // failures throws the real error, instead of the harness killing the test
  // mid-action (which surfaces as a confusing "page has been closed"). In a
  // try/catch because globalSetup.js also calls this outside any test()
  // context, where test.setTimeout() throws.
  try {
    test.setTimeout(attempts * 35_000 + 20_000);
  } catch {
    // not inside a test (e.g. globalSetup) — no test timeout to extend
  }

  for (let attempt = 1; attempt <= attempts; attempt++) {
    // A failed attempt can leave the form half-submitted or in an error
    // state, so restart each retry from a freshly reloaded page instead of
    // re-filling on top of the poisoned one.
    if (attempt > 1) {
      await registrationPage.page.reload({ waitUntil: "domcontentloaded" });
      await registrationPage.registerButton.waitFor();
    }

    const user = { ...generateRegistrationData(), ...overrides };
    const suffix = tag ? `${tag}.a${attempt}` : `a${attempt}`;
    user.email = user.email.replace("@test.com", `.${suffix}@test.com`);

    try {
      await registrationPage.register(
        user.firstName,
        user.lastName,
        user.email,
        user.phone,
        user.occupation,
        user.gender,
        user.password,
      );
      return user;
    } catch (error) {
      if (attempt === attempts) throw error;
      console.log(
        `Registration attempt ${attempt} failed, retrying with a new account...`,
      );
    }
  }
}
