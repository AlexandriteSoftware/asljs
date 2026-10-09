# R7 Test documents

A test's `## Steps` section holds one step per `###` heading. The steps run in
the test's folder, one after another, until the first that fails.

## Implementation

- [R8 Step types][R8]
- [R9 Shell steps][R9]
- [R10 JavaScript steps][R10]
- [R11 NET steps][R11]
- [R12 Instruction steps][R12]
- [T6 Shell steps][T6]
- [T7 JavaScript steps][T7]

[R8]: <R8 Step types.md>
[R9]: <R9 Shell steps.md>
[R10]: <R10 JavaScript steps.md>
[R11]: <R11 NET steps.md>
[R12]: <R12 Instruction steps.md>
[T6]: <../tests/T6 Shell steps.md>
[T7]: <../tests/T7 JavaScript steps.md>

## Coverage

R7 is fully covered. R7 makes three claims, and each one is checked by a linked
requirement or test:

- **"A test's `## Steps` section holds one step per `###` heading"**: covered by
  R8 Step types, through its test T5. T5 runs `parseSteps reads each ### heading
  as a step of its type` and `parseDocument reads the steps of a test`.
- **"The steps run in the test's folder"**: covered by T7 JavaScript steps, but
  only indirectly. Its step `runTest runs a JavaScript test file, or the tests
  matching a caption` puts the test at `tests/T1 JS.md` and the file at
  `tests/sample.test.mjs`. It then expects the command line to name just
  `sample.test.mjs` and the run to pass. That only works if the step runs inside
  `tests/`, which is the test's folder. The instruction-step test under R12 (via
  T9) points the same way: the fake agent writes `prompt.txt` into the folder of
  the test document. No test checks the working folder directly. If you want
  this to be harder to break, add a shell step to the T6 cases that runs `node
  -e "console.log(process.cwd())"` from a test in a subfolder and asserts that
  it prints that folder.
- **"one after another, until the first that fails"**: covered by T6 Shell
  steps. Its step `runTest runs the steps until the first failure without
  changing the test` runs two passing steps in order. It also runs a test whose
  step 1 fails and checks that step 2 never runs: the output stops at `[step 1]
  Fail`.

The other sub-requirements describe what each step type does, which supports R7
without adding statements of its own: R8 (type selection), R9 (shell), R10
(JavaScript), R11 (.NET) and R12 (instruction).

## Status

- Result: PASS
- Coverage: COMPLETE
