# E2E Testing Rules

- Use `getByRole`, `getByLabel`, and `getByText` as primary locators. Use
  `getByTestId` only when accessibility attributes are ambiguous.
- Never use CSS selectors, XPath, DOM structure, or `waitForTimeout()`.
- Each test must be independently runnable with its own setup, assertion and
  cleanup. Use unique identifiers where records are created.
- Wait for observable state with web-first assertions, `waitForURL`, or
  `waitForResponse`.
- Assert the business outcome that would fail when the named risk materializes.
- Use the setup project's `storageState`; do not log in through the UI in
  individual tests.
- Keep internal boundaries (auth, routing, API and database) real.
