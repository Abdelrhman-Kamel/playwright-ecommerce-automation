import { generateRegistrationData } from "./testData.js";

/**
 * Attempts registration up to `attempts` times, generating a FRESH unique
 * user each attempt — never resubmits the same email on retry. This
 * site's registration endpoint is a known source of external flakiness:
 * the form submits fine, but the "Account Created Successfully" modal
 * occasionally never renders in time (~30s), even though the account may
 * have actually been created server-side. Retrying with the SAME email in
 * that case would just fail differently ("already exists"), so each
 * attempt uses new, unique data instead.
 *
 * @param {object} options
 * @param {object} [options.overrides] - fixed fields (e.g. { gender: "Female" })
 *   merged over the generated random data, for tests that need a specific value.
 * @param {string} [options.tag] - optional extra uniqueness segment for the
 *   email (e.g. a worker index), useful when many callers may register
 *   concurrently and a plain attempt-number suffix alone isn't distinct enough.
 * @param {number} [options.attempts] - max attempts before giving up (default 3).
 * @returns the user object that actually succeeded.
 */
export async function registerWithRetry(
  loginPage,
  registerationPage,
  { overrides = {}, tag = "", attempts = 3 } = {},
) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const user = { ...generateRegistrationData(), ...overrides };
    const suffix = tag ? `${tag}.a${attempt}` : `a${attempt}`;
    user.email = user.email.replace("@test.com", `.${suffix}@test.com`);

    try {
      await registerationPage.register(
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
