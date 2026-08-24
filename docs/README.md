# Documentation

This folder holds everything beyond the root `README.md`'s quickstart — organized by what you're trying to do, not just dumped in one long file.

- **[Getting Started](getting-started.md)** — environment setup, `.env` variables, first run
- **Architecture**
  - **[Overview](architecture/overview.md)** — how the pieces fit together
  - **[Decisions](architecture/decisions/)** — why specific non-obvious choices were made, one file per decision
- **Guides** — task-oriented, "how do I..."
  - **[Writing a new test](guides/writing-a-new-test.md)**
  - **[Adding a page object](guides/adding-a-page-object.md)**
  - **[Debugging flaky tests](guides/debugging-flaky-tests.md)**
- **Reference** — information-oriented, look things up
  - **[Environment variables](reference/env-variables.md)**
  - **[npm scripts](reference/npm-scripts.md)**
  - **[Tagging strategy](reference/tagging-strategy.md)**
  - **[Allure reporting](reference/allure-reporting.md)**
- **[Known Issues](known-issues.md)** — real bugs found via automation

This structure follows [Diátaxis](https://diataxis.fr/) — docs organized by what the reader actually needs (learning vs. doing, practical vs. theoretical), not by what was convenient to write.
