# Steps

How the steps of a test are read and run.

- Steps are `###` headings under `## Steps` (`parseSteps`). The type is a `-
  Type:` item of the first list whose items are all fields, or is inferred: a
  code block makes `shell`, anything else `instruction`.
- `shell` lines run with `shell: true`. `javascript` and `dotnet` run without a
  shell (`runProgram`), so a caption with quotes, `$` or `%` reaches the test
  runner unchanged.
- `javascript` runs `node --test --test-reporter=tap` with the caption escaped
  as a regular expression, and without `NODE_TEST_CONTEXT`, which a parent `node
  --test` sets and which would change how the nested run reports. A filter that
  matches nothing still passes in Node, with the file reported as one test; the
  empty plan `1..0` in the TAP output is what shows it, and the step then fails.
- `dotnet` fails on `No test matches the given testcase filter` or `No test is
  available` even when `dotnet test` exits with 0.
