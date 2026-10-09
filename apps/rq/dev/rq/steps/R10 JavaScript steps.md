# R10 JavaScript steps

A JavaScript step runs `node --test` on a file, optionally only the tests whose
name contains a caption, and fails when the run fails or runs no test.

## Implementation

- [T7 JavaScript steps][T7]

[T7]: <../tests/T7 JavaScript steps.md>

## Coverage

R10 is fully covered by its one linked test, T7. R10 says a JavaScript step runs
`node --test` on a file, can be limited to the tests whose name contains a
caption, and fails when the run fails or runs no test. I read T7 and the three
test cases its steps run.

- **Runs `node --test` on a file.** Two places cover this:
  - `src/run-test.test.ts` "the JavaScript and .NET arguments and their no-test
    checks": with no caption, `getNodeTestArgs` builds `--test
    --test-reporter=tap a.test.js`.
  - `src/run-test.test.ts` "runTest runs a JavaScript test file, or the tests
    matching a caption": with no `Test:`, `runTest` runs the whole
    `sample.test.mjs`.
- **Optionally only the tests whose name contains a caption.** Also two places:
  - The `runTest` case uses the caption `adds (numbers)`. The step passes, so
    only the matching test ran and the failing test in the same file was
    skipped. The output shows `--test-name-pattern "adds \(numbers\)"`.
  - The arguments case checks that the caption is escaped as a regular
    expression (`adds \(1\+1\)`).
- **Fails when the run fails.** In the `runTest` case, the step with no caption
  also runs the throwing `fails` test, and the result note is `step 1 (Unit)
  exited with code 1`.
- **Fails when it runs no test.** In the `runTest` case, the caption `missing`
  gives `FAIL` with the note `step 1 (Unit) ran no test`. `ranNoNodeTest` is
  also checked directly against TAP output with `1..0` and no subtests, and
  against output with a real subtest.
- **How it runs.** `src/run-command.test.ts` "runProgram passes the arguments
  without a shell" shows that `node` gets the caption and file arguments exactly
  as written, without a shell.

One small gap, which doesn't affect the verdict: no case runs a whole file that
contains no tests at all. It's partly covered, because `ranNoNodeTest` is
checked against the `1..0` output such a file would produce.

## Status

- Result: PASS
- Coverage: COMPLETE
