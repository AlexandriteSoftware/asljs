# R29 Test report

`rq test` prints one line per target and per test it ran, and with `--recurse`
or for a folder everything below them, with its status and why it fails; without
`--recurse` also each requirement a target links to, marked `(recorded)`, with
the status its document records; then the structure errors, the execution file,
the documents whose status changed and the execution files removed; it exits
with a non-zero code unless every reported node passes and the graph has no
structure errors.

## Implementation

- [T25 Test report][T25]

[T25]: <../tests/T25 Test report.md>

## Coverage

Requirement R29 is covered by its single linked test, T25 Test report. Its steps
run tests in `src/test.test.ts` and `src/cli.test.ts`, and I checked what each
one asserts:

- **One line per target and per test it ran, with its status and why it fails.**
  Covered by the T25 step "execTest of a folder runs every test, records them,
  and reports the latest status". It checks the exact output, such as
  `FAIL     reqs/R1 Root.md - 1 of 2 links failed` and `FAIL     reqs/tests/T2
  Fails.md - step 1 (Run) exited with code 3`.
- **With `--recurse`, or for a folder, everything below the targets.** The
  folder case is covered by the step above. The `--recurse` case is covered by
  "execTest of a requirement runs its own tests, and with recurse everything
  below it", whose second run on `R1` lists R1, R2, T1 and T2.
- **Without `--recurse`, each requirement a target links to, marked
  `(recorded)`, with the status its document records.** Covered by the same
  step's first run, which prints `NOT RUN  reqs/R2 Part.md (recorded)`. It is
  also covered by "execTest merges the tests it ran with the recorded statuses,
  without reading .rq". There, the document records FAIL while a `.rq` file says
  PASS, and the output is `FAIL     reqs/R2 Part.md (recorded)`, so the status
  comes from the document.
- **Then the structure errors.** Covered by "execTest reports structure errors
  and requirements with no links", which checks the `Error    …` lines (a
  dangling link and a cycle) after the node lines. It is also covered by
  "execTest exits with 1 on a structure error even when every node passes" (an
  unreachable test).
- **The execution file.** Covered by the `Results  .rq/E2 reqs.md` line in the
  folder step and the `--recurse` step, and by `Results  .rq/E4 Part.md` in "rq
  test returns the verification exit code".
- **The documents whose status changed.** Covered by the `Updated  …` lines in
  the same steps, which come after `Results`.
- **The execution files removed.** Covered by "execTest and execLog remove the
  oldest execution files beyond the retention". It checks that `Removed  .rq/E1
  Earlier.md` comes after the `Results` and `Updated` lines, and that nothing is
  reported as removed when nothing is.
- **Non-zero exit unless every reported node passes and the graph has no
  structure errors.**
  - **A failing node:** exit 1 in the folder step and the structure-error step.
  - **A recorded requirement that never ran:** exit 1 in the requirement step.
  - **A structure error while every node passes:** exit 1 in the step written
    for that case.
  - **Every node passes and there are no errors:** exit 0 in "rq test returns
    the verification exit code", which runs `rq test reqs/tests/T1 Passes.md`.

One small weakness, not a gap in function: no T25 step checks that the `Error`
lines come before the `Results` line in the same output. The structure-error
step runs no tests, so it prints no `Results` line. The "exits with 1 on a
structure error" step only matches the start of the output. To pin the order
down, extend that step's regex to require `Results  .rq/…` after the `Error`
line.

## Status

- Result: PASS
- Coverage: COMPLETE
