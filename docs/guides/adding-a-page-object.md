# Adding a New Page Object

## 1. Confirm it's actually a new page, not an existing one in disguise

Before creating a new file, check whether the page you're targeting is genuinely structurally different from an existing page object, or just looks similar. See [ADR 0003](../architecture/decisions/0003-separate-order-details-and-order-view-pages.md) for a real example of two pages that looked alike but weren't — and one case where the right call was two small objects, not one merged one.

## 2. Create the file under `pageObjects/`

One class per page or reusable component (e.g. `SideBar.js` is a component used across many pages, not tied to one).

```javascript
export class YourPage {
  constructor(page) {
    this.page = page;
    this.someElement = page.getByRole("button", { name: "Something" });
  }

  async someAction() {
    await this.someElement.click();
  }
}
```

## 3. Prefer semantic locators

`getByRole`, `getByText`, `getByPlaceholder` — in that rough order of preference. Fall back to CSS/attribute selectors only when the app's own markup doesn't give you anything semantic to grab onto, and leave a comment noting why (search existing page objects for examples of this pattern).

## 4. Register it in `POManager.js`

Add a getter following the existing pattern — all 9 existing getters (as of this writing) go through a shared `#getOrCreate(key, PageObjectClass)` private helper, so a new one is a one-line addition, not a repeated boilerplate block:

```javascript
getYourPage() {
  return this.#getOrCreate("yourPage", YourPage);
}
```

## 5. Wire it into the fixtures

Add the corresponding entry in `fixtures/pageFixtures.js` so tests can request it as a parameter (`{ yourPage }`) rather than reaching into `POManager` directly.

## 6. Write a test that actually uses it

A page object with no test coverage is dead code with extra steps — confirm it works against the real page before considering it done.
