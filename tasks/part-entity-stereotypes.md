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
definition, or a non-file artefact a plugin locates. `part diagram` draws what a
diagram document describes ([DIA]):

- every node is an artefact of the document's node definitions, labelled with
  its location or a property value; all nodes look the same;
- every value of a listed `Artefact` or `Artefact[]` property is an edge, styled
  per property (`solid`, `dotted`, `thick`, `invisible`), with a label and a
  direction;
- `Group: folder` puts `file:` artefacts in a subgraph named after the folder
  above their own, e.g. `libs` and `apps` for packages.

Per-property edge styles, which this task once proposed, are in place: the
package graph in `docs/Dependencies.md` draws `Dependencies` solid and
`DevDependencies` dotted. The styling lives in the diagram document, not in the
definitions.

A definition already plays the part of a UML stereotype: it names the kind of
thing an artefact is. The diagram just does not show it.

## Problem

What a diagram of artefacts still cannot express:

- **Nodes of different kinds.** A package, a requirement and an article all look
  the same. The definition names are in the inventory but not on the diagram.
- **Containment by artefact.** `Group: folder` groups by a folder name, not by
  an artefact. The folder of each `NPM Package` contains `Article`, `Package
  README` and `Unit Test File` artefacts, but a diagram that mixes them shows a
  package and its files as unrelated nodes.
- **Links as artefacts.** Some files describe a relationship rather than a
  thing, for example a document recording why one package depends on another.
  Drawn as a node it adds two edges where a reader expects one. No definition in
  this repository or in EdGames is of that kind today.

## Options

1. A `## Styles` section in the diagram document: one level 3 section per node
   definition with a Mermaid shape and colour, written as `classDef`; and a
   `Group: artefact` layout that nests the artefacts under a `file:` node
   artefact's folder inside it.
   - Pro: no definition syntax; the document already owns the look, as it does
     for edges.
   - Con: every document that wants kinds repeats the styles.
2. A `## Diagram` section in a definition, for example `- Shape: Container` or
   `- Shape: Link` with the two `Artefact` properties that name the ends.
   - Pro: the author decides once; supports link artefacts.
   - Con: new definition syntax to parse, validate, document in `Artefact
     Definition.md` and keep in step in every copy of it (EdGames keeps one in
     `docs/artefacts`); and it collides with the `## Diagram` section of a
     diagram document in name.

### Recommendation

Option 1, starting with node styles per definition, which is small and shows
kinds on the existing package and source diagrams ([SRC]). Leave link artefacts
until a definition actually describes a relationship; designing the syntax
before that would be guessing.

## Points to settle

- Whether `Group: artefact` nests only artefacts that are both on the diagram,
  or may also form a group from an artefact that is not a node.
- How a node that matches several definitions is styled. `inventory` already
  reports all of them, sorted by name.

## Where

- `apps/part/src/diagram/diagram-document-reader.ts` - the diagram document
  sections.
- `apps/part/src/diagram/diagram-builder.ts` - nodes, edges and groups.
- `apps/part/src/diagram/mermaid.ts` - the Mermaid text, where `classDef` and
  nested subgraphs would be written.
- `apps/part/artefacts/Artefact Definition.md` - the definition format, which
  option 2 would extend.

[DIA]: <../apps/part/docs/part diagram.md>
[SRC]: part-source-file-dependency-diagram.md
