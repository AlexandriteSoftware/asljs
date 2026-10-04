# logging-test-logger-provider

Move the remaining tests from `NullLoggerProvider` to
`createTestLoggerProvider()`.

Package: `logging`, with the tests of `sfmt`, `toolkit`, `locator` and `tmpdir`
as callers.

`createTestLoggerProvider()` exists and follows the test rules in
`docs/Logging.md`: `debug` on the console by default, `ASLJS_TEST_LOG_LEVEL`,
`ASLJS_TEST_LOG_FILE` and `ASLJS_TEST_LOG_FORMAT` to change it. The tests of
`cog`, `kb` (through `apps/kb/src/testing/library.ts`) and `part` (under
`apps/part/src`) use it. These still construct a `NullLoggerProvider` or
`NullLogger`, so their log cannot be switched on:

- `apps/sfmt/src/format.test.ts` and `apps/sfmt/src/ts-style-rules/*.test.ts`
- `apps/toolkit/src/lib/filesystem.test.ts`,
  `apps/toolkit/src/lib/files.test.ts`,
  `apps/toolkit/src/commands/print-file.test.ts`
- `libs/locator/src/git-ignore.test.ts`, `libs/locator/src/location.test.ts`
- `libs/tmpdir/src/tmp-dir.test.ts` - except where a test needs a logger that
  records calls.
- `apps/part/src/index.test.ts` - checks that `NullLoggerProvider` is
  re-exported; leave it.

Each file creates one provider at module level and disposes it in an awaited
`test.after`. Check the output volume of `sfmt`'s rule tests at `debug` before
switching them: if it buries the test report, lower their level in code and
say why.

The artefact rule tests under `aftefacts/parts` and
`apps/part/artefacts/parts` go through `testing/tmpDir.js`; they move with
[part-export-rule-test-helpers][EXP].

## Where

- The files listed above.

[EXP]: part-export-rule-test-helpers.md
