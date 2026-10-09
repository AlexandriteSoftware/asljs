# R15 Execution files

Each run is written to `.rq/E<n> <slug>.md` in the working folder: the date, the
command line, the git commit, branch and changed files, and one section per test
with its result and output. Runs at the same time get different numbers, and a
test's latest result is the latest by date, then by number.

## Implementation

- [T11 Execution files][T11]

[T11]: <../tests/T11 Execution files.md>

## Coverage

I've read the requirement, its test and the test code; all of R15 is covered.

R15 Execution files is fully covered by its only linked test, T11 Execution
files. I checked each step against the test code in `src/results.test.ts` and
`src/test.test.ts`.

- **"Each run is written to `.rq/E<n> <slug>.md` in the working folder"**:
  covered by these T11 steps:
  - _execTest of a folder runs every test, records them, and reports the latest
    status_ checks that `rq test reqs` writes `.rq/E2 reqs.md` in the working
    folder and prints `Results  .rq/E2 reqs.md`.
  - _writeExecution numbers the files…_ checks the `E<n> <slug>` naming,
    including making a slug from `First: a/b` (`.rq/E1 First a b.md`) and
    continuing after the highest existing number (`E10` after `E9`).
- **"the date, the command line, the git commit, branch and changed files"**:
  covered by these steps:
  - _formatExecution writes the run, the working directory and each test_ checks
    the `Date`, `Command`, `Commit`, `Branch` and `Changed files` lines,
    including the `none` cases.
  - _execTest of a folder…_ checks the same lines with real values and a list of
    changed files.
  - _readWorkingTree reads the commit, the branch and the changed files_ checks
    that the commit, branch and changed files are really read from a git
    repository.
- **"one section per test with its result and output"**: covered by
  _formatExecution…_ and _execTest of a folder…_. Both check a `## T<n> <name>`
  section per test with its `File`, its `Result` and a fenced output block, and
  that a test with no output gets no block. _parseExecution reads the result of
  each test section_ checks that those sections can be read back.
- **"Runs at the same time get different numbers"**: covered by _loadResults
  prefers a later date, and writeExecution never reuses a number_. It runs three
  `writeExecution` calls at once and checks they get three different numbers
  (E3, E4, E5).
- **"a test's latest result is the latest by date, then by number"**: covered by
  these steps:
  - _loadResults prefers a later date…_ checks that a higher-numbered file with
    an earlier date does not replace the later-dated result.
  - _writeExecution numbers the files and loadResults keeps the latest result of
    each test_ checks that the higher-numbered file wins when date does not
    decide (an E9 without a date over a dated E1). It also checks that files not
    named `E<n>` are ignored.

One small gap, not enough to fail the check: no test has two files with exactly
the same date and different results. The "then by number" rule is only tested
through the file without a date. You could add a case to _loadResults prefers a
later date…_: two `E<n>` files with the same `Date`, where the higher number
should win.

## Status

- Result: PASS
- Coverage: COMPLETE
