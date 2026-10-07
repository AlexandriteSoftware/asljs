# part-entity-stereotypes

Let a definition say how its artefacts appear on a diagram: as nodes, as edges
between other artefacts, or as containers that group them.

Package: `part`.

## Context

Moved from `part/TODO.md`, where it read "support for entity stereotypes: links,
nodes, containers?". The question mark was in the original; the three kinds are
a suggestion, not a decision.

`part` has no stereotype and no "entity". Its terms are the definition, which
describes a kind of file, and the artefact, which is a file matched by a
definition, or a non-file artefact a plugin locates. The diagram ([UMB]) treats
them uniformly:

- every artefact is a node, labelled with its relative path;
- every value of an `Artefact` or `Artefact[]` property is an edge from the
  artefact to the referenced one;
- nothing groups nodes. `buildMermaidDiagram` in
  `apps/part/src/commands/inventory.ts` writes one flat `graph TD`.

A definition already plays the part of a UML stereotype: it names the kind of
thing an artefact is. The diagram just does not show it.

## Problem

Three things a diagram of artefacts would need, which the uniform treatment
cannot express:

- **Nodes of different kinds.** A package, a requirement and an article all look
  the same. The definition names are in the inventory but not on the diagram.
- **Containers.** Some artefacts contain others by path. The folder of each
  `ASLJS Package` (whose artefact is its `package.json`) contains `Article`,
  `Package README` and `Unit Test File` artefacts, and `libs`/`apps` group the
  packages. A diagram that mixes them shows a package and its files as unrelated
  nodes.
- **Links as artefacts.** Some files describe a relationship rather than a
  thing, for example a document recording why one package depends on another.
  Drawn as a node it adds two edges where a reader expects one. No definition in
  this repository or in EdGames is of that kind today.

## Options

1. Show the definition on the node and infer containment from paths; no new
   syntax.
   - Pro: uses only what `part` already knows; definitions do not change.
   - Pro: Mermaid draws containers as `subgraph` and kinds as `classDef` styles,
     so both fit the current output.
   - Con: artefacts are files, so a container has to be inferred from a file
     that stands for its folder, such as a `package.json`; and every such file
     becomes a container, wanted or not.
2. An explicit `## Diagram` section in a definition, for example `- Shape:
   Container` or `- Shape: Link` with the two `Artefact` properties that name
   the ends.
   - Pro: the author decides; supports link artefacts.
   - Con: new definition syntax to parse, validate, document in `Artefact
     Definition.md` and keep in step in every copy of it (EdGames keeps one in
     `docs/artefacts`).
3. Per-property edge styles, for example `- Edge: dotted` under a property, so
   `LocalDevDeps` can be drawn differently from `LocalDeps` ([DEP]).
   - Pro: small; answers a need that exists in this repository.
   - Con: covers edges only.

### Recommendation

Narrow the task to option 1: definition names as a node label or class, and path
containment as subgraphs, behind an option so the flat graph stays available. It
needs no definition syntax and makes the package and source diagrams ([DEP],
[SRC]) readable.

Add option 3 when `LocalDevDeps` lands. Leave link artefacts (option 2) until a
definition actually describes a relationship; designing the syntax before that
would be guessing.

## Points to settle

- Whether containment is drawn only between artefacts that are both on the
  diagram, or whether a directory that is not an artefact (`libs`, `apps`) may
  also form a group.
- How a node that matches several definitions is styled. `inventory` already
  reports all of them, sorted by name.

## Where

- `apps/part/src/commands/inventory.ts` - `buildInventoryDiagramSvg` and
  `buildMermaidDiagram`, which build the flat graph.
- `apps/part/src/providers/artefact-definition-provider.ts` -
  `#parseProperties`, where per-property or per-definition diagram settings
  would be read.
- `apps/part/artefacts/Artefact Definition.md` - the definition format, which
  option 2 or 3 would extend.

[UMB]: part-better-diagram-support.md
[DEP]: part-project-deps-diagram.md
[SRC]: part-source-file-dependency-diagram.md
