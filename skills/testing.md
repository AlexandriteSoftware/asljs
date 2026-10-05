# testing

Use when: writing tests, or deciding what a change needs to be covered by.

- Cover normal behavior, edge cases, and failure cases.
- Keep tests deterministic.
- Tie directly to the feature/change.
- For every publishable package, maintain at least one explicit package-root
  public API contract test.
- Take test helpers from `asljs-testing` rather than writing them again:
  `TmpEnv` for environment variables, `TmpGlobals` for globals such as a JSDOM
  window, `waitFor` and `flushMicrotasks`.
- Give code under test a logger from `createTestLoggerProvider()` (from
  `asljs-testing`), created once per test file and disposed in `test.after`,
  rather than a `NullLoggerProvider`, so `ASLJS_TEST_LOG_LEVEL` can show what
  happened; see [Logging][LGG].

[CONVENTIONS.md][CNV] carries the rest under **Testing**: a test file next to
every file with runtime behaviour, `.test.ts` naming, and how unexported helpers
and type-only files are covered.

[CNV]: ../CONVENTIONS.md
[LGG]: ../docs/Logging.md
