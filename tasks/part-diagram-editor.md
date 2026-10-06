# part-diagram-editor

An open question, recorded as "diagram editor?": whether `part` should offer a
way to edit diagrams. Nothing about it has been decided.

Package: `part`.

## Context

Moved from `part/TODO.md`, where it read "diagram editor?" with the question
mark.

`part` is a command-line tool. Its diagram is generated from the inventory and
written to standard output as SVG ([UMB]); there is nothing stored to edit, and
`part` has no user interface. The repository has a user-interface library
(`libs/components`) and an application builder (`apps/app-builder`), but neither
is connected to `part`.

## Problem

The note does not say what would be edited, so the need is unknown. The
plausible readings are different projects:

1. **Editing the layout of a generated diagram** - moving nodes and keeping the
   positions across regenerations. Mermaid has no stored layout, so this needs a
   format of `part`'s own.
2. **Editing artefacts through the diagram** - adding a reference by drawing an
   edge, which would write a property value back into a file. `part`'s data
   providers only read; there is no write path from a property to a file.
3. **Editing hand-written diagrams** - Mermaid or other diagram files kept as
   artefacts ([TYP]). Existing editors already do this: the Mermaid Live Editor,
   the Mermaid preview in VS Code, and GitHub's markdown preview.

## Options

1. Drop it.
   - Pro: none of the three readings has a user or a definition that needs it;
     reading 3 is served by existing tools once [UMB] adds Mermaid text output,
     which any Mermaid editor can open.
   - Con: loses the note, if a real need was behind it.
2. Keep it, narrowed to one reading, with the user and the artefacts it serves
   stated.
   - Pro: makes it actionable.
   - Con: requires the decision this note never recorded.
3. Keep it as written.
   - Con: an open question in a task list nobody can act on.

### Recommendation

Drop it, and note in [UMB] that Mermaid text output is the way into existing
editors. Reading 2 is the only one that would be specific to `part`; if it comes
back, it should come back as its own task, starting from a write path for
property values, which `part` does not have.

## Points to settle

- Who the editor is for, and which of the three readings was meant.
- If reading 2: how a property value maps back to text in a file, since each
  data provider parses its own format.

## Where

- `apps/part/src/commands/inventory.ts` - the only diagram code.
- `apps/part/src/artefact-data-providing-function.ts` - the read-only `getData`
  contract that reading 2 would have to extend.

[UMB]: part-better-diagram-support.md
[TYP]: part-diagram-types.md
