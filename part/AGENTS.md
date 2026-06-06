# ASLJS PART AI Guidance

## Purpose

Use this file as AI-facing guidance for `asljs-part`.

This package provides markdown-defined project artefact tracing plus a CLI for
inventory, definition inspection, and rule checks.

## Package Scope

Root exports:

- `runCli`
- `Definition`
- `DefinitionProvider`
- `GitIgnore`
- `buildInventoryReport`
- `buildArtefactDefinitionReport`
- `buildCheckReport`
- `generateInventoryTable`

The `part` executable is also part of the supported package surface.

## AI Quick Reference

Public behavior at a glance:

- definitions are markdown files with a level 1 heading matching the file name
- definitions require a `Location` section to be valid
- definitions can declare `Properties` and `Rules`
- rules resolve from a sibling `rules/` directory first, then the repository
  `part/` folder
- `inventory` shows all matching definitions for each artefact
- `check` runs all rules from all matching definitions for each artefact
- `check` returns a non-zero exit code on any failure
- `check` shows failures only by default; `--with-positives` includes `OK`
  rows

Use this package when:

- a repository needs markdown-defined artefact categories
- you need a CLI inventory of project artefacts
- you need repo-local rule checks for markdown-defined artefacts
- another Node.js tool wants to embed PART via the package-root report helpers

Do not assume:

- every markdown file is a definition
- artefact `.gitignore` filtering is always on; it is opt-in per definition
- only one definition can apply to a file
- passing rows are shown by default in `check`
- internal helper modules such as `markdown.js` are part of the public API

## Preferred Usage Patterns

- Use `runCli(...)` when you want the same behavior as the `part` executable.
- Use `DefinitionProvider` to discover definitions rather than hand-rolling
  markdown scans.
- Use the report builders for embedding inventory or check flows in scripts.
- Keep stable public usage on the package-root exports; treat other `src/*`
  files as internal implementation unless they are re-exported.

## Constraints To Preserve

- A valid definition must have a level 1 heading matching the file name and a
  `Location` section.
- Rules must continue to support IDs such as `R1` and `RL10`.
- `inventory` must preserve the ability to show more than one matching
  definition for the same artefact.
- `check` must continue to aggregate rules across all matching definitions for
  the same artefact.
- `check` must continue to return non-zero on failures and sort by path, then
  by rule.

## Edit Safety Checklist

- If changing definition parsing, then re-check heading validation and location
  parsing.
- If changing discovery, then re-check `.gitignore` behavior for both
  definition discovery and artefact locations.
- If changing rule execution, then re-check both JavaScript rules and external
  executable rules.
- If changing CLI output, then re-check `inventory`, `artefactdefinition`, and
  `check` contract tests.

## Validation

- `npm -w asljs-part run test`
- `npm -w asljs-part run lint`

Update this file when AI-facing exported-surface expectations, CLI contracts,
or validation commands change. Update `README.md` separately only when
user-facing behavior changes.
