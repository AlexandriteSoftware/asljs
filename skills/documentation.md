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
  `Package README` artefact definition, `aftefacts/Package README.md`, and are
  checked by `part check`.
- Everything else belongs in the package's `docs` directory: the full API
  surface, edge cases, payload and event reference, migration notes, rationale
  for design decisions, trade-offs, and performance characteristics.
- Inside `docs`, each page opens with `## Purpose` and continues with the
  sections under **Include** above. That is the one place the direct name is
  right, because the reader is already past the decision and looking for a
  specific answer.
- Presentation rules for all repository documentation are in `CONVENTIONS.md`
  under **Documentation style**.
