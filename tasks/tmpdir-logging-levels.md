# tmpdir-logging-levels

Define what `TmpDir` logs at each level, so that a trace log is enough to
reproduce the content of the temporary directory.

Package: `tmpdir`.

Today every public method writes one `trace` message with its name and path
arguments, cleanup failures are logged at `error`, and nothing is logged at
`debug` or `information`. File content is never logged, so a log cannot rebuild
what a test wrote, and a caller that wants a quieter log has no level between
everything and nothing.

Proposed levels:

- `trace` - every file operation with its arguments, plus the content of every
  file written, compressed with gzip and encoded in base64. Trace logs are slow
  and large, but replaying them reproduces the content of the temporary
  directory.
- `debug` - every public method with its arguments, without file content.
- `information` - only the methods that modify content (`mkdir`, `write`,
  `writeText`, `cleanup`, `cleanupSync`), with their arguments and without file
  content.
- `error` - cleanup failures, as today.

Content is compressed and encoded only when `logger.isLevelEnabled('trace')` is
true, so the cost is not paid at any other level.

Open points:

- Whether reads (`readText`, `stat`) also log the content they return at
  `trace`, or only the operation.
- Whether `resolve`, which does not trace today, counts as a file operation.

Update `RQ010 tmpdir traces public method calls` and `docs/TmpDir.md` with the
agreed levels, and add tests that check each level with a recording logger.

## Where

- `libs/tmpdir/src/tmp-dir.ts` - the `this.#logger` calls in each public method.
- `libs/tmpdir/requirements/RQ009 uses asljs-logging.md` and
  `libs/tmpdir/requirements/RQ010 tmpdir traces public method calls.md` - the
  current logging requirements.
- `libs/tmpdir/docs/TmpDir.md` - where the levels are documented for users.
- `libs/logging/src/logger.ts` - `isLevelEnabled`, used to skip the encoding.
