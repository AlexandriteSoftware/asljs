# logging-test-logger-provider

Tests cannot be made to log without editing them.

Package: `logging`, with every package's tests as callers.

Tests construct `NullLoggerProvider` directly (for example all of
`apps/part/src/commands/*.test.ts` and `apps/kb/src/testing/library.ts`). When
a test fails, the trace that `TmpDir`, `LocationResolver` and the commands
write is unreachable: getting it means editing the test.

Proposed, following the test rules in `docs/Logging.md`: a provider for tests
that logs at `debug` to the console by default, so a failing run already shows
what happened, and that the environment can raise, lower or redirect:

```pwsh
$env:ASLJS_TEST_LOG_LEVEL = 'trace'
$env:ASLJS_TEST_LOG_FILE = 'build/test.log'
npm -w asljs-part run test
```

- `createTestLoggerProvider(prefix = 'ASLJS_TEST_LOG_')` - level `debug`
  unless `<prefix>LEVEL` says otherwise; `<prefix>FILE` writes to that file
  instead of the console; `silent` returns a `NullLoggerProvider`, see
  [logging-silent-provider-starts-transport][SIL].
- Console output is pretty-printed, whatever the automatic format would choose:
  `node --test` pipes the test processes, but a person reads the output.
- Each test file creates one at module level and disposes it in `test.after`,
  the pattern part's tests already follow with `NullLoggerProvider`.
- Document the variables in `HOWTO.md` and in the testing skill.

Check the volume before switching every package over. `debug` on the console in
every test file can bury the test report; if it does, keep the default and use
`ASLJS_TEST_LOG_LEVEL=silent` in CI, or lower the default and record why in
`docs/Logging.md`.

Consumers outside the repository (EdGames) use it with their own prefix.

## Where

- `libs/logging/src/` - new export.
- `apps/part/src/testing/tmpDir.ts`, `apps/kb/src/testing/library.ts` - first
  callers.
- `skills/testing.md`, `HOWTO.md`

[SIL]: logging-silent-provider-starts-transport.md
