# part-package-root-dependencies

The `asljs-part` package root re-exports `TmpDir` from `asljs-tmpdir`, which is
not one of its dependencies, so the published package root cannot load outside
this workspace.

Package: `part`.

## Context

`apps/part/src/index.ts` re-exports it for rule tests:

```ts
export {
  TmpDir
} from 'asljs-tmpdir';
```

`apps/part/package.json` lists `asljs-locator` and `asljs-logging` among its
`dependencies`, but not `asljs-tmpdir`. In the workspace it resolves through the
root `devDependencies`; in a clean project `import('asljs-part')` fails with
`ERR_MODULE_NOT_FOUND: Cannot find package 'asljs-tmpdir'`.

How rule tests are written now, in `aftefacts/src/*.test.ts`: they import
`createRuleValidationContext` from `asljs-part`, `createTestLoggerProvider` from
`asljs-testing`, and construct `new TmpDir(loggerProvider.getLogger('TmpDir'))`
from `asljs-tmpdir` directly. They no longer use the `TmpDir` re-export or a
copied `testing/tmpDir.js` helper; those copies and `part update`, which told
authors to use them, are gone.

`asljs-locator` and `asljs-testing` are not on npm either; `part` cannot be
released until `asljs-locator` is.

## Options

- **Add `asljs-tmpdir` to `dependencies`.**
  - Pro: no API change.
  - Con: a CLI depends at runtime on a test helper only to re-export it.
- **Drop the `TmpDir` re-export.** Rule tests import `asljs-tmpdir` themselves,
  as `aftefacts` already does.
  - Pro: no test dependency in the published package.
  - Con: a breaking change to the package root; `index.test.ts` pins the export
    list.

Recommendation: drop the re-export. The consumer that writes rule tests already
needs a test runner and a logger provider from other packages.

## Where

- `apps/part/src/index.ts` and `apps/part/src/index.test.ts` - the re-export and
  the pinned export list.
- `apps/part/package.json` - `dependencies`.
- `aftefacts/src/*.test.ts` - the rule tests, as an example for consumers.
