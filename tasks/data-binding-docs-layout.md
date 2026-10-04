# data-binding-docs-layout

`AGENTS.md` repeats the binding reference rather than adding AI-facing
constraints beyond it.

Package: `data-binding`.

The binding syntax and pipe reference now live in `docs/Bindings.md` and
`docs/Pipes.md`, and the README is trimmed to the `Package README` artefact's
sections. `AGENTS.md` still carries its own copy of the quick reference: the
binding contract, the binding-family decision list, the unsupported syntax and
the authoring rules. Two copies drift.

Proposed fix: replace the duplicated sections of `AGENTS.md` with a link to
`docs/`, and keep only the constraints to preserve, the change safety checklist
and the validation commands.

## Where

- `libs/data-binding/AGENTS.md` - the duplicated quick reference.
- `libs/data-binding/docs/` - the reference it duplicates.
