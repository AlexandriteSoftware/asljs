# AGENTS

## Purpose

Use this file as AI-facing guidance for `asljs-part`.

This package provides markdown-defined project artefact tracing, a plugin
runtime that implements definitions in code, plus a CLI for inventory,
definition inspection, and rule checks.

## AI Quick Reference

Public behavior at a glance:

- definitions come from the sources given with `--definitions` (repeatable) or
  `PART_DEFINITIONS`; without either there are no definitions
- a source is an md-only folder (no `package.json`), a plugin library folder
  (has `package.json`; its entry is imported), a plugin file, or a package
  specifier such as `asljs-part`
- a source may be followed by `;<include>;<exclude>`: comma-separated,
  case-insensitive glob patterns of definition names; empty include keeps all;
  patterns matching nothing are ignored; a plugin's bindings of its filtered-out
  definitions are dropped with them
- in an md-only folder, a markdown file is a definition when its level 1 heading
  matches the file name; no other section is required, so such a folder should
  hold only definitions
- a plugin provides all of its definitions; `context.readDefinitions()` reads
  the `*.md` documents of its folder when it wants them
- `Location`, `Properties` and `Rules` are optional; definition `Location` paths
  are resolved relative to the definition file
- a definition with no `Location` and no plugin locator has no artefacts
- rules are `### <Id>` sections; ids are uppercase letters followed by digits
- a plugin module's default export is a factory returning `{ name, version?,
  definitions?, locate?, data?, rules? }`
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
  artefact; a rule no plugin implements is `Skip`, or is checked by an AI agent
  with `--ai`
- `check` caches results of `file:` artefacts in `.part/check-cache.json`; a
  rule reruns when the artefact's mtime is newer than the check, the rule text
  changed, or the implementing plugin's `version` changed; `--force-check`
  reruns everything
- cli command `check` shows failures only by default; `--with-positives` adds
  `OK` rows, `--with-skipped` adds `Skip` rows
- the package root's default export is the `asljs-part` plugin with every
  definition documented in `artefacts/` and the npm and git implementations
  (`--definitions asljs-part`, or `--definitions .` inside the package); the
  individual built-in plugins are not exported

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
- If changing source loading or binding, then re-check the fatal error cases in
  `definition-source-provider.test.ts`.
- If changing the cache or what invalidates it, then re-check the cache test in
  `check.test.ts`; bump the `version` of `aftefacts/src/plugin.ts` when its
  rules change.
- Tests never run a real AI agent; they set `PART_AI_COMMAND` to a stub.
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

- `--definitions <source>[;<include>[;<exclude>]]` (repeatable) or
  `PART_DEFINITIONS` (entries separated by newlines or `|`) - definition sources
  and their name filters. A value that is absolute, starts with `.`, or exists
  is a path resolved from the working directory; anything else is a package
  specifier resolved from the project root, then from `asljs-part`. Any
  `--definitions` replaces `PART_DEFINITIONS`.
- `--project <path>` or `PART_PROJECT` - project root.

### version

- Prints the package version from `package.json`.

### config

- Prints the definition sources, project path and the `PART_*` environment
  variables.

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
- Replays cached results; `--force-check` runs every rule.
- `--ai` (Claude) or `--ai=copilot` checks rules without an implementation;
  `PART_AI_COMMAND` replaces the agent command. AI results end with ` (AI)`.
- Rows are sorted by location, then by rule.
