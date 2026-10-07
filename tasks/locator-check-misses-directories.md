# locator-check-misses-directories

`LocationResolver.check` returns `false` for a directory that `resolve` returns
for the same location, so the two methods disagree on folder patterns.

Package: `locator`.

## Context

A folder pattern ends with `/`, e.g. `../{libs,apps}/*/` in `aftefacts/ASLJS
Package.md`. `resolve` globs it with `nodir: false`, and `glob` returns
directories without a trailing separator, e.g. `libs/observable`. `check`
matches the target's relative path against the pattern as written
(`libs/locator/src/location.ts`, `checkOne`):

```ts
return minimatch(
  relativePath,
  anchored
    ? pattern.slice(1)
    : pattern,
  { dot: true });
```

`..\libs\observable` does not match `../{libs,apps}/*/`, which only matches a
path with a trailing separator, so `check` rejects every directory `resolve`
found. `libs/locator/src/location.test.ts` tests `check` with file patterns
only.

`part` used `check` to work out which definitions an artefact matches, so its
`check` command ran no rules for directory artefacts. `part` 0.3.0 builds its
artefact index from `resolve` alone and no longer calls `check`; no other
package calls it. The bug is therefore latent, but `check` is a public method of
`asljs-locator`.

## Options

- **Fix `check`.** For a folder pattern, stat the target and match a directory
  with a trailing `/` appended, so a directory pattern matches what `resolve`
  returns. `Exclude` folder patterns need the same treatment.
  - Pro: `check` and `resolve` agree again.
  - Con: `check` touches the filesystem, which it does not do today.
- **Remove `check`.** Nothing in the repository uses it.
  - Pro: no API that disagrees with `resolve`.
  - Con: a breaking change for any outside user.

Recommendation: fix `check`, with tests for directory patterns and directory
excludes that compare its answer with `resolve` on the same tree.

## Where

- `libs/locator/src/location.ts` - `checkOne` and `expand`.
- `libs/locator/src/location.test.ts` - tests for `check`.
