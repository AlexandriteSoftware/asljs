# AGENTS

## Purpose

Use this file as AI-facing guidance for `asljs-part`.

This package provides markdown-defined project artefact tracing plus a CLI for
inventory, definition inspection, and rule checks.

## AI Quick Reference

Public behavior at a glance:

- definitions are markdown files with a level 1 heading matching the file name
- definitions require a `Location` section to be valid
- definition `Location` paths are resolved relative to the definition file
- definitions can declare `Properties` and `Rules`
- rules resolve from a sibling `parts/` directory
- JavaScript rules receive `context.artefacts` as an `ArtefactProvider`
  rooted at the current repository
- cli command `inventory` shows all matching definitions for each artefact
- cli command `check` runs all rules from all matching definitions for each
  artefact
- cli command `check` shows failures only by default; `--with-positives`
  includes `OK` rows
- cli command `init` bootstraps a definitions directory with artefact templates
- cli command `update` creates missing JS rule files and refreshes stale rules

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
- Use `ArtefactProvider` when you need definition-aware artefact discovery or
  to inspect which definitions apply to a file.
- Use the report builders for embedding inventory or check flows in scripts.
- Keep stable public usage on the package-root exports; treat other `src/*`
  files as internal implementation unless they are re-exported.

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

## CLI Contract

### version

- Prints the package version from `package.json`.

### init

- Copies `Artefact Definition.md` and `Rule File.md` into the chosen
  definitions directory.
- Ensures a sibling `parts/` directory exists in the chosen definitions
  directory.
- Uses the current working directory by default and `--definitions <path>` when
  provided.

### inventory

- Scans artefacts matched by discovered definitions.
- Shows all definitions that apply to the same artefact.
- Reports `Fail` when any contributing rule fails.

### artefactdefinition

- Without a target, lists discovered definitions.
- With a target, prints the selected definition in detail.

### check

- Runs rules for artefacts matched by definitions and an optional path pattern.
- Aggregates rules from all definitions that apply to the same artefact.
- Returns a non-zero exit code when any rule fails.
- Shows only failing rows by default.
- `--with-positives` includes passing `OK` rows.
- Rows are sorted by path, then by rule.

### update-rules

- Scans rules from discovered definitions in the chosen definitions directory.
- Creates missing JavaScript rule files in a sibling `parts/` directory.
- Updates JavaScript rule files whose first comment no longer matches the rule
  text from the definition.
- Skips non-JavaScript rule files and reports a warning for each skipped file.
- Prompts the AI runner to return the complete file content on standard output;
  the runner must not edit files directly.
- Uses `PART_COPILOT_CLI_COMMAND` when set as the command used to generate the
  rule file content. PART writes the prompt to the command's standard input and
  reads the generated file content from standard output.
- `--dry-run` prints the prompts that would be sent to the AI runner and does
  not invoke the runner or write files.

When `PART_COPILOT_CLI_COMMAND` is not set, first tries

```pwsh
gh copilot -p <prompt> `
--allow-all-tools `
--allow-all-paths `
--no-ask-user `
--silent
```

and then falls back to

```pwsh
copilot -p <prompt> `
--allow-all-tools `
--allow-all-paths `
--no-ask-user `
--silent
```
