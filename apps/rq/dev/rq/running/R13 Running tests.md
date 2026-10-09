# R13 Running tests

`rq test` runs the tests of its targets, records the run, and reports and writes
the resulting statuses.

## Implementation

- [R14 Test targets][R14]
- [R15 Execution files][R15]
- [R16 Status recalculation][R16]
- [R17 Manual results][R17]
- [R29 Test report][R29]
- [R30 Retention][R30]

[R14]: <R14 Test targets.md>
[R15]: <R15 Execution files.md>
[R16]: <R16 Status recalculation.md>
[R17]: <R17 Manual results.md>
[R29]: <R29 Test report.md>
[R30]: <R30 Retention.md>

## Coverage

Every statement in R13 is covered by a sub-requirement it links to. I judged
this from the requirement texts only and didn't open the tests (T10–T26); their
passing status comes from the documents' own `## Status` sections.

R13 says: "`rq test` runs the tests of its targets, records the run, and reports
and writes the resulting statuses." That sentence has four parts, and each one
maps to a sub-requirement:

- **Runs the tests of its targets:** R14 Test targets covers this. It says what
  a target can be (paths, folders, `.md` names, ids), that a requirement runs
  its linked tests (all below it with `--recurse`), that a folder runs all its
  tests, and that each test runs once. T10 tests it.
- **Records the run:** R15 Execution files covers this. Each run is written to
  `.rq/E<n> <slug>.md` with the date, command line, git state, and a section per
  test with its result and output. It also covers how runs at the same time are
  numbered and how a test's latest result is picked. T11 tests it.
- **Reports the resulting statuses:** R29 Test report covers this. It specifies
  one line per target and per test that ran, with its status and why it fails,
  plus `(recorded)` sub-requirements, structure errors, the execution file, the
  documents whose status changed, the removed execution files and the exit code.
  T25 tests it.
- **Writes the resulting statuses:** R16 Status recalculation covers this. Each
  test that ran gets its result, and the targets and every requirement above
  them are recalculated and written to `## Status`; a failure propagates upward.
  T12 tests it.

Two links go beyond what R13's sentence says:

- **R17 Manual results** is about `rq log`, not `rq test`.
- **R30 Retention** is about how `.rq` is pruned after a run.

Neither leaves anything uncovered; they only add detail. To make R13 match what
it links to, a maintainer could add a sentence to it saying that `rq log`
records a result established another way, and that `.rq` is pruned after each
run.

## Status

- Result: PASS
- Coverage: COMPLETE
