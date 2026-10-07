# part-project-deps-diagram

Generate the workspace package dependency graph with `part` and replace the
hand-maintained graph in `docs/Dependencies.md` with it.

Package: `part`.

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

The built-in `NPM Package` definition of `asljs-part` (`apps/part/artefacts/NPM
Package.md`) locates every `package.json` under the project root, skipping
`node_modules` and `.gitignore`d paths. Each artefact's location is the file and
its name is the package `name`. Its `Dependencies` (`Artefact[]`) link to the
project packages in `dependencies`, resolved by name.

`part inventory --format=diagram` turns each `Artefact[]` value into an edge,
when the referenced artefact is a node ([UMB]):

```sh
npx part inventory --definitions "asljs-part;NPM Package" --format=diagram   > deps.svg
```

Run against the repository, it gives 20 nodes, the 19 workspaces and the root
`package.json`, and 26 edges, every `dependencies` edge listed above.

`--format=diagram` renders SVG through `@mermaid-js/mermaid-cli`; there is no
text output. `part inventory --format=mermaid` fails with `Unknown inventory
format: mermaid`. Adding it is part of [UMB].

The `ASLJS Package` definition of `asljs-artefacts`, whose `LocalDeps` drew a
graph that dropped every app dependency, has been removed.

### The hand-written graph

`docs/Dependencies.md` draws a Mermaid `graph TD` with 10 nodes and 14 edges,
from the dependency to the dependent. All 14 edges are correct, but:

- 9 packages are missing: `artefacts`, `cog`, `dash`, `kb`, `logging`, `sfmt`,
  `testing`, `tmpdir` and `toolkit`;
- 12 `dependencies` edges are missing, including `observable` -> `components`,
  between two packages the graph does show;
- development dependencies are not drawn at all.

The rest of the document is the `glob` override note, which stays.

## Problem

- `NPM Package` reads `dependencies` only; development dependencies are not
  drawn.
- The root `package.json` (`asljs`, no dependencies) is a node with no edges.
- The document cannot be regenerated, because `part` has no Mermaid text output.

## Options

### Keeping the document current

1. Regenerate the graph in `docs/Dependencies.md` with `--format=mermaid` once
   [UMB] adds it, by hand or from a `toolkit` command.
2. A rule that fails when the graph in `docs/Dependencies.md` differs from the
   generated one.
3. Delete the graph from the document and give the command instead.

## Recommendation

After [UMB] adds `--format=mermaid`, regenerate the document from `NPM Package`
and add the rule in option 2, so the graph cannot drift again. Until then, a
corrected hand-written graph is a cheap interim fix: add the 9 packages and 12
edges listed above.

## Points to settle

- Which packages are nodes: all 19 workspaces, published only, and whether the
  root `package.json` is drawn. Leaving the root out needs a node filter in
  `inventory`.
- Whether development dependencies are drawn, which needs another `NPM Package`
  property. With `asljs-toolkit` a development dependency of 18 packages, they
  dominate the graph; a dotted edge style needs edge kinds in the diagram
  ([STE]).
- Edge direction: dependent to dependency (what `part` draws) or the reverse
  (what `docs/Dependencies.md` draws).
- Whether nodes are grouped into `libs` and `apps` subgraphs ([STE]).

## Where

- `apps/part/artefacts/NPM Package.md` and `apps/part/src/plugins/npm.ts` - the
  definition the graph comes from.
- `docs/Dependencies.md` - the hand-written graph.
- `apps/part/src/commands/inventory.ts` - `collectDiagramEdges`, which drops
  unresolved references, and the formats `table`, `diagram` and `json`.

[UMB]: part-better-diagram-support.md
[STE]: part-entity-stereotypes.md
