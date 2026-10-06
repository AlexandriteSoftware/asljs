# part-better-diagram-support

Make the inventory diagram usable as a document: emit Mermaid text, not only
SVG, and fix the gaps that make the current output hard to trust.

Package: `part`.

## Context

Moved from `part/TODO.md`, where "better support for diagrams" headed the other
diagram items. `part` already has one diagram, so this task covers what that
diagram lacks. The narrower items are separate tasks:

- [DEP] - the package graph, the first diagram to generate.
- [SRC] - the source file graph.
- [TYP] - which diagram types `part` should draw.
- [STE] - how a definition says whether its artefacts are nodes, edges or
  containers.
- [EDT] - the open question of a diagram editor.

`part inventory --format=diagram` turns the inventory into a Mermaid `graph TD`
and renders it to SVG with the Mermaid CLI. `buildInventoryDiagramSvg` in
`apps/part/src/commands/inventory.ts` makes one node per artefact, labelled with
its relative path, and one edge per value of a property whose type is `Artefact`
or `Artefact[]`:

```ts
function buildMermaidDiagram(nodes, edges)
{
  const lines = [ 'graph TD' ];
  // `  n<id>["<relative path>"]` per node
  // `  n<from> --> n<to>` per edge
}
```

The text is written to a temporary `inventory.mmd`, `mmdc` turns it into
`inventory.svg`, and the SVG goes to standard output. `PART_MMDC_PATH` replaces
the `mmdc` binary, which is how the RQ206 tests in
`apps/part/src/commands/inventory.test.ts` avoid a browser: their fake `mmdc`
writes the graph into the SVG's `<desc>`.

The only definition in this repository with an `Artefact[]` property is `ASLJS
Package` (`LocalDeps`), so the package graph is the only diagram the repository
can draw today ([DEP]).

## Problem

- There is no way to get the Mermaid text. GitHub renders a fenced `mermaid`
  block in markdown, and `docs/Dependencies.md` is such a block, maintained by
  hand. `part` builds exactly that text and then throws it away.
- The two requirements disagree. `RQ121 CLI Inventory action` says the `diagram`
  format "produces a Mermaid diagram" and shows `graph TD` text; `RQ206 Diagram`
  says it saves an SVG, which is what the code and the README do.
- Rendering needs `@mermaid-js/mermaid-cli`, a runtime dependency of
  `asljs-part` that brings Puppeteer and a headless Chrome. It is 116 MB in
  `node_modules/@mermaid-js` alone, and a render of the 18 packages took about
  14 seconds. Every consumer pays for it, including those that never draw.
- A reference to an artefact that is not on the diagram is dropped silently (`if
  (!nodeById.has(referencedPath)) continue;` in `collectDiagramEdges`). That is
  what hides the wrong `LocalDeps` paths described in [DEP].
- Nodes carry the path only. The definitions an artefact matches, which the
  table and JSON formats show, are not on the diagram.
- `toMermaidId` maps every character outside `[A-Za-z0-9_]` to `_`, so `a-b.md`
  and `a_b.md` become the same node.
- `inventory` has no path filter (`check` takes a `[pattern]` argument,
  `inventory` does not), so a diagram covers every artefact of the selected
  definitions. For a file-level graph that is hundreds of nodes ([SRC]).

## Options

### Output format

1. Mermaid text (`--format=mermaid`), with `diagram` kept as the SVG render.
   - Pro: renders on GitHub and in VS Code's markdown preview, so the output can
     be pasted into or regenerated inside a markdown file.
   - Pro: no browser needed; testable by comparing strings.
   - Pro: the code already exists; it only needs to reach standard output.
   - Con: Mermaid lays out large graphs poorly, and the renderer's defaults stop
     at a text size and edge count, so it suits package-sized graphs better than
     file-sized ones.
2. Graphviz DOT (`--format=dot`).
   - Pro: the strongest layout for large directed graphs; the usual output of
     dependency-cruiser and madge.
   - Con: GitHub does not render it; viewing needs the `dot` binary, which is
     not an npm package, or a WebAssembly build of it.
3. PlantUML.
   - Pro: the widest set of UML diagram types ([TYP]).
   - Con: needs Java or a PlantUML server, and GitHub does not render it.

### The Mermaid CLI dependency

1. Keep it as a dependency. Pro: `--format=diagram` works after install. Con:
   the size and install time above, for every consumer.
2. Make it an optional peer dependency and fail with a clear message when it is
   missing. Pro: `part` installs lightly; the SVG path stays one install away.
   Con: one more step for those who want SVG.
3. Drop SVG output and leave rendering to GitHub, editors and the Mermaid tools.
   Pro: smallest `part`. Con: removes a documented format (RQ206).

### Recommendation

Add `--format=mermaid`, printing the text `buildMermaidDiagram` already builds,
and make it the format the documents use. Keep `diagram` as SVG, but move
`@mermaid-js/mermaid-cli` to an optional peer dependency. In the same change:

- correct RQ121 to show `mermaid` as the text format and `diagram` as SVG;
- report on standard error each reference that resolves to no node, instead of
  dropping it;
- label nodes with the path and the matched definitions;
- give nodes collision-free ids, for example an index into the sorted list;
- give `inventory` the same `[pattern]` argument as `check`.

DOT is worth adding only when a file-level graph proves too large for Mermaid
([SRC]); PlantUML only if [TYP] lands on a type Mermaid cannot draw.

## Points to settle

- Whether `--format=mermaid` wraps its output in a markdown fence, so it can be
  written straight into a `.md` file, or prints bare Mermaid, so it can be
  written to `.mmd`. Bare text with the caller adding the fence is the simpler
  contract.
- Edge direction. `part` draws an edge from the artefact to the one it
  references, as RQ206 states; `docs/Dependencies.md` draws from the dependency
  to the dependent. One has to change if the document is generated.

## Where

- `apps/part/src/commands/inventory.ts` - `getInventoryFormat`,
  `buildInventoryDiagramSvg`, `collectDiagramEdges`, `buildMermaidDiagram`,
  `toMermaidId`, `renderMermaidToSvg`, `resolveMermaidCliPath`.
- `apps/part/src/commands/inventory.test.ts` - the RQ206 tests and their fake
  `mmdc`.
- `apps/part/src/cli.ts` - the `inventory` command's options.
- `apps/part/development/RQ121 CLI Inventory action.md` - the format list and
  the Mermaid example that disagrees with RQ206.
- `apps/part/development/RQ206 Diagram.md` - the SVG requirement.
- `apps/part/package.json` - `@mermaid-js/mermaid-cli` in `dependencies`.
- `apps/part/README.md`, `apps/part/DEVELOPMENT.md` - describe the SVG output.

[DEP]: part-project-deps-diagram.md
[SRC]: part-source-file-dependency-diagram.md
[TYP]: part-diagram-types.md
[STE]: part-entity-stereotypes.md
[EDT]: part-diagram-editor.md
