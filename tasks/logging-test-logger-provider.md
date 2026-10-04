# logging-test-logger-provider

Tests cannot be made to log without editing them.

Package: `logging`, with every package's tests as callers.

Tests construct `NullLoggerProvider` directly (for example all of
`apps/part/src/commands/*.test.ts` and `apps/kb/src/testing/library.ts`). When
a test fails, the trace that `TmpDir`, `LocationResolver` and the commands
write is unreachable: getting it means editing the test.

Proposed: a provider for tests that is silent by default and switched on from
the environment, so the same run can be repeated with a log:

```pwsh
$env:ASLJS_TEST_LOG_LEVEL = 'trace'
$env:ASLJS_TEST_LOG_FILE = 'build/test.log'
npm -w asljs-part run test
```

- `createTestLoggerProvider(prefix = 'ASLJS_TEST_LOG_')` - level `silent`
  unless the variable says otherwise; `NullLoggerProvider` when silent, so the
  default costs nothing, see [logging-silent-provider-starts-transport][SIL].
- Each test file creates one at module level and disposes it in `test.after`,
  the pattern part's tests already follow with `NullLoggerProvider`.
- Document the variables in `HOWTO.md` and in the testing skill.

Consumers outside the repository (EdGames) use it with their own prefix.

## Where

- `libs/logging/src/` - new export.
- `apps/part/src/testing/tmpDir.ts`, `apps/kb/src/testing/library.ts` - first
  callers.
- `skills/testing.md`, `HOWTO.md`

[SIL]: logging-silent-provider-starts-transport.md
