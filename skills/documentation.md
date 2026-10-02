# documentation

Use when: writing or changing documentation.

Write documentation that is:

- developer-focused
- precise and structured
- implementation-aware
- list-first unless the information is inherently tabular

## Include

- Purpose
- Usage
- Constraints
- Examples
- Edge cases

## Where it goes

- A package `README.md` is a landing page, not a manual. Its rules live in the
  [Package README][AFR] artefact definition and are checked by `part check`.
- Everything else belongs in the package's `docs` directory: the full API
  surface, edge cases, payload and event reference, migration notes, rationale
  for design decisions, trade-offs, and performance characteristics.
- Inside `docs`, each page opens with `## Purpose` and continues with the
  sections under **Include** above. That is the one place the direct name is
  right, because the reader is already past the decision and looking for a
  specific answer.
- Presentation rules for all repository documentation are in
  [CONVENTIONS.md][CNV] under **Documentation style**.

## Which file changes

Human-facing docs and AI-facing docs stay separate.

- `README.md` is for human usage, examples, and public behavior.
- `AGENTS.md` is for AI-facing constraints, package boundaries, and validation
  guidance.
- [HOWTO.md][HTO] is for recurring repository commands.
- [release][SKE] is about publishing packages.
- `docs/` is for everything factual about the repository and its packages.

Decide what must change together:

- If public behavior or a package-root API changed, then update tests.
- If public behavior changed in a way users need to understand, then update
  `README.md`.
- If public behavior changed in a way AI needs to preserve, validate, or avoid
  breaking, then update `AGENTS.md`.
- If the change is an internal refactor only, then update tests when behavior
  risk exists, and usually leave `README.md` and `AGENTS.md` alone.
- If build, release, or deployment behavior changed and executable behavior was
  affected, then update tests where that behavior is checked.
- If build, release, or deployment behavior changed for human workflow, then
  update the relevant workflow docs.
- If build, release, or deployment behavior changed in a way AI needs to know
  for validation or execution, then update `AGENTS.md`.
- If only generated output changed, then do not update source docs or tests just
  for the generated diff. When a generated file changes because source behavior
  changed, update the source tests and source docs from the underlying behavior
  change, not from the generated diff.

[AFR]: <../aftefacts/Package README.md>
[CNV]: <../CONVENTIONS.md>
[HTO]: <../HOWTO.md>
[SKE]: <release.md>
