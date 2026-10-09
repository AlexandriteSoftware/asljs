# R14 Test targets

`rq test` takes several targets: paths, folders, `.md` names and ids such as
`R10` or `T12`. A requirement runs the tests it links to, with `--recurse` every
test below it; a folder runs all its tests; each test runs once.

## Implementation

- [T10 Test targets][T10]

[T10]: <../tests/T10 Test targets.md>

## Coverage

R14 is fully covered by T10. The gap noted in R14's existing `## Coverage`
section (no target given as a file path) has since been closed: T10 now has the
step "execTest takes a requirement or test file by its path".

- **Several targets in one call.** Step "execTest takes several paths, names and
  ids, and runs each test once" (`src/test.test.ts:156`) passes `['T1
  Passes.md', 'T1', 'R2']` and checks the combined output. Step "execTest takes
  a requirement or test file by its path" (`src/test.test.ts:513`) passes two
  targets, `['reqs/tests/T1 Passes.md', 'reqs/R2 Part.md']`.
- **Paths as targets.** Step "execTest takes a requirement or test file by its
  path" passes a test and a requirement as paths relative to the working folder.
  It checks that T1 runs, and that R2 resolves and runs its test T2.
- **Folders as targets.** Step "selectTargets selects a target, its direct
  tests, or everything below it" (`src/targets.test.ts:13`) passes the folder
  `reqs`. It gets back every requirement and test under it, including those in
  the nested `tests/` folder.
- **`.md` names as targets.** The "several paths, names and ids" step passes
  `'T1 Passes.md'`, a bare name that is found by recursive search.
- **Ids such as `R10` or `T12`.** The same step passes `'T1'` and `'R2'`. Its
  later parts also check that `R2` resolves from inside `reqs`, and that an id
  outside the working folder is rejected.
- **A requirement runs the tests it links to.** Step "execTest of a requirement
  runs its own tests, and with recurse everything below it"
  (`src/test.test.ts:97`): target `R1` without `--recurse` runs only T1, and R2
  is shown as `(recorded)`. The `selectTargets` step backs this up with
  `['R1','T1']` and `directTests`.
- **With `--recurse`, every test below the requirement runs.** The same step
  runs `R1` with `recurse: true`, and both T1 and T2 run. The `selectTargets`
  step checks `R2` with `recurse` too.
- **A folder runs all its tests.** The `selectTargets` step with `reqs` returns
  all four documents under it, which shows that a folder target selects every
  test in it.
- **Each test runs once.** The "several paths, names and ids" step points `'T1
  Passes.md'` and `'T1'` at the same test, and the exact output lists
  `reqs/tests/T1 Passes.md` once.

The `## Coverage` section of R14 is out of date: it still says paths are not
covered. The next `rq coverage` run will rewrite it.

## Status

- Result: PASS
- Coverage: COMPLETE
