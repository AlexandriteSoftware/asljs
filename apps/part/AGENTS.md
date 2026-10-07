# AGENTS

## Purpose

Use this file as AI-facing guidance for `asljs-part`.

This package provides markdown-defined project artefact tracing, a plugin
runtime that implements definitions in code, plus a CLI for inventory,
definition inspection, and rule checks.

## AI Quick Reference

Public behavior at a glance:

- definitions are markdown files in the definitions directory whose level 1
  heading matches the file name; no other section is required
- the definitions directory should hold only definitions: any markdown file
  there with a matching heading becomes one
- `Location`, `Properties` and `Rules` are optional; definition `Location` paths
  are resolved relative to the definition file
- a definition with no `Location` and no plugin locator has no artefacts
- rules are `### <Id>` sections; ids are uppercase letters followed by digits
- plugins are modules loaded with `--plugin` (repeatable) or `PART_PLUGINS`; the
  default export is a factory returning `{ name, definitions?, locate?, data?,
  rules? }`
- plugin rules, data functions and locators bind by definition name (and rule
  id); a plugin locator replaces the definition's `Location`
- plugin load failures, unknown bindings and definition name clashes are fatal
- artefacts are `{ location, name, definitions }`; `location` is a URI string
  (`file:docs/A.md`, `npm:...`, `git:tag/...`); rules get file paths through
  `context.files.path(artefact)`
- JavaScript rules receive `context.artefacts` as an `ArtefactProvider` rooted
  at the project
- cli command `inventory` shows all matching definitions for each artefact
- cli command `check` runs all rules from all matching definitions for each
  artefact; a rule no plugin implements is `Skip`
- cli command `check` shows failures only by default; `--with-positives` adds
  `OK` rows, `--with-skipped` adds `Skip` rows
- built-in plugins `asljs-part/plugins/npm` and `asljs-part/plugins/git` are
  opt-in

Use this package when:

- a repository needs markdown-defined artefact categories
- you need a CLI inventory of project artefacts
- you need repo-local rule checks for project artefacts
- another Node.js tool wants to embed PART via `runCli(...)` or the providers

Do not assume:

- every markdown file is a definition
- artefact `.gitignore` filtering is always on; it is opt-in per definition
- only one definition can apply to an artefact
- every artefact is a file
- passing or skipped rows are shown by default in `check`
- internal helper modules such as `markdown-document-queries.js` are part of the
  public API

## Preferred Usage Patterns

- Use `runCli(...)` when you want the same behavior as the `part` executable.
- Use `ArtefactDefinitionProvider` to discover definitions rather than
  hand-rolling markdown scans.
- Use `ArtefactProvider` when you need definition-aware artefact discovery or to
  inspect which definitions apply to an artefact.
- Use `createRuleValidationContext(...)` to call a rule from its tests.
- Keep stable public usage on the package-root exports and the plugin subpath
  exports; treat other `src/*` files as internal implementation.

## Edit Safety Checklist

- If changing definition parsing, then re-check heading validation and location
  parsing.
- If changing discovery, then re-check `.gitignore` behavior for both definition
  discovery and artefact locations.
- If changing plugin loading or binding, then re-check the fatal error cases in
  `plugin-provider.test.ts`.
- If changing rule execution, then re-check `OK`, failure and `Skip` results.
- If changing CLI output, then re-check `inventory`, `definition`, `definitions`
  and `check` contract tests.

## Validation

- `npm -w asljs-part run test`
- `npm -w asljs-part run flint`

Update this file when AI-facing exported-surface expectations, CLI contracts, or
validation commands change. Update `README.md` separately only when user-facing
behavior changes.

## CLI Contract

### Global options

- `--definitions <path>` or `PART_DEFINITIONS` - definitions directory.
- `--project <path>` or `PART_PROJECT` - project root.
- `--plugin <module>` (repeatable) or `PART_PLUGINS` (path-delimiter
  separated) - plugin modules. Paths resolve from the working directory; package
  specifiers resolve from the project root, then from `asljs-part`. Any
  `--plugin` replaces `PART_PLUGINS`.

### version

- Prints the package version from `package.json`.

### config

- Prints the definitions path, project path, plugins and the `PART_*`
  environment variables.

### inventory

- Lists artefacts of the discovered definitions with the printed location
  (relative path for `file:`, full URI otherwise).
- Shows all definitions that apply to the same artefact.

### definitions

- Lists discovered definitions with their source and document path.

### definition

- Prints the selected definition in detail, including its source and whether
  each rule is implemented.

### check

- Runs rules for artefacts matched by definitions and an optional pattern.
- A pattern with a scheme matches full locations; any other pattern is a path
  relative to the working directory and matches `file:` artefacts.
- Aggregates rules from all definitions that apply to the same artefact.
- Sets a non-zero exit code when any rule fails; `Skip` does not.
- Shows only failing rows by default; `--with-positives` includes `OK` rows,
  `--with-skipped` includes `Skip` rows.
- Rows are sorted by location, then by rule.
