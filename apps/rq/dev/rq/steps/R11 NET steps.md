# R11 NET steps

A .NET step runs `dotnet test`, optionally of one project and with filter
criteria, and fails when the run fails or no test matches.

## Implementation

- [T8 NET steps][T8]

[T8]: <../tests/T8 NET steps.md>

## Coverage

R11 has four statements, and T8 now covers all of them through its three steps
in `src/run-test.test.ts`. T8's third step closes the gap the earlier analysis
reported.

- **A .NET step runs `dotnet test`.** T8, step "runTest runs dotnet test with
  the project and the filter" (`run-test.test.ts:174`). It runs a `dotnet` step
  through `runTest` and checks that the output records `$ dotnet test
  none/None.csproj --filter "Name~Export"`.
- **Optionally of one project and with filter criteria.** T8, step "the
  JavaScript and .NET arguments and their no-test checks"
  (`run-test.test.ts:298`). `getDotnetTestArgs` gives `['test']` when there is
  no project and no filter, and adds the project and `--filter` when both are
  given. The first step also checks this end to end, with both set. The second
  step checks the filter without a project (`$ dotnet test --filter
  "Name~Missing"`).
- **Fails when the run fails.** T8, first step. The project `none/None.csproj`
  does not exist, so `dotnet test` fails, and the test asserts that
  `result.status` is `FAIL`.
- **Fails when no test matches.** T8, step "runTest fails a .NET step that exits
  with 0 but runs no test" (`run-test.test.ts:384`). It runs the step through
  `runTest` with a stand-in program that exits with 0 and prints `No test
  matches the given testcase filter ...`. It asserts `FAIL` with the note `step
  1 (Unit) ran no test`. It also checks the opposite case: with `Passed!  -
  Failed: 0, Passed: 3`, the result is `PASS`. The third step also tests the
  `ranNoDotnetTest` detector on its own.

The `## Coverage` and `## Status` sections in R11 still describe the old gap.
The next `rq coverage` run will replace them.

## Status

- Result: PASS
- Coverage: COMPLETE
