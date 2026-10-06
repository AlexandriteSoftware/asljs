# part-diagram-types

Decide which diagram types `part` should produce beyond its one dependency-style
graph, given what its model can supply.

Package: `part`.

## Context

Moved from `part/TODO.md`, where it listed flowchart, sequence, class, state,
component, deployment, use case and activity diagrams.

`part` draws one type today: a Mermaid `graph TD` of artefacts and the
references between them, rendered to SVG ([UMB]). What it knows about an
artefact is its path, the definitions it matches, and the property values its
data providers return (`--format=json` shows them all). A property of type
`Artefact` or `Artefact[]` is the only kind of relationship.

## Problem

The list names the UML and Mermaid catalogue, not needs. Each type requires data
that `part` either has or does not:

- Flowchart (graph): nodes and directed edges. In the model; it is the current
  diagram.
- Class: nodes with attributes, and associations. In the model; property values
  are the attributes, references the associations.
- Component: nodes grouped into containers. Partly; containment is in the paths
  but is not drawn ([STE]).
- Deployment: nodes placed on infrastructure. Not in the model.
- Sequence: ordered messages between participants. Not in the model.
- State: states and transitions. Not in the model.
- Activity: ordered steps and branches. Not in the model.
- Use case: actors and their goals. Not in the model.

The last five describe behaviour or environment. A data provider could return
such data, but nothing in `part` or in the definitions of this repository or
EdGames does, and no generic rule would turn an inventory into a sequence.

## Options

1. Generate only the structural types: keep the graph, add a class view
   (`classDiagram`, one class per artefact with its property values, one
   association per reference), and get component-like grouping from [STE].
   - Pro: every type is fed by data `part` already has.
   - Con: a class view of many artefacts with many properties is large.
2. Treat behavioural diagrams as artefacts, not output: a `Diagram` definition
   for `*.mmd` files or `mermaid` blocks in markdown, with a rule that fails
   when Mermaid cannot parse one.
   - Pro: covers every type the list names, authored by hand where they are
     written anyway; `part`'s role stays checking artefacts.
   - Con: the parse rule needs Mermaid in the rule's process; the CLI that
     renders it is the dependency [UMB] proposes to make optional.
3. Let a data provider return diagram text itself, which `part` passes through.
   - Pro: anything is possible.
   - Con: `part` adds nothing; a script would do the same.

### Recommendation

Narrow the task to option 1's class view, and only once [UMB] has a text output
to build it on; drop the behavioural types from what `part` generates. Option 2
is a separate, small idea for whoever first keeps Mermaid diagrams in the
repository's documents (today only `docs/Dependencies.md` and `RQ121 CLI
Inventory action.md` contain one), and would be a definition in `aftefacts`, not
`part` code.

## Points to settle

- How a type is chosen: a new `--format` value per type (`mermaid-class`) or a
  separate `--diagram <type>` option next to `--format=mermaid|diagram`.
- Which properties appear as class attributes: all, or those named with
  `--with-properties`, as the table format does.

## Where

- `apps/part/src/commands/inventory.ts` - `getInventoryFormat`,
  `buildMermaidDiagram`, and `buildJsonInventory`, which already collects the
  property values a class view would show.
- `apps/part/development/RQ206 Diagram.md` - the requirement for the one type
  that exists.

[UMB]: part-better-diagram-support.md
[STE]: part-entity-stereotypes.md
