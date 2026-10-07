# RQ206 Diagram document

A diagram document describes a diagram: which artefacts are its nodes, where the
graph starts, which reference properties become edges and how they are drawn.
`part diagram` reads it, see [RQ124][RQ124]. The format is documented in
[part diagram][1]; this requirement states how it is read and applied.

A diagram document is a markdown file whose level 1 heading is the diagram's
name. Settings are list items `- Key: value` in level 2 sections, and in level 3
sections under `## Edges`. Backticks around a value are removed. A list item
whose key the section does not define is an error, so a misspelt setting is not
ignored. Every error names the document.

- `## Nodes` is required and needs `Definitions`, a comma-separated list of
  definition names; an unknown name is an error. `Label` names a property of a
  node definition; any other name is an error. `Exclude` lists globs: one with a
  scheme matches the location, any other the path of a `file:` artefact relative
  to the project root.
- `## Root` is optional and needs `Artefacts`. A value without a scheme is a
  path relative to the project root, and each must be a candidate. `Follow`
  names `## Edges` sections; any other name is an error. `Depth` is a whole
  number.
- Each level 3 section under `## Edges` names a property, `Property` or
  `Definition.Property`. The property must exist in the node definitions, the
  named definition must be a node definition, and the type must be `Artefact` or
  `Artefact[]`. A heading listed twice is an error. `Style` is one of `solid`,
  `dotted`, `thick` and `invisible`; `Direction` is `forward` or `reverse`.
- `## Layout` takes `Direction`, one of `TD`, `LR`, `BT` and `RL`, and `Group`,
  `none` or `folder`. Choice values are case-insensitive.
- `## Diagram` holds the generated text and is not read as settings.

Building the diagram:

1. The candidates are the artefacts of the node definitions, less `Exclude`.
2. Without a root, every candidate is a node. With a root, the nodes are the
   roots and the candidates reached from them along the followed properties,
   breadth-first, up to `Depth` steps.
3. For each node in location order, and each `## Edges` section in document
   order, every value of the property that resolves to another node is an edge.
   A value with a scheme is a location; any other value is a path relative to
   the referencing `file:` artefact. `reverse` swaps the ends.
4. A value that resolves outside the project, or to a location that is no
   artefact of any loaded definition, is logged as a warning naming the
   document, the property, the artefact and the value. A value that resolves to
   an artefact that is not a node is skipped without a warning. Empty values are
   ignored.
5. The label is the first non-empty string value of `Label` among the node's
   definitions, in name order, or the location printed as in reports.
6. With `Group: folder`, a `file:` artefact belongs to the folder above its own
   folder; an artefact with no such folder, or of another scheme, is not
   grouped.

The Mermaid text is `graph <Direction>`, then a `subgraph` per group in name
order with its nodes, then the ungrouped nodes, then the edges. Nodes are
`id["label"]`; edges are `-->`, `-.->`, `==>` or `~~~`, with `|"label"|` after
the arrow when labelled, except for invisible edges. A node id is `n` and its
printed location with every character outside `[A-Za-z0-9_]` replaced by `_`,
and `_2`, `_3` and on appended when ids collide; group ids start with `g`.
Double quotes in labels are written as `#quot;`.

[1]: <../docs/part diagram.md>
[RQ124]: <RQ124 CLI Diagram action.md>
