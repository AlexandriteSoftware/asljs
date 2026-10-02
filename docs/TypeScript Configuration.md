# TypeScript Configuration

Overview of how TypeScript is configured across ASLJS.

## Layout

Configuration is layered. Two base configs at the repository root own everything
that is common, including the input and output paths. Each workspace adds up to
three thin configs that extend them and declare only their deviations.

## Root configuration

The root has two base configs:

- [tsconfig.dist.json][TSD] - the base for publishable output.
- [tsconfig.build.json][TSB] - extends [tsconfig.dist.json][TSD] and retargets
  it for local build and test output.

### Paths come from the bases

Both bases express their paths with `${configDir}`, which resolves to the
directory of the config `tsc` was invoked with, not the directory of the file
the text is written in. The substitution follows the whole `extends` chain, so a
workspace config three levels down still resolves it to its own folder.

That is what lets the bases own the paths:

- `include` is `${configDir}/src/**/*.ts` in the dist base, inherited by both.
- `exclude` is `${configDir}/src/**/*.test.ts` in the dist base. The build base
  overrides it with `exclude: []`, because `build/` is what the test runner
  executes and must therefore contain compiled tests. This override is
  load-bearing: without it, no workspace would emit test output.
- `rootDir` is `${configDir}/src` in the dist base, inherited by both.
- `outDir` is `${configDir}/dist` in the dist base and `${configDir}/build` in
  the build base.

The bases are meant to be extended, not run. Because they carry `include`, a
direct `tsc -p tsconfig.dist.json` at the repository root resolves to
`<root>/src/**/*.ts`, finds nothing, and fails with TS18003.

### Library and ambient types

Both bases pin a baseline: `lib: ["ESNext"]` and `types: []` in the dist base,
`lib: ["ESNext"]` and `types: ["node"]` in the build base. `lib: ["ESNext"]` is
the DOM-free ECMAScript library, and `types: []` disables automatic inclusion of
every visible `@types` package.

Without an explicit `lib`, TypeScript would load the full library for the target
(`lib.esnext.full.d.ts`), which includes `DOM` and `DOM.Iterable`. Pinning `lib`
keeps DOM out unless a workspace asks for it.

`types: []` only suppresses automatic inclusion. A `/// <reference lib>` or
`/// <reference types>` inside any `.d.ts` that reaches the program still
injects its library. See the DOM note under deviations.

### Emit

Only dist emits `.d.ts`. `declaration: true` is set in the dist base. The build
base inherits it and cancels it with `declaration: false`.

Only build emits source maps. `sourceMap` and `inlineSources` in the build base
are what produce them at compile time. `tsc` writes a `.js.map` beside each
`.js`, appends a `sourceMappingURL` comment, and embeds the TypeScript source
text into the map so it is self-contained. The `--enable-source-maps` flag on
the test command consumes them at runtime, so failing tests report `.ts` files
and lines instead of compiled `.js` ones.

## Workspace configuration

The common pattern is three files per workspace, each carrying only what differs
from the base:

- `tsconfig.json` - `{ "extends": "./tsconfig.build.json" }` and nothing else.
  It is the default config for editors and tooling; no npm script uses it.
- `tsconfig.build.json` - extends `../tsconfig.build.json`. Compiles `src`,
  tests included, to `build/`.
- `tsconfig.dist.json` - extends `../tsconfig.dist.json`. Compiles `src`, tests
  excluded, to `dist/`.

No workspace restates `include`, `exclude`, `rootDir` or `outDir`. A workspace
with no deviation declares nothing beyond `extends`.

A workspace that needs node globals or DOM declares them itself: `types` for
node, `lib` for DOM. Build compilation is the exception: the build base grants
`types: ["node"]` to everything, because build output is what the node test
runner executes.

The scripts that use these configs are identical across workspaces:

- `build` - `tsc -p tsconfig.build.json`
- `build:dist` - `tsc -p tsconfig.dist.json`
- `typecheck` - `tsc -p tsconfig.build.json --noEmit`
- `test` - `node --test --enable-source-maps build/**/*.test.js`

## What `build` and `dist` mean

Per [Repository Layout][RLY]:

- `build/` is build output for testing and validation. It contains compiled
  tests, carries source maps, and has no declarations.
- `dist/` is distributable output. It excludes tests, carries declarations, and
  has no source maps.

Neither folder is hand-edited.

## Deviations from the common pattern

### Structural

- `app-builder` does not follow the pattern at all. It has a single
  [tsconfig.json][ABT] that extends nothing, sets `noEmit: true`,
  `target: ES2025`, `lib: ["ES2025", "DOM", "DOM.Iterable"]`, and
  `types: ["vite/client", "node"]`. It is a browser app: `tsc` only typechecks
  it, and `vite build` produces `apps/app-builder/dist/`.

### Compiler options

- `components` sets `target: ES2022`, `experimentalDecorators: true` and
  `useDefineForClassFields: false` in both its build and dist configs, lowering
  the base `target: ESNext`.
- `components` declares `lib: ["ES2022", "DOM"]` in its dist config, and
  `data-binding` declares `lib: ["ESNext", "DOM"]`. Both are required by the
  pinned baseline; without them the DOM globals they use do not resolve.
- `dali` declares `lib: ["ES2025", "DOM"]` in both configs, which it needs for
  IndexedDB. It is the only workspace that asks for DOM in build compilation.
- `types: ["node"]` appears in the build configs of `cog`, `kb`, `logging`,
  `part`, `project-tools` and `sfmt`. It is redundant there, because the build
  base already sets it. In dist configs it is the opt-in out of `types: []`, and
  it is declared by `cog`, `kb`, `logging`, `part`, `project-tools`, `sfmt` and
  `tmpdir`.

### DOM reaching build compilation indirectly

`components` and `data-binding` use DOM globals in non-test sources, yet neither
declares DOM in its build config. Both typecheck anyway, because their build
configs also compile the `*.test.ts` files, those tests import `jsdom`, and
`@types/jsdom` starts with `/// <reference lib="dom" />`.

This is fragile. Dropping the jsdom import from the tests of either workspace
would break `typecheck` there, with a `Cannot find name` error pointing at the
source file rather than at the cause. Their dist configs do not share the
problem, because they declare `lib` explicitly.

## Notes

- No config uses project references, `composite`, `baseUrl` or `paths`. Nothing
  redirects module resolution, so a cross-package import resolves exactly as
  node would resolve it under `NodeNext`.
- A workspace imports a sibling by its published package name, not by relative
  path. [libs/data-binding/src/bind-data-model.ts][BDM] imports
  `asljs-observable`; npm links `node_modules/asljs-observable` to the
  `observable` folder; and that package points `exports["."].types` at
  `./dist/index.d.ts`. The dependent therefore typechecks against the sibling
  built `dist/*.d.ts`, never against its `src`.
- The practical consequence: a change in one workspace `src` is invisible to its
  dependents until that workspace runs `build:dist`.
- ESLint does not point at any `tsconfig`; it does not run type-aware rules.

[ABT]: ../apps/app-builder/tsconfig.json
[BDM]: ../libs/data-binding/src/bind-data-model.ts
[RLY]: <Repository Layout.md>
[TSB]: ../tsconfig.build.json
[TSD]: ../tsconfig.dist.json
