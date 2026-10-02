# testing

Use when: writing tests, or deciding what a change needs to be covered by.

- Cover normal behavior, edge cases, and failure cases.
- Keep tests deterministic.
- Tie directly to the feature/change.
- For every publishable package, maintain at least one explicit package-root
  public API contract test.

[CONVENTIONS.md][CNV] carries the rest under **Testing**: a test file next to
every file with runtime behaviour, `.test.ts` naming, and how unexported helpers
and type-only files are covered.

[CNV]: <../CONVENTIONS.md>
