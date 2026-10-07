# part diagram

Draws the diagram a diagram document describes: which artefacts are nodes, where
the graph starts, which reference properties become edges and how they look. It
saves the diagram where the document's `Target` says, as Mermaid text, which
GitHub and most markdown previews render, or as SVG; without a target it prints
it.

```text
part diagram <document> [--stdout [--format mermaid|svg]] [--check]
```

## A diagram document

A diagram document is a markdown file. Its level 1 heading is the diagram's
name, and its sections shape the graph. The package dependency graph of a
workspace:

```markdown
# Package Dependencies

How the workspace packages depend on each other.

## Nodes

- Definitions: NPM Package
- Label: Name

## Root

- Artefacts: package.json
- Follow: Workspaces, Dependencies

## Edges

### Workspaces

- Style: invisible

### Dependencies

### DevDependencies

- Style: dotted
- Label: dev

## Layout

- Direction: LR
- Group: folder

## Output

- Target: #Diagram

## Diagram

(saved here by part diagram)
```

```bash
part diagram --definitions "asljs-part;NPM Package" "docs/Package Dependencies.md"
```

Keep diagram documents outside `--definitions` folders: every markdown file in
such a folder whose heading matches its file name is read as a definition.

Quote values that contain `*` or `_` in backticks, e.g. ``- Exclude:
`tools/**` ``, so that markdown does not read them as emphasis.

### Nodes

Required. The artefacts that may become nodes.

- `Definitions` - comma-separated definition names. Their artefacts are the
  candidates.
- `Label` - a property of the node definitions whose value labels the node.
  Without it, or when the value is empty, the label is the location.
- `Exclude` - comma-separated globs. A glob with a scheme, e.g. `git:tag/v0.*`,
  matches locations; any other glob matches the paths of `file:` artefacts
  relative to the project root.

### Root

Optional. Without it, every candidate is a node.

- `Artefacts` - comma-separated locations to start from, each a candidate. A
  value without a scheme is a path relative to the project root.
- `Follow` - comma-separated names of `Edges` sections walked from the roots.
  Default: all of them.
- `Depth` - how many steps to walk. Default: no limit. `0` draws the roots
  alone.

The nodes are the roots and every candidate they reach. Edges of properties that
are not followed are drawn only between nodes already on the diagram.

### Edges

One level 3 section per property drawn, each of type `Artefact` or `Artefact[]`.
`Property` applies to every node definition that has it; `Definition.Property`
to that definition only. A property not listed is not drawn.

- `Style` - `solid` (default), `dotted`, `thick` or `invisible`. An invisible
  edge places its nodes as if connected without drawing a line, e.g. from the
  root to every workspace.
- `Label` - text on the edge.
- `Direction` - `forward` (default), from the artefact to the one it references,
  or `reverse`.

Two properties that link the same pair draw two edges.

### Layout

- `Direction` - `TD` (default), `LR`, `BT` or `RL`.
- `Group` - `none` (default) or `folder`: a `file:` artefact is drawn in a group
  named after the folder above its own folder, e.g. `libs` for
  `libs/logging/package.json`.

### Output

Optional. Without it, the diagram is printed.

- `Target` - where the diagram is saved. A path relative to the document, or
  starting with `/` for the project root:
  - `<document>.md#<Heading>` - a `mermaid` code block in the section with that
    heading, at any level. The first such block is replaced; without one, a
    block is added at the end of the section. Nothing else in the document is
    touched, and a missing document or heading is an error. `#<Heading>` alone
    is a section of the diagram document itself.
  - `<file>.mmd` - the Mermaid text.
  - `<file>.svg` - the SVG, rendered with the Mermaid CLI.

A target is written only when its content changes; missing folders are created.

## Options

- `--stdout` prints the diagram instead of saving it to the `Target`.
- `--format mermaid` (default) or `--format svg` - the format when printing.
  With a `Target` and no `--stdout` it is an error: the target decides.
- `--check` saves nothing and exits with a non-zero code when the `Target` is
  missing or differs from the generated diagram, e.g. to keep a committed
  diagram current in CI. It needs a `.md#<Heading>` or `.mmd` target.

SVG needs the Mermaid CLI, which is not installed with `asljs-part`: `npm
install @mermaid-js/mermaid-cli`. `PART_MMDC_PATH` replaces the `mmdc` script.

A reference to a location that is not an artefact, or that resolves outside the
project, is skipped and logged as a warning; pass `--loglevel warning` to see
it. A reference to an artefact that is not a candidate, or that the roots do not
reach, is skipped silently.

## See also

- [Options][OPT] - the options every action takes.
- [RQ124 CLI Diagram action][RQ124] and [RQ206 Diagram document][RQ206] - the
  requirements.

[OPT]: Options.md
[RQ124]: <../development/RQ124 CLI Diagram action.md>
[RQ206]: <../development/RQ206 Diagram document.md>
