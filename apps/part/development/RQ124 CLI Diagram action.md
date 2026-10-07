# RQ124 CLI Diagram action

When CLI is invoked with Diagram action and the path of a diagram document,
relative to the working directory, it builds the diagram the document describes
(see [RQ206][RQ206]) from the loaded definitions.

```text
part diagram <document> [--stdout [--format mermaid|svg]] [--check]
```

The diagram is saved to the document's `Target` (see [RQ206][RQ206]):

- a section of a markdown document: the first `mermaid` code block of the first
  section with the target heading, at any level, is replaced with the Mermaid
  text, fenced as `mermaid`; without such a block, the block is added at the end
  of the section. A missing document or heading is an error;
- a `.mmd` file: the Mermaid text and a newline;
- a `.svg` file: the SVG render and a newline.

A target is written only when its content changes, creating missing folders.
Without a `Target`, the diagram is printed to standard output.

Parameters:

- `--stdout` - print instead of saving to the `Target`.
- `--format=...` - the format when printing: `mermaid` (default) prints the
  Mermaid text; `svg` renders it with the Mermaid CLI and prints the SVG. Any
  other format is an error, and so is `--format` when the diagram is saved to a
  `Target`.
- `--check` - instead of saving, compares the `Target` with the generated
  diagram. When it is missing or differs, it writes a message naming the target
  to standard error and sets a non-zero exit code. `--check` without a `Target`,
  with an `.svg` target, or with `--stdout` is an error.

The Mermaid CLI, `@mermaid-js/mermaid-cli`, is an optional peer dependency of
`asljs-part`. When it is not installed, `--format=svg` fails with a message
saying how to install it. `PART_MMDC_PATH` replaces the path of its `mmdc`
script.

[RQ206]: <RQ206 Diagram document.md>
