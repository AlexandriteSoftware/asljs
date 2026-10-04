# AGENTS

## Purpose

Use this file as AI-facing guidance for `asljs-locator`.

This package locates files from glob patterns with exclusions and named
filters, and answers whether a single path belongs to a location.

## Package Scope

Exports from `src/index.ts`:

- `LocationResolver`
- `GitIgnore`
- `Location`, `LocationFilter`, `toPatterns`
- `toPosixPath`

## AI Quick Reference

Stable public behaviours:

- a pattern beginning with `/` resolves against the resolver's root; any other
  pattern resolves against the base path passed to the call
- `pattern` and `patterns` are both accepted and read as one list, because
  `part` declares one and `cog` declares several
- `resolve` takes one location or several, and returns absolute paths,
  deduplicated and sorted with `localeCompare`
- `check` answers for one path without walking the filesystem
- patterns must be all files or all directories, a directory pattern ending
  with `/`; mixing them throws
- `GitIgnore` is the only filter name implemented, and an unknown name throws
- `GitIgnore` reads the `.gitignore` of the path's own directory and every
  directory above it, so a nested file applies to its own subtree

Use this package when:

- a tool needs to find files from declared patterns rather than hard-coded
  walks
- a tool needs to honour `.gitignore` without reimplementing it
- a tool needs to test one path against the same declaration

Do not assume:

- the resolver returns relative paths; they are absolute
- `.gitignore` filtering is always on; it is opt-in through `filters`
- a filter other than `GitIgnore` exists
- `GitIgnore` consults git itself; it parses the files, so git's global and
  info/exclude rules are not applied

## Constraints To Preserve

- The anchored and relative pattern split is the public contract that `part`
  definitions and `cog` configurations are written against.
- `resolve` must stay sorted and deduplicated; callers compare its output.
- Accepting both `pattern` and `patterns` must stay, or existing definitions
  stop resolving.

## Change Safety Checklist

- If changing pattern handling, then re-check both anchored and relative cases
  against a base path below the root.
- If changing filters, then re-check that an unknown name still throws.
- If changing `GitIgnore`, then re-check nested `.gitignore` files, not only a
  root one.

## Documentation Layout

- `README.md` is the landing page: what a location is, how to resolve one, and
  how to check a single path.
- Every `js` and `ts` fenced block in `README.md` is illustrative only; this
  package has no example harness yet.

## Validation

- `npm -w asljs-locator run test`
- `npm -w asljs-locator run typecheck`
- `npm -w asljs-locator run flint`

## Related Packages

- If the task is about logging rather than locating, move to `asljs-logging`.
- `asljs-part`, `asljs-cog` and `asljs-toolkit` are the consumers; a change
  here has to keep all three working.

Update this file when AI-facing constraints, the exported surface, or
validation commands change. Update `README.md` separately only when
user-facing behaviour changes.
