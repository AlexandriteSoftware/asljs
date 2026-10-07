# part-project-deps-diagram

Generate the workspace package dependency graph with `part` and replace the
hand-maintained graph in `docs/Dependencies.md` with it.

Package: `part`, and `asljs-artefacts` (`aftefacts/`) for `LocalDeps`.

## Context

Moved from `part/TODO.md`, where it read "Project deps as diagram".

### The workspace

The root `package.json` lists 19 workspaces: 11 in `libs/`, 7 in `apps/`, and
`aftefacts` (`asljs-artefacts`). Four are private: `asljs-artefacts`,
`app-builder`, `dash` and `toolkit`. Every package name is `asljs-` plus its
folder name, except `aftefacts`, whose name is `asljs-artefacts`.

Between workspace packages there are 26 `dependencies` edges:

- `app-builder` -> `components`, `dali`, `data-binding`, `eventful`,
  `observable`
- `artefacts` -> `part`
- `cog`, `part`, `toolkit` -> `locator`, `logging`
- `kb`, `sfmt`, `locator`, `testing`, `tmpdir` -> `logging`
- `components` -> `data-binding`, `eventful`, `observable`
- `dali`, `machine` -> `eventful`, `observable`
- `data-binding` -> `observable`
- `observable` -> `eventful`

`devDependencies` add many more: `asljs-toolkit` is a development dependency of
every package except itself, `asljs-testing` of twelve, `asljs-tmpdir` of six,
and `data-binding` also has `asljs-eventful`.

### What `part` draws today

`aftefacts/ASLJS Package.md` locates `../{libs,apps}/*/package.json`, excluding
`../apps/toolkit/package.json`: 17 artefacts. It declares `LocalDeps` as
`Artefact[]`, which `aftefacts/src/asljs-package.ts` fills from `dependencies`:

```ts
const parentPath =
  path.resolve(
    packagePath,
    '..');

// ... for each asljs-* dependency:
path.resolve(
  parentPath,
  item.replace(
    /^asljs-/,
    ''),
  'package.json')
```

`part inventory --format=diagram` turns each `Artefact[]` value into an edge,
when the referenced artefact is a node ([UMB]):

```sh
npm -w asljs-artefacts run build:dist
npx part inventory --definitions aftefacts \
  --inventory-definitions="ASLJS Package" --format=diagram > deps.svg
```

Run against the repository, `--format=json` gives 17 nodes and 23 `LocalDeps`
values. 12 become edges, all between libraries. The other 11, every dependency
of an app, point at folders that do not exist, such as
`apps/locator/package.json` for `part`, and are dropped without a word.

`--format=diagram` renders SVG through `@mermaid-js/mermaid-cli`; there is no
text output. `part inventory --format=mermaid` fails with `Unknown inventory
format: mermaid`. Adding it is part of [UMB].

### The hand-written graph

`docs/Dependencies.md` draws a Mermaid `graph TD` with 10 nodes and 14 edges,
from the dependency to the dependent. All 14 edges are correct, but:

- 9 packages are missing: `artefacts`, `cog`, `dash`, `kb`, `logging`, `sfmt`,
  `testing`, `tmpdir` and `toolkit`;
- 12 `dependencies` edges are missing, including `observable` -> `components`,
  between two packages the graph does show;
- development dependencies are not drawn at all.

The rest of the document is the `glob` override note, which stays.

### The `NPM Package` definition

`asljs-part` now has a built-in `NPM Package` definition
(`apps/part/artefacts/NPM Package.md`). It locates every `package.json` under
the project root, skipping `node_modules` and `.gitignore`d paths. Each
artefact's location is the file and its name is the package `name`. Its
`Dependencies` (`Artefact[]`) link to the project packages in `dependencies`,
resolved by name, not by folder.

Run against the repository, it gives 20 artefacts: the 19 workspaces and the
root `package.json`. They have 26 `Dependencies` values, every `dependencies`
edge listed above. This command draws all 26:

```sh
npx part inventory --definitions "asljs-part;NPM Package" --format=diagram \
  > deps.svg
```

`NPM Dependency` (one artefact per dependency entry) remains, with `String`
properties; it is not needed for the graph.

## Problem

- The `ASLJS Package` graph is wrong and is now redundant: `parentPath` in
  `aftefacts/src/asljs-package.ts` is the package's parent folder, `libs` or
  `apps`, so no app has an edge; the name-to-folder mapping fails for
  `asljs-artefacts`; `toolkit` and `aftefacts` have no node.
- `NPM Package` reads `dependencies` only; development dependencies are not
  drawn.
- The root `package.json` (`asljs`, no dependencies) is a node with no edges.
- `ASLJS Package` says "published to npm", but its pattern also matches the
  private `app-builder` and `dash`.
- The document cannot be regenerated, because `part` has no Mermaid text output.

## Options

### Data source

1. **`NPM Package`.** Already in place and gives the full `dependencies` graph
   for any npm project. Excluding the root needs a node filter in `inventory`,
   or an `Exclude` the definition does not have; a property for development
   dependencies would be a `part` change.
2. **Fix `asljs-package.ts`.** Resolve dependencies through the root
   `workspaces`, add `LocalDevDeps`, widen the pattern to every workspace.
   - Con: duplicates `NPM Package` in this repository's definitions.

### `ASLJS Package` `LocalDeps`

1. Remove the property and `getData` from `asljs-artefacts`; the graph comes
   from `NPM Package`.
2. Fix it as in data source option 2.

### Keeping the document current

1. Regenerate the graph in `docs/Dependencies.md` with `--format=mermaid` once
   [UMB] adds it, by hand or from a `toolkit` command.
2. A rule that fails when the graph in `docs/Dependencies.md` differs from the
   generated one.
3. Delete the graph from the document and give the command instead.

## Recommendation

Use `NPM Package` as the data source and remove `LocalDeps` from `ASLJS Package`
together with its `getData`, bumping the `asljs-artefacts` plugin version. After
[UMB] adds `--format=mermaid`, regenerate the document and add the rule in
option 2, so the graph cannot drift again. Until then, a corrected hand-written
graph is a cheap interim fix: add the 9 packages and 12 edges listed above.

## Points to settle

- Which packages are nodes: all 19 workspaces, published only, and whether the
  root `package.json` is drawn.
- Whether development dependencies are drawn. With `asljs-toolkit` a development
  dependency of 18 packages, they dominate the graph; a dotted edge style needs
  edge kinds in the diagram ([STE]).
- Edge direction: dependent to dependency (what `part` draws) or the reverse
  (what `docs/Dependencies.md` draws).
- Whether nodes are grouped into `libs` and `apps` subgraphs ([STE]).

## Where

- `apps/part/artefacts/NPM Package.md` and `apps/part/src/plugins/npm.ts` - the
  definition the graph comes from.
- `aftefacts/ASLJS Package.md` and `aftefacts/src/asljs-package.ts` -
  `LocalDeps` and `getData`, with the wrong `parentPath`.
- `docs/Dependencies.md` - the hand-written graph.
- `apps/part/src/commands/inventory.ts` - `collectDiagramEdges`, which drops
  unresolved references, and the formats `table`, `diagram` and `json`.

[UMB]: part-better-diagram-support.md
[STE]: part-entity-stereotypes.md
