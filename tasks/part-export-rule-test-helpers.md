# part-export-rule-test-helpers

Rule tests import their temporary-workspace helper from a local
`testing/tmpDir.js` that `asljs-part` ships as a loose file, and that helper
passes the logger to `TmpDir` in a form `TmpDir` ignores. A consumer cannot get
working scaffolding from the package, and the published package root does not
load at all.

Package: `part`.

## Context

A rule test validates one rule against files it writes into a temporary
directory. In `aftefacts/parts/Artefact Definition_RL1.test.js`:

```js
import { NullLoggerProvider,
         createRuleValidationContext }
  from 'asljs-part';
import { tmpDirFactory }
  from './testing/tmpDir.js';
// ...
const tmpDir =
  tmpDirFactory(
    loggerProvider);
// ...
    await using workspace =
      tmpDir();
```

All seven rule tests under `aftefacts/parts` and
`apps/part/artefacts/parts/Artefact Definition_RL1.test.js` import
`./testing/tmpDir.js`. There are two copies of that file, byte for byte the
same: `aftefacts/parts/testing/tmpDir.js` and
`apps/part/artefacts/parts/testing/tmpDir.js`. `apps/part/package.json` ships
the second one (`"files": [ "artefacts/parts/testing/*.js", ... ]`), and so does
the published `asljs-part@0.1.42`.

The prompt `part update` writes for a new rule tells the author to import it the
same way (`apps/part/src/commands/update.ts`, `testTemplate`):

```js
import { NullLoggerProvider,
         createRuleValidationContext }
  from 'asljs-part';
import { tmpDirFactory }
  from './testing/tmpDir.js';
```

The same template calls `after(...)` but imports only `test` from `node:test`.

`part`'s own TypeScript tests use a different, correct helper,
`apps/part/src/testing/tmpDir.ts`:

```ts
return () =>
{
  const tmpDirLogger =
    loggerProvider.getLogger('TmpDir');

  return new TmpDir(
    tmpDirLogger);
};
```

[CONVENTIONS.md][CNV] keeps `src/**/testing/**` for helpers that only
`*.test.ts` imports; `tsconfig.dist.json` excludes it, so this one is not
published.

The package root exports, from `apps/part/src/index.ts` and pinned by
`apps/part/src/index.test.ts`: `ArtefactProvider`, `MarkdownDocumentProvider`,
`NullLoggerProvider`, `PinoLoggerProvider`, `PinoLoggerProviderOptionsBuilder`,
`TmpDir`, `createRuleValidationContext` and `runCli`. `TmpDir` is re-exported
from `asljs-tmpdir`:

```ts
export {
  TmpDir
} from 'asljs-tmpdir';
```

EdGames is the consumer. Its rule tests in `docs/artefacts/parts/*.test.js`
import `createPinoLoggerProvider` from `asljs-part` and `tmpDirFactory` from
`./testing/tmpDir.js`. EdGames commit `1143e05` deleted its copy of that file
because of the bug below, and its `skills/testing.md` now says a test creates
`new TmpDir(loggerProvider.getLogger('TmpDir'))` directly. Its `PLAN.md`, Phase
2, moves the rule tests onto whatever `asljs-part` ships. The tests do not run
today: EdGames does not depend on `asljs-part`.

## Problem

### The helper drops the logger

`aftefacts/parts/testing/tmpDir.js` was written for an older `TmpDir` that took
`error` and `trace` functions as options:

```js
/**
 * @typedef
 *   { import('./logging.js').LoggerProvider }
 *   LoggerProvider
 ...
    /** @type {Partial<TmpDirOptions>} */
    const tmpDirOptions =
      { error,
        trace };

    return new TmpDir(
      tmpDirOptions);
```

`TmpDir` today takes a `Logger` or options, and the options are `tmpDir`,
`prefix` and `keep` (`libs/tmpdir/src/tmp-dir.ts`):

```ts
export interface TmpDirOptions
{
  tmpDir: string;
  prefix: string;
  keep: boolean;
}
// ...
  constructor(
    options?: Partial<TmpDirOptions>
  );

  constructor(
    logger?: Logger,
    options?: Partial<TmpDirOptions>
  );
```

`isLogger` requires `trace`, `debug`, `information`, `warning` and `error`, so
`{ error, trace }` is taken as options, both functions are ignored, and `TmpDir`
falls back to a `NullLoggerProvider` logger. Nothing fails, so it went
unnoticed: the asljs rule tests pass a `NullLoggerProvider` anyway, and a
trace-level provider would still see no `TmpDir` messages. The JSDoc also
imports `LoggerProvider` from `./logging.js`, which exists next to neither copy.
The published `asljs-tmpdir@0.1.13` has the same constructor, so the copy in
`asljs-part@0.1.42` has the same bug.

### Scaffolding is copied, not imported

A consumer gets the helper only by copying it, or by importing a loose file from
`node_modules/asljs-part/artefacts/parts/testing`. The copies drift: the EdGames
copy did, and the two asljs copies carry the bug together.

### The logger name the consumer uses is gone

EdGames imports `createPinoLoggerProvider`. The published `asljs-part@0.1.42`
exported it (`dist/index.d.ts`: `export { createPinoLoggerProvider } from
'./logging/pino.js'`); the current source does not. The test logger the rest of
the repository uses is `createTestLoggerProvider` from `asljs-testing`, which
`part` has only as a devDependency and which is not published to npm (`npm view
asljs-testing` returns 404). `asljs-logging@0.1.2` still exports a
`createTestLoggerProvider`, but commit `8242c2c` removed that export from the
source, so the next `asljs-logging` release drops it.

### The package root does not load outside the workspace

`apps/part/package.json` does not list `asljs-tmpdir` in `dependencies`. It
resolves in the workspace through the root `devDependencies` (`"asljs-tmpdir":
"^0.1.9"`). In a clean project, `import('asljs-part')` from `asljs-part@0.1.42`
fails with `ERR_MODULE_NOT_FOUND: Cannot find package 'asljs-tmpdir'`, so no
rule test can import anything from the package until this is fixed.

## Options

Two choices: how a rule test gets a `TmpDir`, and where it gets a logger
provider. Each assumes `asljs-tmpdir` is added to `part`'s `dependencies`, which
is needed whichever is chosen.

### Workspace

#### A. Fix the copies in place

Replace the body of both `testing/tmpDir.js` copies with the form in
`apps/part/src/testing/tmpDir.ts`, and take `LoggerProvider` in the JSDoc from
`asljs-logging` instead of `./logging.js`.

- Pro: two small edits, no API change.
- Con: the copies stay, and the next consumer copies the file again.
- Con: a published loose file that is not part of the package's API is still
  what the `update` prompt tells authors to import.

#### B. Export `tmpDirFactory` from the package root

Move `apps/part/src/testing/tmpDir.ts` out of `testing` (for example to
`src/tmp-dir-factory.ts`), export it from `index.ts`, delete both `.js` copies,
drop `artefacts/parts/testing/*.js` from `files`, and point rule tests and the
`update` prompt at `asljs-part`.

- Pro: the call sites change only their import line.
- Con: a public export for a three-line closure over a class the package already
  exports.
- Con: moves a file out of `src/testing`, which [CONVENTIONS.md][CNV] reserves
  for test-only helpers; part's own tests would then import a production module
  for test setup.

#### C. Construct `TmpDir` directly

Delete both `.js` copies and the `files` entry. Rule tests use the `TmpDir` the
package already exports:

```js
await using workspace =
  new TmpDir(
    loggerProvider.getLogger('TmpDir'));
```

- Pro: no new API; `tmpDirFactory` stays a private helper of part's own tests.
- Pro: matches what EdGames' `skills/testing.md` already prescribes.
- Con: each test (or a one-line local function per file) repeats the
  `getLogger('TmpDir')` call.

### Logger provider

#### L1. `NullLoggerProvider`

What the asljs rule tests use today. Nothing to add, but a failing rule test
cannot be made to log.

#### L2. Re-export `createTestLoggerProvider` from `asljs-part`

- Pro: a rule test imports everything from one package.
- Con: `asljs-testing` becomes a runtime dependency of a CLI only to serve
  consumers' tests, and must be published first.
- Con: two names for the same function, one in `asljs-testing`, one in
  `asljs-part`.

#### L3. Import `createTestLoggerProvider` from `asljs-testing`

The consumer adds `asljs-testing` as a devDependency, as every asljs package
already does.

- Pro: no change to `part`'s API or dependencies; the same helper as every other
  test.
- Con: `asljs-testing` must be published, or linked (EdGames already links
  `asljs-toolkit` and `asljs-sfmt` with `file:../asljs/...`).

### Recommendation

C with L3. The package already exports what a rule test needs; the missing
pieces are the `asljs-tmpdir` dependency and a correct example. Until
`asljs-testing` is published, the asljs rule tests may keep L1 and switch when
it ships.

Steps:

- Add `asljs-tmpdir` to `apps/part/package.json` `dependencies`.
- Delete `aftefacts/parts/testing/tmpDir.js` and
  `apps/part/artefacts/parts/testing/tmpDir.js`, and the
  `artefacts/parts/testing/*.js` entry in `files`.
- Change the rule tests under `aftefacts/parts` and `apps/part/artefacts/parts`
  to construct `TmpDir` directly.
- Change `testTemplate` in `apps/part/src/commands/update.ts` the same way, and
  import `after` from `node:test`.
- Release `asljs-part`, then EdGames' Phase 2 moves its tests over and replaces
  `createPinoLoggerProvider`.

## Points to settle

- Whether to publish `asljs-testing` now, which decides L1 or L3 for the first
  release.
- `update.ts` tells authors to annotate `validate` with
  `import('asljs-part').RuleValidationFunction`, and EdGames' `PLAN.md` relies
  on it, but `index.ts` does not export that type
  (`apps/part/src/rule-validation-function.ts` declares it). It belongs with
  this change or in its own task.
- `part` also depends on `asljs-locator`, which is not on npm either; it must be
  published before `part` can be released with this change.
- No root script runs the `aftefacts/parts/*.test.js` tests; part's `test`
  script runs only `apps/part/artefacts/**/*.test.js`.

## Where

- `apps/part/package.json` - the missing `asljs-tmpdir` dependency and the
  `files` entry that ships the helper.
- `apps/part/src/index.ts` and `apps/part/src/index.test.ts` - the package root
  and its pinned export list.
- `apps/part/src/testing/tmpDir.ts` - the correct helper, used by part's own
  tests.
- `apps/part/src/commands/update.ts` - `testTemplate`, the rule-test example
  given to authors.
- `aftefacts/parts/testing/tmpDir.js`,
  `apps/part/artefacts/parts/testing/tmpDir.js` - the stale copies.
- `aftefacts/parts/*.test.js`, `apps/part/artefacts/parts/Artefact
  Definition_RL1.test.js` - the rule tests that import them.
- `libs/tmpdir/src/tmp-dir.ts` - the constructor overloads and `isLogger`.
- `libs/testing/src/create-test-logger-provider.ts` - the test logger.
- EdGames `docs/artefacts/parts/*.test.js`, `skills/testing.md`, `PLAN.md` Phase
  2 - the consumer.

[CNV]: ../CONVENTIONS.md
