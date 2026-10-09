# R9 Shell steps

A shell step runs every line of its code blocks as a shell command, skipping
empty lines and `#` comments and joining a line ending with `\` with the next,
and fails at the first non-zero exit code; the commands and their output are
recorded.

## Implementation

- [T6 Shell steps][T6]

[T6]: <../tests/T6 Shell steps.md>

## Coverage

R9 is fully covered by its only linked test, T6 Shell steps. I checked the three
test cases T6 points to in `src/run-test.test.ts` and `src/steps.test.ts`, not
just their titles:

- **"Runs every line of its code blocks as a shell command"**: covered by T6
  step 2, _runTest runs every line of every code block of a shell step and
  records the output_. Its fixture has two `sh` code blocks in one step,
  separated by a paragraph. The expected output shows commands from both blocks
  running in order.
- **"Skipping empty lines and `#` comments"**: covered by T6 step 3,
  _splitCommands skips comments and empty lines and joins continued lines_. The
  input has a leading `# build first` comment, an empty line and an indented `#
  done` comment, and none of them appear in the result.
- **"Joining a line ending with `\` with the next"**: covered by T6 step 3 as
  well. `node -e \` followed by `"console.log(1)"` becomes one command. A
  trailing `npm test \` at the end of the block becomes `npm test`.
- **"Fails at the first non-zero exit code"**: covered at two levels:
  - Within a step (T6 step 2): `process.exit(5)` makes the result `FAIL` with
    `step 1 (Lines) exited with code 5`, and the later `console.log(4)` command
    does not appear in the output, so it never ran.
  - Across steps (T6 step 1, _runTest runs the steps until the first failure
    without changing the test_): the `Fail` step exits with code 3 and the
    `Never` step does not run.
- **"The commands and their output are recorded"**: covered by T6 steps 1 and 2.
  The expected output records each command as a `$ <command>` line followed by
  what it printed, both stdout (`1`) and stderr (`2`), under a `[step
  n] <title>` header.

One small gap, not enough to fail coverage: the comment and continuation rules
are only tested on `splitCommands` directly. No `runTest` case runs a shell step
that contains a comment or a `\` continuation. If you want to show that
`runTest` actually applies those rules, add a `\` continuation and a `#` comment
line to the fixture of T6 step 2 and expect them in the recorded output.

## Status

- Result: PASS
- Coverage: COMPLETE
