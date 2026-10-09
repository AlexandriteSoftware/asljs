# R6 Status section

Every requirement and test may end with a `## Status` section the commands own:
`Result` (`PASS`, `FAIL` or `NOT RUN`), a test's `Execution` link, and a
requirement's `Coverage` (`COMPLETE` or `INCOMPLETE`). Updating them keeps any
other content of the section, and `rq check` reports items it does not know.

## Implementation

- [T4 Status section][T4]

[T4]: <../tests/T4 Status section.md>

## Coverage

R6 is fully covered by its one test, T4 Status section. The gap the earlier `##
Coverage` analysis reported has since been closed in `src/check.test.ts`, so
that analysis and the `Coverage: INCOMPLETE` status are out of date.

- **"Every requirement and test may end with a `## Status` section the commands
  own":** the step "writeStatus adds, replaces and removes the section" adds,
  rewrites and removes the section on a requirement. It also keeps a following
  `## Notes` section intact. The step "readStatus reads the result, the coverage
  and the execution link" reads the section on a test (`T1`) and on a
  requirement (`R1`) that has no section.
- **`Result` (`PASS`, `FAIL` or `NOT RUN`):** the readStatus step reads `FAIL`
  with a note. The writeStatus steps write `PASS` and `NOT RUN`. The execCheck
  step shows `rq check` rejecting any other value (`Result: DONE`).
- **A test's `Execution` link:** the readStatus step reads an `Execution` link
  on a test. The step "writeStatus keeps the content of the section it does not
  own" replaces one and rewrites its link definition. The test `writeStatus
  labels the execution link…` is not linked from T4, and it isn't needed.
- **A requirement's `Coverage` (`COMPLETE` or `INCOMPLETE`):** the readStatus
  step reads `INCOMPLETE`, and the add step writes `COMPLETE`. The step
  "execCheck reports a malformed Status and a test with a coverage" shows that
  `Coverage` belongs only to a requirement: a test with a `Coverage` status is
  reported as an error.
- **"Updating them keeps any other content of the section":** the step
  "writeStatus keeps the content of the section it does not own" keeps three
  things through an update: an unknown item (`Owner: alice`), a paragraph and an
  unrelated link definition. It also leaves a section holding only `Owner: bob`
  unchanged.
- **"`rq check` reports items it does not know":** the execCheck step now puts
  `- Owner: alice` into `R1 A.md`'s Status section. It asserts that `rq check`
  prints `the Status item "Owner: alice" is not "Result: PASS|FAIL|NOT RUN[ -
  <note>]", …`. Together with the "keeps the content" step, this shows such an
  item is both kept and reported.

The next `rq coverage` run should replace the out-of-date `## Coverage` section
and `Coverage: INCOMPLETE` status in R6. No other change is needed.

## Status

- Result: PASS
- Coverage: COMPLETE
