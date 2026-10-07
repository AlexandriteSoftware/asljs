# RQ124 CLI Diagram action

When CLI is invoked with Diagram action and the path of a diagram document,
relative to the working directory, it builds the diagram the document describes
(see [RQ206][RQ206]) from the loaded definitions.

```text
part diagram <document> [--format mermaid|svg] [--write] [--check]
```

Parameters:

- `--format=...` - `mermaid` (default) prints the Mermaid text; `svg` renders it
  with the Mermaid CLI and prints the SVG. Any other format is an error.
- `--write` - instead of printing, puts the Mermaid text, fenced as `mermaid`,
  in place of the first `mermaid` code block of the document's `## Diagram`
  section. Without such a block, the block is added at the end of the section;
  without the section, the section is added at the end of the document. The file
  is written only when it changes.
- `--check` - instead of printing, compares the first `mermaid` block of the `##
  Diagram` section with the generated text. When the block is missing or
  differs, it writes a message naming the document to standard error and sets a
  non-zero exit code.

`--write` and `--check` together, or either with `--format=svg`, are an error.

The Mermaid CLI, `@mermaid-js/mermaid-cli`, is an optional peer dependency of
`asljs-part`. When it is not installed, `--format=svg` fails with a message
saying how to install it. `PART_MMDC_PATH` replaces the path of its `mmdc`
script.

[RQ206]: <RQ206 Diagram document.md>
