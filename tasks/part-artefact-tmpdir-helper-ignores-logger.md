# part-artefact-tmpdir-helper-ignores-logger

The `tmpDirFactory` helper the artefact rule tests use is written against an
old `TmpDir` API, so the logger it is given never reaches `TmpDir`.

Package: `part`, and the repository's own `aftefacts`.

The helper builds `{ error, trace }` from the logger and passes it as
`TmpDirOptions`. `TmpDirOptions` today is `tmpDir`, `prefix` and `keep`, so
both functions are ignored and `TmpDir` falls back to a null logger. Nothing
fails, which is why it went unnoticed: a test run with a trace-level provider
writes no `TmpDir` messages.

The JSDoc also imports `LoggerProvider` from `./logging.js`, which does not
exist next to either copy.

`apps/part/src/testing/tmpDir.ts` already has the correct form:

```js
return () => new TmpDir(loggerProvider.getLogger('TmpDir'));
```

The stale file was copied into EdGames (`docs/artefacts/parts/testing`), so the
fix should land here first and be reused there, see
[part-export-rule-test-helpers][EXP].

## Where

- `aftefacts/parts/testing/tmpDir.js`
- `apps/part/artefacts/parts/testing/tmpDir.js`
- `apps/part/src/testing/tmpDir.ts` - the correct version.
- `libs/tmpdir/src/tmp-dir.ts` - the constructor overloads.

[EXP]: part-export-rule-test-helpers.md
