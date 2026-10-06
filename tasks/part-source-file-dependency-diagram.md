# part-source-file-dependency-diagram

Draw the import graph of a package's source files with `part`, by giving source
files an artefact definition whose data provider reports their imports.

Package: `part`.

## Context

Moved from `part/TODO.md`, where it read "source file dependency diagram".

`part` has no knowledge of source code. What it has is general enough to carry
an import graph: a definition can declare an `Artefact[]` property, its data
provider (`parts/<Definition>.js`, exporting `getData(artefact, context)`) can
compute the value any way it likes, and `part inventory --format=diagram` draws
one edge per value ([UMB]). A value is a path resolved against the artefact's
own directory, in `resolveReferencedArtefactPath` in
`apps/part/src/commands/inventory.ts`, so a provider can return an import
specifier almost as written.

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
import(importUrl.href)` in `apps/part/src/providers/artefact-data-provider.ts`;
no static scan can see those.

## Problem

There is no way to see which modules of a package depend on which, for example
to check that `apps/part/src/model` depends on nothing in `commands`, or to find
cycles. Three things are missing:

1. a source of import data;
2. a way to scope the diagram to one package or directory, since `inventory`
   takes no path argument and a whole-repository graph of ~390 nodes is
   unreadable in Mermaid;
3. a text output to keep the result in a document ([UMB]).

## Options

### Where the graph comes from

1. A `Source File` definition in `aftefacts`, with an `Imports: Artefact[]`
   property, and a data provider that lists the file's relative imports and maps
   `.js` to `.ts` when the `.ts` file exists.
   - Pro: no `part` code; the graph goes through the same model as the package
     graph ([DEP]), so it also appears in `--format=json` and rules can use it,
     for example "nothing under `model/` imports from `commands/`".
   - Con: each project that wants it needs the definition; a preset could carry
     it ([PRE]).
2. A built-in `part` command that scans imports itself.
   - Pro: works without definitions.
   - Con: puts a TypeScript and JavaScript parser into a tool whose model is
     language-neutral, and duplicates option 1 with less flexibility.
3. An existing tool, dependency-cruiser or madge, outside `part`.
   - Pro: mature module resolution, cycle detection, and DOT and Mermaid
     reporters; dependency-cruiser also has rules of the kind described above.
   - Con: a new development dependency for what may be an occasional need, and
     its rules would live apart from the artefact definitions.

### How the provider reads imports (option 1)

1. `ts.preProcessFile(text)` from `typescript`, already a development dependency
   at the root.
   - Pro: a real scanner; handles comments, strings, multi-line imports, `export
     ... from` and literal `import('...')`; no type-check and no program, so it
     is fast per file.
   - Con: no module resolution; the provider maps `.js` to `.ts` and ignores
     bare specifiers itself.
2. A full `ts.createProgram` with the package's `tsconfig.json`.
   - Pro: exact resolution, including `paths` and package `exports`.
   - Con: slow, and `getData` runs once per artefact with no shared state, so
     the program would have to be cached in the module.
3. A regular expression over `from '...'` and `import('...')`.
   - Pro: no dependency.
   - Con: matches text in comments and strings; the repository's split
     `import`/`from` lines already rule out a one-line pattern.

### Scope

1. A `[pattern]` argument on `inventory`, as `check` has ([UMB]).
2. One definition per package, or a definition whose `Location` is a single
   package's `src`.
3. Collapse files to directories, drawing `model` and `commands` as nodes.

### Recommendation

Option 1 with `ts.preProcessFile`, scoped by the `inventory` `[pattern]`
argument proposed in [UMB], and Mermaid text output. Draw only relative imports
inside the scope; an import of `asljs-logging` is a package edge and belongs to
[DEP]. Test files are left out by the definition's `Location`, which keeps the
graph to the published code.

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

- `aftefacts/` - where a `Source File` definition and its `parts/Source File.js`
  provider would go.
- `apps/part/src/commands/inventory.ts` - `resolveReferencedArtefactPath` and
  `collectDiagramEdges`, which turn property values into edges.
- `apps/part/src/cli.ts` - the `inventory` command, which has no `[pattern]`
  argument.
- `apps/part/src/artefact-data-providing-function.ts` - the `getData` contract
  the provider implements.
- `package.json` - `typescript` in the root `devDependencies`.

[UMB]: part-better-diagram-support.md
[DEP]: part-project-deps-diagram.md
[PRE]: part-presets.md
[STE]: part-entity-stereotypes.md
