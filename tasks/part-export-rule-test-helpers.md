# part-export-rule-test-helpers

Rule tests in every project that uses `part` copy the same test scaffolding,
because `asljs-part` does not export it.

Package: `part`.

A rule test needs a temporary workspace and a logger provider that is disposed
after the run. Today each project carries its own `testing/tmpDir.js` next to
its rule files: `aftefacts/parts/testing`, `apps/part/artefacts/parts/testing`,
and EdGames' `docs/artefacts/parts/testing`. All three are the same file, and
all three carry the bug in [part-artefact-tmpdir-helper-ignores-logger][TMP].

`asljs-part` already re-exports `TmpDir`, `NullLoggerProvider`,
`PinoLoggerProvider` and `createRuleValidationContext`, so rule tests import
from it already; only the factory is missing.

Proposed:

- Export `tmpDirFactory(loggerProvider)` from the package root.
- Re-export `createTestLoggerProvider` from `asljs-logging` (see
  [logging-test-logger-provider][TLP]) so a rule test needs no local helper.
- Delete the local `testing/tmpDir.js` copies and import from `asljs-part`.
- Cover the export in the package-root public API test.

Downstream: EdGames rule tests import `createPinoLoggerProvider` from
`asljs-part`, which no longer exists. Whatever name lands here is what they
move to.

## Where

- `apps/part/src/index.ts` and `apps/part/src/index.test.ts`
- `apps/part/src/testing/tmpDir.ts` - the implementation to promote out of
  `testing`, since a published file will import it.
- The `testing/tmpDir.js` copies listed above.

[TMP]: part-artefact-tmpdir-helper-ignores-logger.md
[TLP]: logging-test-logger-provider.md
