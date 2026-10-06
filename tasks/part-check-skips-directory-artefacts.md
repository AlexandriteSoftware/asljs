# part-check-skips-directory-artefacts

`part check` runs no rules for an artefact that is a directory, because the
directory paths `asljs-locator` finds are not matched by the same location when
`part` asks it about them again.

Package: `part`, and `locator` for the fix.

## Context

`ASLJS Package` is the only definition whose `Location` pattern names
directories, `../{libs,apps}/*/` with `Exclude: ../apps/toolkit/`, and it was
the first to carry a rule. [RQ205][RQ205] says folder patterns end with `/`, and
[RQ123][RQ123] describes the check report as one row per "path to the file or
folder", so directory artefacts are documented behaviour.

Observed from the repository root:

- `part --definitions aftefacts inventory` lists 17 `ASLJS Package` artefacts
  (18 package directories, minus `apps/toolkit`).
- `part --definitions aftefacts definition "ASLJS Package"` shows `RL1`.
- `part --definitions aftefacts check --with-positives --check-definitions
  "ASLJS Package"` prints an empty table. With `--loglevel trace` every package
  is listed, and every one is skipped:

  ```text
  Check command: checking artefact "C:\Projects\asljs\libs\observable"
    against rule "ASLJS Package_RL1" (applicable=false)
  ```

- `part check libs/observable` prints an empty table and logs no artefact at
  all.

So `ASLJS Package_RL1` is dormant: it passes its own tests but never runs
against a package. Every other definition matches files, which is why this went
unnoticed. `inventory` looks right only because it does not use
`artefact.definitions`: it records the definition it asked for
(`apps/part/src/commands/inventory.ts`, `collectInventoryEntries`).

### How a directory rule gets its input

A rule receives no content, only the `Artefact` object built by
`ArtefactProvider.buildArtefact` and the validation context:

- `path` - absolute, no trailing separator, e.g.
  `C:\Projects\asljs\libs\observable`.
- `relativePath` - `libs/observable`, relative to the project.
- `basePath` - the project path.
- `name` - `path.basename` without the extension, `observable`.
- `definitions` - the definition names the path matches.

A JavaScript rule is called as `validate(artefact, context)`, with `context`
carrying the providers (`apps/part/src/rule-runner.ts`, `runJavaScriptRule`). An
executable rule gets `artefact.path` as its argument and the artefact as JSON on
stdin. A rule reads whatever it needs from `artefact.path` itself.

`ASLJS Package_RL1` joins `artefact.path` with `dist` and walks it, treating a
missing `dist` as nothing to report, so it works unchanged once it runs. No
`dist` in the repository contains a `testing` directory today, so the expected
result is 17 `OK` rows with `--with-positives` and an empty table without it. An
empty table is therefore not proof of the fix; verify with `--with-positives`.

## Problem

There are two causes, one for each way `check` collects artefacts.

### Without a pattern: `check` and `resolve` disagree on directories

`ArtefactProvider.getArtefacts` finds the paths with `LocationResolver.resolve`,
then throws away which definition found them and recomputes the definitions per
path (`apps/part/src/providers/artefact-provider.ts`, lines 145-154):

```ts
for (const artefactPath of artefactPaths) {
  const artefactDefinitions =
    await this.getDefinitionsForArtefact(
      artefactPath);
```

`getDefinitionsForArtefact` calls `isArtefactOfDefinition`, which calls
`LocationResolver.check`. `resolve` globs with `nodir: false` for a directory
pattern, and `glob` returns directories without a trailing separator
(`C:\Projects\asljs\libs\observable`). `check` then matches the relative path
against the pattern as written (`libs/locator/src/location.ts`, lines 253-265):

```ts
const relativePath =
  path.relative(
    anchored
    ? this.rootPath
    : normalisedBasePath,
    normalisedTargetPath);

return minimatch(
  relativePath,
  anchored
    ? pattern.slice(1)
    : pattern,
  { dot: true });
```

`relativePath` is `..\libs\observable`; `minimatch` matches it against
`../{libs,apps}/*` but not against `../{libs,apps}/*/`, which only matches
`..\libs\observable\`. So `check` returns `false` for every directory `resolve`
returned, the artefact is built with `definitions: []`, and `execCheck` marks
every rule not applicable (`apps/part/src/commands/check.ts`, lines 147-152 and
178-190).

The comment on `LocationResolver.expand` already states the invariant that is
broken: `check` and `resolve` "have to agree".
`libs/locator/src/location.test.ts` tests `check` only with file patterns.

### With a pattern: the glob drops directories

`part check <pattern>` globs the pattern itself and asks only for files
(`apps/part/src/commands/check.ts`, lines 108-114):

```ts
const paths =
  await glob(
    options.pattern,
    { absolute: true,
      cwd: environment.cwd,
      dot: true,
      nodir: true });
```

`libs/observable` therefore expands to nothing. Fixing only this would not be
enough: `tryGetArtefact` goes through the same `getDefinitionsForArtefact` and
would return `null` for the directory.

## Options

### A. Match a directory pattern against the path with a trailing separator

In `LocationResolver.checkOne`, when a pattern ends with `/`, match
`relativePath + '/'` (or the pattern without its trailing `/`). Apply it to
`exclude` too, since it goes through the same `matchesPattern`: fixing only
`patterns` would make `check` accept `apps/toolkit`, which `resolve` excludes.

- Pro: fixes the cause where it is. `check` and `resolve` agree again, so
  `getArtefacts`, `tryGetArtefact`, `isArtefactOfDefinition` and
  `getDefinitionsForArtefact` all work for directories, including when a rule
  calls them through `context.artefacts`.
- Pro: small and local to one function, and testable in `locator` alone.
- Con: `check` does not touch the filesystem, so a file named like a directory
  (`libs/observable` as an extensionless file) would also match. `resolve` would
  never return it, so the only way to hit this is calling `check` directly with
  such a path.

### B. Return directories from `resolve` with a trailing separator

- Pro: `check` would match the paths `resolve` returns, with no change to
  `check`.
- Con: every consumer sees `libs/observable/`: `Artefact.path`, `relativePath`,
  inventory and check rows, and rules joining paths.
- Con: a caller that passes `libs/observable` to `check`, such as `part check
  libs/observable`, still gets `false`.

### C. Keep the finding definition in `ArtefactProvider.getArtefacts`

Record which definition's `resolve` found each path, as `inventory` does,
instead of recomputing with `getDefinitionsForArtefact`.

- Pro: confined to `part`, and saves one `check` per path and definition.
- Con: works around the disagreement rather than removing it. `tryGetArtefact`,
  and with it `part check <pattern>`, and `isArtefactOfDefinition` stay broken
  for directories.

### The pattern path, in every option

Drop `nodir: true` from the glob in `execCheck`. Directories that match no
definition are already dropped by `tryGetArtefact` returning `null`. The cost is
that a broad pattern such as `**` now also tests every directory against every
definition.

### Recommendation

A, together with dropping `nodir: true` in `execCheck`. It restores the
`check`/`resolve` invariant that `locator` already claims, and fixes both
`check` paths and the provider methods rules use. The same-name file case is not
worth a filesystem call in `check`, which is documented as not walking the tree;
state it in the `check` JSDoc instead.

### Tests

- `libs/locator/src/location.test.ts`: `check` with a directory pattern returns
  `true` for a directory path without a trailing separator, `false` when an
  `Exclude` directory pattern covers it, and agrees with `resolve` for the same
  location; both relative and `/`-anchored patterns.
- `apps/part/src/providers/artefact-provider.test.ts`: for a definition with a
  directory pattern, `getArtefacts` returns artefacts whose `definitions`
  include it, and `tryGetArtefact` returns the directory artefact.
- `apps/part/src/commands/check.test.ts`: a directory definition with a rule
  produces one row per directory, both without a pattern and with a pattern
  naming the directory, using `withPositives`.

## Points to settle

- Whether `check` should `stat` the target for a directory pattern after all, to
  reject a file of the same name.
- Whether `part check libs/observable/`, with the trailing slash, should work
  too. `glob` returns the directory for it, so it should, but it needs a test.

## Where

- `libs/locator/src/location.ts` - `checkOne`, which misses directory paths, and
  `expand`, which states that `check` and `resolve` must agree.
- `apps/part/src/providers/artefact-provider.ts` - `getArtefacts` and
  `tryGetArtefact`, which recompute definitions through `check`.
- `apps/part/src/commands/check.ts` - the `nodir: true` glob for a pattern, and
  the applicability test that skips the rows.
- `apps/part/src/commands/inventory.ts` - why `inventory` is unaffected.
- `apps/part/src/rule-runner.ts` - what a rule receives.
- `aftefacts/ASLJS Package.md` - the directory pattern and `RL1`.
- `aftefacts/parts/ASLJS Package_RL1.js` - the rule that does not run.

[RQ123]: <../apps/part/development/RQ123 CLI Check action.md>
[RQ205]: <../apps/part/development/RQ205 Definition Location.md>
