# part-source-file-dependency-diagram

Draw the import graph of a package's source files with `part`, by giving source
files an artefact definition whose data function reports their imports.

Package: `part`.

## Context

Moved from `part/TODO.md`, where it read "source file dependency diagram".

`part` has no knowledge of source code. What it has is general enough to carry
an import graph: a definition can declare an `Artefact[]` property, a plugin's
data function for it (`data: { [definition]: (artefact, context) => ... }`) can
compute the value any way it likes, and `part diagram` draws one edge per value
of a property listed in the diagram document ([DIA]). A value is either a
location, such as `file:src/index.ts`, or a path resolved against the artefact's
own directory, in `resolveReferencedLocation` in
`apps/part/src/artefact-property-values.ts`, so a data function can return an
import specifier almost as written.

The repository has no definition for source files. There are about 390 non-test
`.ts` and `.js` files tracked under `libs/` and `apps/`, from 2 in `libs/tmpdir`
to 58 in `apps/cog`.

The imports follow one shape, an ES `import` with the specifier on the next line
and a `.js` extension that names a `.ts` source:

```ts
import { ArtefactDefinition }
  from '../model/artefact-definition.js';
```

A few modules are loaded at run time from a computed URL, such as `await
import(source.url)` in `apps/part/src/providers/definition-source-provider.ts`;
no static scan can see those.

## Problem

There is no way to see which modules of a package depend on which, for example
to check that `apps/part/src/model` depends on nothing in `commands`, or to find
cycles. What is missing is a source of import data. The rest is in place: a
diagram document scopes the graph with `Exclude` globs or a `Root` to walk from,
which matters because a whole-repository graph of ~390 nodes is unreadable in
Mermaid, and `part diagram` prints Mermaid text that `--write` keeps in a
document.

## Options

### Where the graph comes from

1. A `Source File` definition in `aftefacts`, with an `Imports: Artefact[]`
   property, and a data function in `aftefacts/src/` that lists the file's
   relative imports and maps `.js` to `.ts` when the `.ts` file exists.
   - Pro: no `part` code; the graph goes through the same model as the package
     graph (`NPM Package`), so it also appears in `--format=json` and rules can
     use it, for example "nothing under `model/` imports from `commands/`".
   - Con: each project that wants it needs the definition, unless it becomes a
     built-in definition of `asljs-part` ([RQ210][R210]).
2. A built-in `part` command that scans imports itself.
   - Pro: works without definitions.
   - Con: puts a TypeScript and JavaScript parser into a tool whose model is
     language-neutral, and duplicates option 1 with less flexibility.
3. An existing tool, dependency-cruiser or madge, outside `part`.
   - Pro: mature module resolution, cycle detection, and DOT and Mermaid
     reporters; dependency-cruiser also has rules of the kind described above.
   - Con: a new development dependency for what may be an occasional need, and
     its rules would live apart from the artefact definitions.

### How the data function reads imports (option 1)

1. `ts.preProcessFile(text)` from `typescript`, already a development dependency
   at the root.
   - Pro: a real scanner; handles comments, strings, multi-line imports, `export
     ... from` and literal `import('...')`; no type-check and no program, so it
     is fast per file.
   - Con: no module resolution; the data function maps `.js` to `.ts` and
     ignores bare specifiers itself.
2. A full `ts.createProgram` with the package's `tsconfig.json`.
   - Pro: exact resolution, including `paths` and package `exports`.
   - Con: slow; the data function runs once per artefact, so the program would
     have to be built once in the plugin factory and shared.
3. A regular expression over `from '...'` and `import('...')`.
   - Pro: no dependency.
   - Con: matches text in comments and strings; the repository's split
     `import`/`from` lines already rule out a one-line pattern.

### Scope

1. A diagram document with `Exclude` globs, or a `Root` at one entry module with
   `Follow: Imports`.
2. One definition per package, or a definition whose `Location` is a single
   package's `src`.
3. Collapse files to directories, drawing `model` and `commands` as nodes.

### Recommendation

Option 1 with `ts.preProcessFile`, drawn by a diagram document scoped with
`Root` or `Exclude`. Draw only relative imports inside the scope; an import of
`asljs-logging` is a package edge and belongs to the package graph in
`docs/Dependencies.md`. Test files are left out by the definition's `Location`,
which keeps the graph to the published code.

Reach for dependency-cruiser only if cycle detection or layer rules turn out to
be the real need; it does both already, and writing them as `part` rules would
repeat it.

## Points to settle

- Whether test files are drawn. They roughly double the node count and point
  only inward.
- Whether directory-level grouping (option 3 under Scope) is a separate view or
  Mermaid subgraphs inside the file view ([STE]).
- Where the definition lives: `aftefacts` for this repository only, or shipped
  in `apps/part/artefacts` for every project.

## Where

- `aftefacts/` - where a `Source File` definition would go, with its data
  function in `aftefacts/src/` and bound in `aftefacts/src/plugin.ts`.
- `apps/part/src/artefact-property-values.ts` - `resolveReferencedLocation`;
  `apps/part/src/diagram/diagram-builder.ts` turns property values into edges.
- `apps/part/src/artefact-data-providing-function.ts` - the data function
  contract.
- `package.json` - `typescript` in the root `devDependencies`.

[DIA]: <../apps/part/docs/part diagram.md>
[R210]: <../apps/part/development/RQ210 Package plugin.md>
[STE]: part-entity-stereotypes.md
