# Artefact Definition Change Plan

Status: approved and implemented. The decisions now live in the requirements
under `development` and in the package documentation.

Base: the uncommitted [Artefact Definition][AD] in the working tree, together
with the deletion of `Rule File.md` and the `artefacts/parts/` directory.

[AD]: <../artefacts/Artefact Definition.md>

## Observed Gaps Between the New Definition and the Code

Each gap is a question for the interview. Answers are recorded under Decisions.

- G1. `## Location` is optional in the new definition. The parser in
  [artefact-definition-provider.ts][ADP] rejects a document without it, and that
  is the only check, besides the H1, that tells a definition apart from any
  other markdown file under the definitions path.
- G2. "When not specified, the definition provider will determine the
  locations." No such provider mechanism exists; locations come only from the
  markdown.
- G3. Rules: the new text says code-enforced rules get their function from the
  "artefact definition runtime". The code resolves rules from the sibling
  `parts/<Definition>_<RuleId>.<ext>` file
  (`artefact-definition-rule-provider.ts`, [rule-runner.ts][RR]). `Rule File.md`
  that documented this is deleted.
- G4. Rules without an implementation are documentation of a constraint (manual
  or AI-checked). The runner currently reports them as `Fail - Missing rule
  file.`
- G5. Properties are "returned by the artefact's data provider". The code loads
  `parts/<Definition>.js` `getData` from the definitions path
  ([artefact-data-provider.ts][ADA]).
- G6. Artefact identity is (definition, location), and location may be a file
  path, a URL or a database key. The [Artefact][AM] model is path-only.
- G7. Definitions may come from sources other than markdown, e.g. plugins. Only
  markdown discovery exists.
- G8. The definition is self-describing, but it no longer has `## Location` or
  `## Rules`, so under current parsing it is not a definition at all.
- G9. Rules format: the bullet list says "a list of rules ... first token in the
  rule description should be the rule id", while the code and every existing
  definition use `### <RuleId>` sections. Id format `<letters><number>` vs code
  `[A-Z]+\d+` (uppercase only) vs RQ202 `RL<number>`.
- G10. Property type suffix `?` (nullable) is parsed by the code but not in the
  definition.
- G11. `init` copies `Artefact Definition.md` and `Rule File.md` and creates
  `parts/`; `package.json` `files` publishes `artefacts/parts/*` and `Rule
  File.md`; `update` generates `parts/*_<RuleId>.js` via an AI runner and checks
  the first-comment sync. All depend on deleted files or on G3.
- G12. The repository's own [aftefacts][RA] directory keeps its copy of
  `Artefact Definition.md`, `Rule File.md` and `parts/`.
- G13. Requirements and docs referring to the old model: RQ124, RQ126, RQ201,
  RQ202, RQ204, RQ205, [AGENTS.md][AG], [README.md][RM].
- G14. Wording issues in the new definition, e.g. "an project", "documents is",
  and `## Location` "specifies where the definitions are located" (reads as
  artefacts).

[ADP]: ../src/providers/artefact-definition-provider.ts
[RR]: ../src/rule-runner.ts
[ADA]: ../src/providers/artefact-data-provider.ts
[AM]: ../src/model/artefact.ts
[RA]: ../../../aftefacts
[AG]: ../AGENTS.md
[RM]: ../README.md

## Interview Notes

### Round 1

- Recognition (G1, G8): a markdown file under the definitions path is a
  definition when its H1 equals its file name. No other section is required.
  Consequence: the definitions folder must hold only definitions; any other
  markdown with a matching H1 there becomes a definition.
- Runtime (G2, G3, G5, G7): runtimes are plugin packages. Plugins contribute
  definitions, locations, data and rule functions programmatically.
- Unimplemented rules (G4): a separate status, not a failure, exit code
  unaffected, hidden by default like `OK` rows and shown with a flag.
- Scope (G6, G7): full. Besides the generalised model and extension points, ship
  at least one working non-filesystem location and a plugin-provided definition
  source.

### Round 2

- Registration: plugins are listed with a repeatable `--plugin <module>` CLI
  option and a `PART_PLUGINS` environment variable, matching `--definitions` and
  `--project`. No config file.
- `parts/` convention: removed. This repository's [aftefacts][RA] `parts/` is
  migrated into a plugin. Breaking change for other users.
- Rule binding: a plugin implements a rule by (definition name, rule id). The
  rule text stays owned by its definition; plugins do not add rules to a
  markdown definition.
- Non-filesystem examples to ship: npm dependency (external package reference,
  plugin-provided definition) and git entities.

### Round 3

- Plugin module shape: the default export is a factory `(context) => Plugin`.
  The context carries logger, project path, definitions path and providers. The
  plugin is a plain object with optional members: `name`, `definitions`,
  `locate` (by definition name), `data` (by definition name), and `rules` (by
  definition name, then rule id).
- Location is a URI string with a scheme, e.g. `file:Todo Items/A.md`,
  `npm:apps/part/package.json#glob`, `git:tag/v1.2.0`. It is the identity
  component, the sort key and the output form. File locations print as plain
  relative paths.
- A definition with no markdown `## Location` and no plugin locator has zero
  artefacts, silently (meta or abstract definitions).
- The git example covers tags only.

### Round 4

- Executable rules are dropped. Rules are JS plugin functions only; a plugin can
  spawn a process itself.
- The `update` command is removed together with RQ125, the first-comment sync
  logic and the rule provider methods behind it (`isRuleInSync`,
  `formatRuleComment`, `extractFirstComment`, `commentMatchesRule`).
- The npm and git-tag plugins ship inside `asljs-part` as subpath exports and
  are opt-in, e.g. `--plugin asljs-part/plugins/npm`.
- When a markdown `## Location` and a plugin locator both exist for a
  definition, the plugin locator wins.

### Round 5

- Artefact object is `{ location, name, definitions }`. No `path`, `basePath` or
  `relativePath`; file-based rules get the file path through a context helper.
  Every existing file rule changes.
- Definition names are unique across markdown and plugin sources; a clash is a
  startup error.
- A rule with no implementation has status `Skip`, shown by `check` with
  `--with-skipped`.
- Strict: a plugin that fails to load or whose factory throws, and a locator,
  data function or rule implementation bound to an unknown definition or rule
  id, all stop the command with a non-zero exit code.

### Round 6

- Rules are `### <Id> [- title]` sections under `## Rules`; the id is uppercase
  letters followed by digits, as the parser does. The definition text is
  corrected.
- The `?` nullable property suffix is documented in the definition.
- The `init` command is removed with RQ124.
- This repository's plugin is `aftefacts/plugin.js`, importing rule modules from
  `aftefacts/rules/*.js` with their tests next to them. Repository commands pass
  `--plugin ./aftefacts/plugin.js`.

### Round 7

- `check [pattern]` and `inventory` filters glob the printed location: the plain
  relative path for files, the full URI for other schemes (e.g. `git:tag/v*`).
  Existing invocations keep working.
- The plan includes an editorial pass on the new definition text, each edit
  listed below for review.
- Delivery: one commit, version `0.2.0`, no npm release.
- Related tasks (`part-export-rule-test-helpers`, `part-presets`,
  `part-multiple-artefact-folders`) are left for later and not touched.

## Decisions

- D1. Definition recognition is H1 = file name only.
- D2. Plugin packages are the runtime mechanism.
- D3. Rules with no implementation get their own non-failing status.
- D4. Full scope: generalised model, plugin sources, and working non-filesystem
  examples.
- D5. Plugins are loaded from `--plugin` (repeatable) and `PART_PLUGINS`.
- D6. The `parts/` convention is removed; this repository migrates to a plugin.
- D7. Rule implementations bind by (definition name, rule id).
- D8. Shipped examples: npm dependency and git tags.
- D9. Plugin = default-exported factory returning a plain object.
- D10. Artefact location is a scheme-prefixed URI string.
- D11. No location source means zero artefacts, without a warning.
- D12. Executable rules are dropped.
- D13. The `update` command and rule-sync logic are removed.
- D14. npm and git-tag plugins are opt-in subpath exports of `asljs-part`.
- D15. A plugin locator overrides the markdown `## Location`.
- D16. Artefact is `{ location, name, definitions }`; file paths come from a
  context helper.
- D17. Definition name clash across sources is an error.
- D18. Unimplemented rule status is `Skip`, flag `--with-skipped`.
- D19. Plugin load failures and unknown bindings are fatal.
- D20. Rules are `### <Id>` sections; id is `[A-Z]+\d+`.
- D21. The nullable `?` suffix is documented.
- D22. The `init` command is removed.
- D23. Repository plugin: `aftefacts/plugin.js` plus `aftefacts/rules/`.
- D24. Filters glob the printed location.
- D25. Editorial pass on the definition text is included.
- D26. One commit, version `0.2.0`, no release.
- D27. Related tasks are not touched.

## Change Plan

Delivered as one commit on `main`; `asljs-part` goes from `0.1.42` to `0.2.0`.
Items marked _Assumption_ were not covered by the interview and need
confirmation.

### 1. Artefact Definition Text

File: [Artefact Definition][AD]. Content additions:

- `## Rules`: rules are `### <Id> [- <title>]` sections; the id is uppercase
  letters followed by digits (`[A-Z]+\d+`), unique within the definition. The
  section body is the rule text.
- `## Artefact Rules`: a rule implemented by a plugin bound to (definition name,
  rule id) is code-enforced; a rule with no implementation is reported by
  `check` as `Skip`.
- `## Artefact Properties`: a type ending with `?`, e.g. `Date?` or `String[]?`,
  is nullable. Properties are returned by the data function a plugin registers
  for the definition.
- `## Artefacts Location`: a definition without `## Location` and without a
  plugin locator has no artefacts. A plugin locator replaces `## Location`.
  Location identity is a URI string (`file:`, `npm:`, `git:`), printed as a
  plain relative path for `file:`.
- Plugins as the runtime: what a plugin can contribute (definitions, locators,
  data, rule implementations), and that names are unique across sources.

Editorial edits, meaning unchanged:

- "Artefact is an project construction element" → "An artefact is a project
  construction element".
- "Artefact definition documents is one source" → "Artefact definition documents
  are one source".
- "Artefact rules defines" → "Artefact rules define".
- "an JSON-serialisable object" → "a JSON-serialisable object".
- `## Location` bullet: "specifies where the definitions are located" →
  "specifies where the artefacts are located"; "the definition provider will
  determine the locations" → "a plugin may provide the locations".
- "Other than filesystem should be provided by artefact definition runtime" →
  "Other location types are provided by plugins".
- "Pattern and Exclude has" → "have"; "Absolute patterns starts" → "start".
- The location code structure shows `{ patterns: string[], ... }`; the locator
  accepts `pattern?: string` and `patterns?: string[]` ([location.ts][LOC]) and
  the parser fills `pattern`. Change the example to `{ pattern?: string,
  patterns?: string[], exclude?: string[], filters?: object[] }`.
- "`Artefact` - a path to the artefact, relative to location of the current
  artefact" → "the location of another artefact", since locations are no longer
  only paths. _Assumption:_ for `file:` artefacts the value stays a path
  relative to the current artefact.

### 2. Model

- [artefact.ts][AM]: `Artefact` becomes `{ location: string; name: string;
  definitions: string[] }`. `path`, `basePath` and `relativePath` are removed.
  For `file:` artefacts `name` stays the file name without extension; `location`
  is `file:` plus the project-relative POSIX path.
- [artefact-definition.ts][ADM]: `path` becomes optional (absent for plugin
  definitions); add `source: string` (`markdown` or the plugin name), used in
  error messages and the `definition` command.
- [artefact-definition-property.ts][ADPM]: unchanged apart from comments
  matching the documented types.
- New `src/location.ts`: `toFileLocation(projectPath, absolutePath)`,
  `fromFileLocation(projectPath, location)`, `displayLocation(location)` (strips
  `file:`), and `schemeOf(location)`.

### 3. Plugins

New `src/plugin.ts` with the public types:

```ts
interface PluginContext
{ logger: Logger;
  projectPath: string;
  definitionsPath: string;
  markdownDocuments: MarkdownDocumentProvider; }

interface Plugin
{ name: string;
  definitions?: () => Promise<ArtefactDefinition[]>;
  locate?: Record<string, (context: RuleValidationContext) => Promise<Artefact[]>>;
  data?: Record<string, ArtefactDataProvidingFunction>;
  rules?: Record<string, Record<string, RuleValidationFunction>>; }

type PluginFactory =
  (context: PluginContext) => Plugin | Promise<Plugin>;
```

New `src/providers/plugin-provider.ts`:

- Loads every specifier from `--plugin` (repeatable) or, when no `--plugin` is
  given, from `PART_PLUGINS` split by `path.delimiter`. _Assumption:_ the CLI
  option replaces the environment variable, as `--definitions` does.
- _Assumption:_ a specifier starting with `.` or `/`, or an absolute path, is
  resolved against the working directory; a bare specifier is resolved from the
  project root, then from `asljs-part` itself (so `asljs-part/plugins/npm` works
  when part is installed globally).
- Calls the default export with `PluginContext`. Import failure, a missing
  default export, a throwing factory, or a non-object result stops the command
  with a non-zero exit code (D19).
- After definitions are collected, validates bindings: every key in `locate`,
  `data` and `rules` must name a known definition, and every rule id must exist
  in that definition; otherwise a fatal error (D19).
- Exposes `findLocator(definition)`, `findData(definition)`,
  `findRule(definition, ruleId)`.

### 4. Providers and Runner

- [artefact-definition-provider.ts][ADP]: `tryParse` no longer requires `##
  Location`; recognition is the H1 only (D1). `locations` is `[]` when the
  section is missing. `#getDefinitions` merges markdown definitions with plugin
  `definitions()`; a duplicate name is a fatal error naming both sources (D17).
- [artefact-provider.ts][AP]: for each definition, use the plugin locator when
  one exists (D15), otherwise resolve `locations` with the `LocationResolver`
  into `file:` artefacts. Artefacts from all definitions are merged by
  `location`. Methods that take a path take a location.
- [artefact-data-provider.ts][ADA]: looks up the plugin data function instead of
  `parts/<Definition>.js`.
- `artefact-definition-rule-provider.ts`: deleted.
- [rule-runner.ts][RR]: a rule with a plugin implementation runs it; a rule
  without one returns `Skip`. `runExecutableRule` and rule file resolution are
  deleted. `RuleRunResult.result` becomes `'Ok' | 'Fail' | 'Skip'`.
- [rule-validation-function.ts][RVF]: `RuleValidationContext` drops `rules`,
  renames nothing else, and gains `files: { path(artefact): string }`, which
  returns the absolute path of a `file:` artefact and throws for other schemes
  (D16). `createRuleValidationContext` takes an optional plugin list so rule
  tests can build a context.
- [providers.ts][PRV]: wires the plugin provider; removes the rule provider.

### 5. CLI

- [cli.ts][CLI]: global `--plugin <module>` (repeatable); `config` prints the
  plugins and `PART_PLUGINS`.
- `check`: new `--with-skipped` shows `Skip` rows (D18); `Skip` never changes
  the exit code. `--with-positives` still means `OK` rows. Rows sorted by
  displayed location, then rule. The path pattern globs the displayed location
  (D24).
- `inventory`: `Fail` only from failing rules, never from `Skip`. JSON output
  carries `location` instead of path fields. Table and diagram show the
  displayed location. Same filter rule as `check`.
- `definition` / `definitions`: show the source of each definition and, per
  rule, whether it is implemented.
- `init` and `update` commands removed with their tests (D13, D22).

### 6. Built-in Plugins

Shipped in `asljs-part`, opt-in through subpath exports in `package.json`
`exports` (D14). _Assumption:_ the definitions, properties and rules below are
proposals for review.

`asljs-part/plugins/npm` - definition `Npm Dependency`:

- Locator: every `package.json` under the project root, respecting `.gitignore`,
  excluding `node_modules`; one artefact per entry in `dependencies`,
  `devDependencies`, `peerDependencies` and `optionalDependencies`.
- Location: `npm:<manifest relative path>#<kind>/<name>`, e.g.
  `npm:apps/part/package.json#dependencies/glob`. Name is the package name.
- Properties: `Package` (String), `Range` (String), `Kind` (String), `Manifest`
  (Artefact).
- Rules: `RL1` - a dependency on a workspace package uses a range satisfied by
  that package's current version.

`asljs-part/plugins/git` - definition `Git Tag`:

- Locator: `git tag --list` run in the project root; no artefacts and no error
  outside a git repository.
- Location: `git:tag/<name>`. Name is the tag name.
- Properties: `Commit` (String), `Annotated` (Boolean), `Date` (DateTime?).
- Rules: `RL1` - the tag points to a commit reachable from the current branch.

Both get unit tests against temporary repositories, and documentation in the
package [README.md][RM].

### 7. Repository Migration

- `aftefacts/plugin.js`: a factory returning `rules` and `data` for this
  repository's definitions, importing from `aftefacts/rules/` (D23).
- Move `aftefacts/parts/*_RL*.js` and their tests to `aftefacts/rules/`,
  rewritten from `export async function validate(artefact, context)` with
  `artefact.path` to plugin functions using `context.files.path(artefact)`. Move
  `ASLJS Package.js` `getData` into the plugin `data`. Move `parts/lib/` to
  `rules/lib/` and `parts/testing/` to `rules/testing/`.
- Delete `aftefacts/Rule File.md`, `parts/Rule File_RL1.js`, `parts/Artefact
  Definition.js`, `parts/Artefact Definition_RL1.js` and its test: they enforce
  the removed rule-file convention.
- Replace `aftefacts/Artefact Definition.md` with the new definition text.
- [AGENTS.md][RAG]: the artefact command becomes `part check --definitions
  aftefacts --plugin ./aftefacts/plugin.js`; remove the `Rule File` link.
- Note: no script currently runs the `aftefacts/parts` tests. _Assumption:_ that
  stays as is; the moved tests keep running with `node --test` by hand.

### 8. Package and Documentation

- `package.json`: version `0.2.0`; `exports` adds `./plugins/npm` and
  `./plugins/git`; `files` drops `artefacts/parts/*` and `Rule File.md` and
  keeps `artefacts/Artefact Definition.md`; `test` script drops
  `artefacts/**/*.test.js`.
- Requirements in [development][DEV]: delete RQ124 and RQ125; update RQ201
  (sources, recognition, name clash), RQ202 (optional Location, rule syntax,
  `source`), RQ204 (location URIs, plugin locators), RQ205 (optional, overridden
  by plugins), RQ123 (`Skip`, `--with-skipped`), RQ126 and RQ122 (source and
  implementation status), RQ121 (location output and filter). Add RQ134
  `--plugin` parameter, RQ135 `PART_PLUGINS`, RQ207 Plugin, RQ208 npm plugin,
  RQ209 git plugin. _Assumption:_ these numbers are free and follow the existing
  grouping.
- [AGENTS.md][AG] and [README.md][RM] of part: rewrite the quick reference, CLI
  contract and Quick Start for plugins; remove `init` and `update`.
- [DEVELOPMENT.md][DVM]: check for references to removed parts.
- Delete this plan or move its decisions into the requirements once the work is
  done. _Assumption:_ delete it.

### 9. Verification

- `npm -w asljs-part run test` and `npm -w asljs-part run flint`.
- `part check --definitions aftefacts --plugin ./aftefacts/plugin.js` from the
  repository root gives the same failures as before the change, minus the
  removed rule-file rules.
- `node --test aftefacts/rules` passes.
- Manual run of `inventory` with both built-in plugins on this repository.

[LOC]: ../../../libs/locator/src/location.ts
[ADM]: ../src/model/artefact-definition.ts
[ADPM]: ../src/model/artefact-definition-property.ts
[AP]: ../src/providers/artefact-provider.ts
[RVF]: ../src/rule-validation-function.ts
[PRV]: ../src/providers/providers.ts
[CLI]: ../src/cli.ts
[RAG]: ../../../AGENTS.md
[DEV]: ../development
[DVM]: ../DEVELOPMENT.md
