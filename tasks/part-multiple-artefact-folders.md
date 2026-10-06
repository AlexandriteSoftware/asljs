# part-multiple-artefact-folders

`part` reads artefact definitions from one folder, so a project cannot take the
shared definitions from the `asljs-part` package and keep only its own next to
its code; it copies them, and the copies drift.

Package: `part`.

## Context

The definitions folder is a single path. `apps/part/src/cli.ts` declares the
option once, and the `preAction` hook resolves it, falling back to
`PART_DEFINITIONS` and then to the working directory:

```ts
.option(
  '--definitions <path>',
  'Path to artefact definitions directory. Defaults to the current working directory.')
```

```ts
if (optDefinitions !== '') {
  environment.definitions =
    path.normalize(
      path.resolve(
        optDefinitions));
} else {
  // PART_DEFINITIONS, then environment.cwd
}
```

`Environment.definitions` (`apps/part/src/environment.ts`) is a `string`, and
`providersFactory` (`apps/part/src/providers/providers.ts`) passes it to the
definition provider and to the data provider. There is no configuration file;
the CLI option and the environment variable are the only inputs, and `part
config` prints them. [RQ111][RQ1] and [RQ112][RQ2] specify this.

Discovery scans the folder recursively and drops whatever git ignores
(`apps/part/src/providers/artefact-definition-provider.ts`):

```ts
const markdownPaths =
  await glob(
    '**/*.md',
    { absolute: true,
      cwd:
        this.definitionsPath,
      dot: true,
      nodir: true });

const visibleMarkdownPaths =
  this.gitIgnore.filter(markdownPaths);
```

A definition's `Location` patterns are resolved against the folder of the
definition file, unless they start with `/`, which anchors them at the project
root ([RQ205][RQ5], `libs/locator/src/location.ts`). `ArtefactProvider` passes
`path.dirname(definition.path)` as the base path.

Rule files are looked up in `parts/` next to the definition file, but the
definition is found by name (`apps/part/src/rule-runner.ts`):

```ts
const definition =
  await this.providers
    .artefactDefinitionProvider
    .findDefinition(
      rule.definition);
```

The data provider does not look next to the definition at all; it looks in
`parts/` under the root of the definitions folder
(`apps/part/src/providers/artefact-data-provider.ts`):

```ts
const dataProviderFilePath =
  path.join(
    this.definitionsPath,
    'parts',
    definition + '.js');
```

How it is invoked:

- In this repository the root `AGENTS.md` documents `part check --definitions
  aftefacts`. Without `--definitions`, a run from the root scans the whole
  repository, and `part definitions` then lists `Artefact Definition` and `Rule
  File` twice: once from `aftefacts/` and once from `apps/part/artefacts/`. The
  two pairs are identical copies.
- `asljs-part` ships `Artefact Definition.md`, `Rule File.md` and their `parts/`
  files from `apps/part/artefacts` (the `files` list in
  `apps/part/package.json`). It does not ship `Article`, which lives only in
  `aftefacts/`.
- EdGames keeps copies of `Artefact Definition`, `Rule File` and `Article` in
  `docs/artefacts`, and does not depend on `asljs-part` yet. Its `PLAN.md`
  (Phase 2) plans a root script `part check --definitions
  node_modules/asljs-part/artefacts --definitions docs/artefacts` and lists this
  task as the blocker. No CI workflow in either repository runs `part`.

The EdGames copies have drifted, compared with line endings ignored:

- `Artefact Definition.md` lacks the `## Properties` bullet and the whole `##
  Artefact Properties` section.
- `Article.md` lacks `RL3` (dprint formatting) and the "Formatting with dprint"
  section, and `parts/` has no `Article_RL3.js`.
- `Rule File.md` and the rule files match, apart from the type annotations in
  `parts/Artefact Definition.js` and `parts/Rule File_RL1.js`, which still
  import from `../../src/...` instead of `asljs-part`.

## Problem

Passing a second folder is not enough on its own. Four things stand in the way:

1. **One folder only.** Commander keeps the last `--definitions` value, so the
   planned EdGames script would read `docs/artefacts` alone.
2. **An ignored folder yields nothing.** `--definitions` pointing into
   `node_modules` finds no definition, because `node_modules` is in `.gitignore`
   and discovery filters the scan through it. Run from this repository's root,
   `part definitions --definitions node_modules/asljs-part/artefacts` prints an
   empty table, while `--definitions apps/part/artefacts` (the same files
   through the workspace link) lists both.
3. **Shared definitions locate their artefacts next to themselves.** The shipped
   `Artefact Definition` uses `Pattern: **/*.md` and `Rule File` uses `Pattern:
   parts/**/*_*.js`. Both are relative, so taken from the package they match the
   package's own files, not the consumer's `docs/artefacts`. The same holds
   inside this repository: with `apps/part/artefacts` and `aftefacts` as two
   folders, the shipped `Artefact Definition` would not check `aftefacts/*.md`.
4. **Names are the identity.** Two definitions with the same name are both
   loaded today. `check` applies every rule of either copy to any artefact
   matched by either, so `part check aftefacts/Article.md --with-positives`
   reports `Artefact Definition_RL1` twice; and the rule file of both copies is
   resolved through `findDefinition`, which returns the first by name. The data
   provider ignores where the definition is altogether.

## Proposed behaviour

### Several folders

- `--definitions` may be repeated. `PART_DEFINITIONS` holds a list separated by
  `path.delimiter` (`;` on Windows, `:` elsewhere). The option still wins over
  the variable, and the working directory is still the default.
- `Environment.definitions` becomes `string[]`; `part config` prints one line
  per folder.
- A folder named explicitly is scanned even when git ignores it. `.gitignore`
  still filters what lies inside it.

### Rule and data files follow the definition

- A rule file is resolved from `parts/` next to the definition that declares the
  rule, using the definition object the rule came from, not a lookup by name.
- The data provider looks in `parts/` next to the definition file as well. This
  also fixes definitions in subfolders of today's single folder, whose data
  provider is looked for in the wrong place.

### Name clashes

Options:

- **Error.** Two definitions with the same name stop the run, naming both files.
  - Pros: no silent behaviour; the duplicated runs seen today disappear.
  - Cons: a project cannot adjust a shared definition except by dropping the
    shared folder; a root run in this repository fails until the `aftefacts`
    copies are removed or `--definitions` is always passed.
- **Later folder wins.** A definition in a later folder replaces the one with
  the same name in an earlier folder, together with its `parts/`.
  - Pros: a project can override a shared definition without a fork of the whole
    folder.
  - Cons: the override is a copy, and it drifts, which is the problem this task
    sets out to remove; the replacement is silent unless reported.
- **Merge.** Rules from all same-named definitions are combined.
  - Pros: a project can add rules to a shared definition.
  - Cons: rule ids collide, `Location` and `Properties` have no obvious merge,
    and a rule file could come from either `parts/`.

Recommendation: report a clash as an error. It is the smallest change that makes
a name identify one definition, and it turns today's silent double run into a
visible mistake. Overriding can be added later as an explicit, reported feature
if a project needs it.

### Locating artefacts for a shared definition

A shared definition has to name "the definitions folders of this run", not its
own folder.

Options:

- **A definitions anchor in `Location`.** A pattern with a reserved prefix is
  resolved against every definitions folder of the run, as `/` is resolved
  against the project root. `Artefact Definition` and `Rule File` switch to it.
  - Pros: explicit; relative and `/` patterns keep their meaning; one definition
    serves any number of folders.
  - Cons: a change to `asljs-locator`, whose resolver takes one base path per
    call; a new piece of `Location` syntax to document in [RQ205][RQ5] and in
    `Artefact Definition.md`.
- **Resolve relative patterns against every folder.** Relative patterns of any
  definition are tried against each definitions folder.
  - Pros: no new syntax.
  - Cons: changes the meaning of every relative pattern; `ASLJS Package`
    (`../{libs,apps}/*/`) would also be resolved from `apps/part/`, which is
    wrong in general even where it happens to match nothing.
- **Anchor shared definitions at the project root.** Ship them with `/` patterns
  such as `/**/*.md`.
  - Pros: no code change.
  - Cons: `Artefact Definition` would match every markdown file in the project;
    the package cannot know where a consumer keeps its definitions.

Recommendation: a definitions anchor. The other two either change existing
meaning or cannot express the case.

## Points to settle

- The anchor syntax. It must not collide with a glob or with the `/` anchor.
- Where `init` writes when several folders are given. Requiring exactly one
  folder for `init` is the simplest answer.
- Whether `update` skips folders it should not write to, such as one under
  `node_modules`, or writes only to folders outside ignored paths.
- How [part-presets][PRE] name a folder shipped in the package without the
  consumer spelling out a `node_modules` path, which also differs between an npm
  install and a `file:` link.

## Where

- `apps/part/src/cli.ts` - the `--definitions` option and the `preAction`
  resolution.
- `apps/part/src/environment.ts` - `definitions: string`.
- `apps/part/src/commands/config.ts`, `init.ts`, `update.ts` - users of the
  single folder.
- `apps/part/src/providers/providers.ts` - passes the folder to the providers.
- `apps/part/src/providers/artefact-definition-provider.ts` - scan and
  `.gitignore` filter; `getDefinition` error message.
- `apps/part/src/providers/artefact-data-provider.ts` - data provider path.
- `apps/part/src/rule-runner.ts` and
  `apps/part/src/providers/artefact-definition-rule-provider.ts` - rule file
  lookup by name.
- `apps/part/src/commands/check.ts` - rules matched to artefacts by definition
  name.
- `libs/locator/src/location.ts` - pattern anchoring, if the anchor is added.
- `apps/part/development/RQ111 CLI Definitions parameter.md`, `RQ112 CLI
  Definitions environment variable.md`, `RQ205 Definition Location.md` -
  requirements to update.
- `apps/part/artefacts/Artefact Definition.md`, `Rule File.md` - shipped
  definitions whose `Location` changes.
- `aftefacts/Artefact Definition.md`, `aftefacts/Rule File.md` - this
  repository's copies, removable once the shipped ones can be used.

[PRE]: part-presets.md
[RQ1]: <../apps/part/development/RQ111 CLI Definitions parameter.md>
[RQ2]: <../apps/part/development/RQ112 CLI Definitions environment variable.md>
[RQ5]: <../apps/part/development/RQ205 Definition Location.md>
