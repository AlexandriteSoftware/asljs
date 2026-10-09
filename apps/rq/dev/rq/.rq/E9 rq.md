# E9 rq

- Date: 2026-10-09T14:13:28.117Z
- Command: `rq test .`
- Result: PASS - 29 of 29 tests passed
- Commit: d477e78789e298d9578a388c00a91027c3d353f6
- Branch: main
- Changed files:
  - `?? apps/rq/dev/rq/`

## T22 Command line

- File: <tests/T22 Command line.md>
- Result: PASS - 4 steps

```text
[step 1] rq without arguments prints help
$ node --test --test-reporter=tap --test-name-pattern "rq without arguments prints help" ../../../build/cli.test.js
TAP version 13
# Subtest: rq without arguments prints help
ok 1 - rq without arguments prints help
  ---
  duration_ms: 6.1316
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 354.9062
[step 2] rq test returns the verification exit code
$ node --test --test-reporter=tap --test-name-pattern "rq test returns the verification exit code" ../../../build/cli.test.js
TAP version 13
# Subtest: rq test returns the verification exit code
ok 1 - rq test returns the verification exit code
  ---
  duration_ms: 980.2992
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1285.7491
[step 3] rq view rejects an invalid port
$ node --test --test-reporter=tap --test-name-pattern "rq view rejects an invalid port" ../../../build/cli.test.js
TAP version 13
# Subtest: rq view rejects an invalid port
ok 1 - rq view rejects an invalid port
  ---
  duration_ms: 23.5665
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 338.7466
[step 4] every command returns 1 when it fails
$ node --test --test-reporter=tap --test-name-pattern "every command returns 1 when it fails" ../../../build/cli.test.js
TAP version 13
# Subtest: every command returns 1 when it fails
ok 1 - every command returns 1 when it fails
  ---
  duration_ms: 89.8205
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 422.8958
```

## T23 Command documentation

- File: <tests/T23 Command documentation.md>
- Result: PASS - 2 steps

```text
[step 1] List the commands
$ node ../../../bin/rq.js
Usage: rq [options] [command]

AI-assisted requirements management: test and view requirements and tests
written in markdown.

Options:
  -h, --help                           display help for command

Commands:
  test [options] <targets...>          Run the tests of requirements and tests,
                                       record the results in .rq/E<n> <slug>.md,
                                       and report their status
  coverage [options] <targets...>      Ask an AI agent whether the
                                       sub-requirements and tests of each
                                       requirement fully cover it, and record
                                       the verdict in its Status
  view [options] <path>                Serve the requirements graph and the
                                       rendered documents over HTTP
  check [options] <path>               Check the structure of the graph and its
                                       documents without running anything
  list [options] <path>                List the requirements and tests of the
                                       graph, from the roots down
  links [options] <file>               List the requirements and tests a
                                       requirement links to
  backlinks [options] <file>           List the requirements that link to a
                                       requirement or a test
  tojson [options] <path>              Print the graph as JSON with the
                                       structural fields and the status of every
                                       document
  add                                  Create a requirement or a test and link
                                       it from a requirement
  link [options] <parent> <child>      Link an existing requirement or test from
                                       a requirement
  unlink [options] <parent> <child>    Remove the links from a requirement to a
                                       requirement or test
  remove [options] <file>              Delete a requirement or a test and the
                                       links to it
  move [options] <file> <destination>  Move or rename a requirement or a test
                                       and rewrite the links to it
  log [options] <test>                 Record a result established another way
                                       in .rq/E<n> <test>.md
[step 2] Every command is documented
The step passed: every command `rq` lists is documented, along with its arguments and options, in one of the pages under `apps/rq/docs`. I ran `node ../../../bin/rq.js` and `--help` for each command, then searched the docs for each command and option.

| Commands | Page | Options described |
|---|---|---|
| `list`, `links`, `backlinks`, `tojson` | `Querying the graph.md` | `--json`, `--working-dir` |
| `add requirement`, `add test`, `link`, `unlink`, `remove`, `move`, `log` | `Changing the graph.md` | `--statement`, `--description`, `--step`, `--path`, `--recursive`, `--status`, `--note`, `--time`, `--working-dir` |
| `check` | `rq check.md` | `--working-dir` |
| `test` | `rq test.md` | `--recurse`, `--name`, `--ai`, `--working-dir` |
| `coverage` | `rq coverage.md` | `--recurse`, `--ai`, `--working-dir` |
| `view` | `rq view.md` | `--port`, `--working-dir` |

One small wording difference, which I didn't count as a failure: the CLI help calls the `links` argument `<file>`, while `Querying the graph.md` calls it `<requirement>`. The argument is still described.

{"result":"OK","message":""}
```

## T24 Edges

- File: <tests/T24 Edges.md>
- Result: PASS - 2 steps

```text
[step 1] loadGraph follows only Implementation links to requirements and tests
$ node --test --test-reporter=tap --test-name-pattern "loadGraph follows only Implementation links to requirements and tests" ../../../build/graph.test.js
TAP version 13
# Subtest: loadGraph follows only Implementation links to requirements and tests
ok 1 - loadGraph follows only Implementation links to requirements and tests
  ---
  duration_ms: 55.9122
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 338.2929
[step 2] parseDocument reads a requirement: title, local links and Implementation links
$ node --test --test-reporter=tap --test-name-pattern "parseDocument reads a requirement: title, local links and Implementation links" ../../../build/document.test.js
TAP version 13
# Subtest: parseDocument reads a requirement: title, local links and Implementation links
ok 1 - parseDocument reads a requirement: title, local links and Implementation links
  ---
  duration_ms: 14.1197
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 217.0659
```

## T6 Shell steps

- File: <tests/T6 Shell steps.md>
- Result: PASS - 3 steps

```text
[step 1] runTest runs the steps until the first failure without changing the test
$ node --test --test-reporter=tap --test-name-pattern "runTest runs the steps until the first failure without changing the test" ../../../build/run-test.test.js
TAP version 13
# Subtest: runTest runs the steps until the first failure without changing the test
ok 1 - runTest runs the steps until the first failure without changing the test
  ---
  duration_ms: 346.9702
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 585.2654
[step 2] runTest runs every line of every code block of a shell step and records the output
$ node --test --test-reporter=tap --test-name-pattern "runTest runs every line of every code block of a shell step and records the output" ../../../build/run-test.test.js
TAP version 13
# Subtest: runTest runs every line of every code block of a shell step and records the output
ok 1 - runTest runs every line of every code block of a shell step and records the output
  ---
  duration_ms: 321.6954
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 551.5726
[step 3] splitCommands skips comments and empty lines and joins continued lines
$ node --test --test-reporter=tap --test-name-pattern "splitCommands skips comments and empty lines and joins continued lines" ../../../build/steps.test.js
TAP version 13
# Subtest: splitCommands skips comments and empty lines and joins continued lines
ok 1 - splitCommands skips comments and empty lines and joins continued lines
  ---
  duration_ms: 1.4915
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 291.1603
```

## T7 JavaScript steps

- File: <tests/T7 JavaScript steps.md>
- Result: PASS - 3 steps

```text
[step 1] runTest runs a JavaScript test file, or the tests matching a caption
$ node --test --test-reporter=tap --test-name-pattern "runTest runs a JavaScript test file, or the tests matching a caption" ../../../build/run-test.test.js
TAP version 13
# Subtest: runTest runs a JavaScript test file, or the tests matching a caption
ok 1 - runTest runs a JavaScript test file, or the tests matching a caption
  ---
  duration_ms: 553.3923
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 791.1452
[step 2] runProgram passes the arguments without a shell
$ node --test --test-reporter=tap --test-name-pattern "runProgram passes the arguments without a shell" ../../../build/run-command.test.js
TAP version 13
# Subtest: runProgram passes the arguments without a shell
ok 1 - runProgram passes the arguments without a shell
  ---
  duration_ms: 77.9727
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 164.0833
[step 3] the JavaScript and .NET arguments and their no-test checks
$ node --test --test-reporter=tap --test-name-pattern "the JavaScript and \\.NET arguments and their no-test checks" ../../../build/run-test.test.js
TAP version 13
# Subtest: the JavaScript and .NET arguments and their no-test checks
ok 1 - the JavaScript and .NET arguments and their no-test checks
  ---
  duration_ms: 1.8467
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 262.5044
```

## T14 Coverage check

- File: <tests/T14 Coverage check.md>
- Result: PASS - 6 steps

```text
[step 1] checkCoverage asks the agent about a requirement and its links
$ node --test --test-reporter=tap --test-name-pattern "checkCoverage asks the agent about a requirement and its links" ../../../build/coverage.test.js
TAP version 13
# Subtest: checkCoverage asks the agent about a requirement and its links
ok 1 - checkCoverage asks the agent about a requirement and its links
  ---
  duration_ms: 463.5736
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 694.6574
[step 2] checkCoverage prompt names the requirement and its links
$ node --test --test-reporter=tap --test-name-pattern "checkCoverage prompt names the requirement and its links" ../../../build/coverage.test.js
TAP version 13
# Subtest: checkCoverage prompt names the requirement and its links
ok 1 - checkCoverage prompt names the requirement and its links
  ---
  duration_ms: 154.0973
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 391.6682
[step 3] execCoverage records the verdict of each selected requirement in its Status
$ node --test --test-reporter=tap --test-name-pattern "execCoverage records the verdict of each selected requirement in its Status" ../../../build/coverage.test.js
TAP version 13
# Subtest: execCoverage records the verdict of each selected requirement in its Status
ok 1 - execCoverage records the verdict of each selected requirement in its Status
  ---
  duration_ms: 503.5747
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 738.6704
[step 4] execCoverage writes the analysis to the Coverage section, before the Status
$ node --test --test-reporter=tap --test-name-pattern "execCoverage writes the analysis to the Coverage section, before the Status" ../../../build/coverage.test.js
TAP version 13
# Subtest: execCoverage writes the analysis to the Coverage section, before the Status
ok 1 - execCoverage writes the analysis to the Coverage section, before the Status
  ---
  duration_ms: 276.381
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 505.4896
[step 5] writeCoverageSection adds the section before the Status, or replaces it
$ node --test --test-reporter=tap --test-name-pattern "writeCoverageSection adds the section before the Status, or replaces it" ../../../build/coverage-section.test.js
TAP version 13
# Subtest: writeCoverageSection adds the section before the Status, or replaces it
ok 1 - writeCoverageSection adds the section before the Status, or replaces it
  ---
  duration_ms: 14.3704
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 231.1541
[step 6] execTest writes the status of each test and of the requirements above it
$ node --test --test-reporter=tap --test-name-pattern "execTest writes the status of each test and of the requirements above it" ../../../build/test.test.js
TAP version 13
# Subtest: execTest writes the status of each test and of the requirements above it
ok 1 - execTest writes the status of each test and of the requirements above it
  ---
  duration_ms: 530.5468
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 765.3487
```

## T15 AI agents

- File: <tests/T15 AI agents.md>
- Result: PASS - 4 steps

```text
[step 1] parseAgentSpec reads an optional agent and model
$ node --test --test-reporter=tap --test-name-pattern "parseAgentSpec reads an optional agent and model" ../../../build/agent.test.js
TAP version 13
# Subtest: parseAgentSpec reads an optional agent and model
ok 1 - parseAgentSpec reads an optional agent and model
  ---
  duration_ms: 1.7025
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 133.6703
[step 2] getAgentCommand prefers the override, then the named agent, then the detected one
$ node --test --test-reporter=tap --test-name-pattern "getAgentCommand prefers the override, then the named agent, then the detected one" ../../../build/agent.test.js
TAP version 13
# Subtest: getAgentCommand prefers the override, then the named agent, then the detected one
ok 1 - getAgentCommand prefers the override, then the named agent, then the detected one
  ---
  duration_ms: 1.8003
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 132.5576
[step 3] askAgent reads the verdict from the last JSON line
$ node --test --test-reporter=tap --test-name-pattern "askAgent reads the verdict from the last JSON line" ../../../build/agent.test.js
TAP version 13
# Subtest: askAgent reads the verdict from the last JSON line
ok 1 - askAgent reads the verdict from the last JSON line
  ---
  duration_ms: 441.0329
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 582.3319
[step 4] detectAgent picks the first agent whose command runs, claude before copilot
$ node --test --test-reporter=tap --test-name-pattern "detectAgent picks the first agent whose command runs, claude before copilot" ../../../build/agent.test.js
TAP version 13
# Subtest: detectAgent picks the first agent whose command runs, claude before copilot
ok 1 - detectAgent picks the first agent whose command runs, claude before copilot
  ---
  duration_ms: 4.2028
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 350.7595
```

## T21 Working folder

- File: <tests/T21 Working folder.md>
- Result: PASS - 4 steps

```text
[step 1] resolveTarget searches the working folder for ids and .md names, and resolves other paths
$ node --test --test-reporter=tap --test-name-pattern "resolveTarget searches the working folder for ids and \\.md names, and resolves other paths" ../../../build/scope.test.js
TAP version 13
# Subtest: resolveTarget searches the working folder for ids and .md names, and resolves other paths
ok 1 - resolveTarget searches the working folder for ids and .md names, and resolves other paths
  ---
  duration_ms: 30.1907
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 649.3532
[step 2] rq add, links, backlinks, log and check forward their options
$ node --test --test-reporter=tap --test-name-pattern "rq add, links, backlinks, log and check forward their options" ../../../build/cli.test.js
TAP version 13
# Subtest: rq add, links, backlinks, log and check forward their options
ok 1 - rq add, links, backlinks, log and check forward their options
  ---
  duration_ms: 432.6291
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 908.2084
[step 3] every command works in --working-dir and takes ids and .md names
$ node --test --test-reporter=tap --test-name-pattern "every command works in --working-dir and takes ids and \\.md names" ../../../build/cli.test.js
TAP version 13
# Subtest: every command works in --working-dir and takes ids and .md names
ok 1 - every command works in --working-dir and takes ids and .md names
  ---
  duration_ms: 973.3277
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1400.4094
[step 4] execView takes an id in the working folder and reads the recorded statuses
$ node --test --test-reporter=tap --test-name-pattern "execView takes an id in the working folder and reads the recorded statuses" ../../../build/view.test.js
TAP version 13
# Subtest: execView takes an id in the working folder and reads the recorded statuses
ok 1 - execView takes an id in the working folder and reads the recorded statuses
  ---
  duration_ms: 115.1906
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 498.2843
```

## T1 Node kinds

- File: <tests/T1 Node kinds.md>
- Result: PASS - 1 step

```text
[step 1] getNodeKind reads the kind from the file name
$ node --test --test-reporter=tap --test-name-pattern "getNodeKind reads the kind from the file name" ../../../build/graph.test.js
TAP version 13
# Subtest: getNodeKind reads the kind from the file name
ok 1 - getNodeKind reads the kind from the file name
  ---
  duration_ms: 1.6066
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 348.0215
```

## T29 Ids and cycles

- File: <tests/T29 Ids and cycles.md>
- Result: PASS - 1 step

```text
[step 1] loadGraph reports duplicate ids, and the cycles of a folder without a root
$ node --test --test-reporter=tap --test-name-pattern "loadGraph reports duplicate ids, and the cycles of a folder without a root" ../../../build/graph.test.js
TAP version 13
# Subtest: loadGraph reports duplicate ids, and the cycles of a folder without a root
ok 1 - loadGraph reports duplicate ids, and the cycles of a folder without a root
  ---
  duration_ms: 71.3806
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 416.4645
```

## T2 Requirement hierarchy

- File: <tests/T2 Requirement hierarchy.md>
- Result: PASS - 3 steps

```text
[step 1] loadGraph reports a requirement linked from several requirements
$ node --test --test-reporter=tap --test-name-pattern "loadGraph reports a requirement linked from several requirements" ../../../build/graph.test.js
TAP version 13
# Subtest: loadGraph reports a requirement linked from several requirements
ok 1 - loadGraph reports a requirement linked from several requirements
  ---
  duration_ms: 46.654
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 406.9651
[step 2] loadGraph reports broken links, cycles and unreachable documents
$ node --test --test-reporter=tap --test-name-pattern "loadGraph reports broken links, cycles and unreachable documents" ../../../build/graph.test.js
TAP version 13
# Subtest: loadGraph reports broken links, cycles and unreachable documents
ok 1 - loadGraph reports broken links, cycles and unreachable documents
  ---
  duration_ms: 72.0035
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 385.1995
[step 3] execLink links an existing node and refuses duplicates, cycles and a second parent
$ node --test --test-reporter=tap --test-name-pattern "execLink links an existing node and refuses duplicates, cycles and a second parent" ../../../build/change.test.js
TAP version 13
# Subtest: execLink links an existing node and refuses duplicates, cycles and a second parent
ok 1 - execLink links an existing node and refuses duplicates, cycles and a second parent
  ---
  duration_ms: 205.3315
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 582.1095
```

## T3 Tests

- File: <tests/T3 Tests.md>
- Result: PASS - 4 steps

```text
[step 1] loadGraph takes every unlinked requirement of a folder as a root
$ node --test --test-reporter=tap --test-name-pattern "loadGraph takes every unlinked requirement of a folder as a root" ../../../build/graph.test.js
TAP version 13
# Subtest: loadGraph takes every unlinked requirement of a folder as a root
ok 1 - loadGraph takes every unlinked requirement of a folder as a root
  ---
  duration_ms: 86.3992
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 433.7583
[step 2] loadGraph follows only Implementation links to requirements and tests
$ node --test --test-reporter=tap --test-name-pattern "loadGraph follows only Implementation links to requirements and tests" ../../../build/graph.test.js
TAP version 13
# Subtest: loadGraph follows only Implementation links to requirements and tests
ok 1 - loadGraph follows only Implementation links to requirements and tests
  ---
  duration_ms: 71.9794
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 437.2869
[step 3] loadGraph makes no edges from the links of a test
$ node --test --test-reporter=tap --test-name-pattern "loadGraph makes no edges from the links of a test" ../../../build/graph.test.js
TAP version 13
# Subtest: loadGraph makes no edges from the links of a test
ok 1 - loadGraph makes no edges from the links of a test
  ---
  duration_ms: 62.9629
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 391.8464
[step 4] execCheck reports problems of the graph and of each document
$ node --test --test-reporter=tap --test-name-pattern "execCheck reports problems of the graph and of each document" ../../../build/check.test.js
TAP version 13
# Subtest: execCheck reports problems of the graph and of each document
ok 1 - execCheck reports problems of the graph and of each document
  ---
  duration_ms: 83.1236
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 402.4436
```

## T4 Status section

- File: <tests/T4 Status section.md>
- Result: PASS - 4 steps

```text
[step 1] readStatus reads the result, the coverage and the execution link
$ node --test --test-reporter=tap --test-name-pattern "readStatus reads the result, the coverage and the execution link" ../../../build/status-section.test.js
TAP version 13
# Subtest: readStatus reads the result, the coverage and the execution link
ok 1 - readStatus reads the result, the coverage and the execution link
  ---
  duration_ms: 14.2289
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 263.8321
[step 2] writeStatus adds, replaces and removes the section
$ node --test --test-reporter=tap --test-name-pattern "writeStatus adds, replaces and removes the section" ../../../build/status-section.test.js
TAP version 13
# Subtest: writeStatus adds, replaces and removes the section
ok 1 - writeStatus adds, replaces and removes the section
  ---
  duration_ms: 12.0144
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 279.815
[step 3] writeStatus keeps the content of the section it does not own
$ node --test --test-reporter=tap --test-name-pattern "writeStatus keeps the content of the section it does not own" ../../../build/status-section.test.js
TAP version 13
# Subtest: writeStatus keeps the content of the section it does not own
ok 1 - writeStatus keeps the content of the section it does not own
  ---
  duration_ms: 16.0263
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 266.1595
[step 4] execCheck reports a malformed Status and a test with a coverage
$ node --test --test-reporter=tap --test-name-pattern "execCheck reports a malformed Status and a test with a coverage" ../../../build/check.test.js
TAP version 13
# Subtest: execCheck reports a malformed Status and a test with a coverage
ok 1 - execCheck reports a malformed Status and a test with a coverage
  ---
  duration_ms: 42.3408
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 344.2455
```

## T5 Step types

- File: <tests/T5 Step types.md>
- Result: PASS - 5 steps

```text
[step 1] parseSteps reads each ### heading as a step of its type
$ node --test --test-reporter=tap --test-name-pattern "parseSteps reads each ### heading as a step of its type" ../../../build/steps.test.js
TAP version 13
# Subtest: parseSteps reads each \#\#\# heading as a step of its type
ok 1 - parseSteps reads each \#\#\# heading as a step of its type
  ---
  duration_ms: 13.8239
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 226.058
[step 2] parseSteps reports what is wrong with the steps
$ node --test --test-reporter=tap --test-name-pattern "parseSteps reports what is wrong with the steps" ../../../build/steps.test.js
TAP version 13
# Subtest: parseSteps reports what is wrong with the steps
ok 1 - parseSteps reports what is wrong with the steps
  ---
  duration_ms: 13.898
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 332.2978
[step 3] parseDocument reads the steps of a test
$ node --test --test-reporter=tap --test-name-pattern "parseDocument reads the steps of a test" ../../../build/document.test.js
TAP version 13
# Subtest: parseDocument reads the steps of a test
ok 1 - parseDocument reads the steps of a test
  ---
  duration_ms: 17.7273
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 337.8259
[step 4] execCheck reports problems of the graph and of each document
$ node --test --test-reporter=tap --test-name-pattern "execCheck reports problems of the graph and of each document" ../../../build/check.test.js
TAP version 13
# Subtest: execCheck reports problems of the graph and of each document
ok 1 - execCheck reports problems of the graph and of each document
  ---
  duration_ms: 90.5058
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 523.8025
[step 5] runTest fails a test with a malformed step without running any step
$ node --test --test-reporter=tap --test-name-pattern "runTest fails a test with a malformed step without running any step" ../../../build/run-test.test.js
TAP version 13
# Subtest: runTest fails a test with a malformed step without running any step
ok 1 - runTest fails a test with a malformed step without running any step
  ---
  duration_ms: 27.8068
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 403.036
```

## T8 NET steps

- File: <tests/T8 NET steps.md>
- Result: PASS - 2 steps

```text
[step 1] runTest runs dotnet test with the project and the filter
$ node --test --test-reporter=tap --test-name-pattern "runTest runs dotnet test with the project and the filter" ../../../build/run-test.test.js
TAP version 13
# Subtest: runTest runs dotnet test with the project and the filter
ok 1 - runTest runs dotnet test with the project and the filter
  ---
  duration_ms: 500.637
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 847.5709
[step 2] the JavaScript and .NET arguments and their no-test checks
$ node --test --test-reporter=tap --test-name-pattern "the JavaScript and \\.NET arguments and their no-test checks" ../../../build/run-test.test.js
TAP version 13
# Subtest: the JavaScript and .NET arguments and their no-test checks
ok 1 - the JavaScript and .NET arguments and their no-test checks
  ---
  duration_ms: 2.9321
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 421.1044
```

## T9 Instruction steps

- File: <tests/T9 Instruction steps.md>
- Result: PASS - 2 steps

```text
[step 1] runTest asks the agent to carry out an instruction step
$ node --test --test-reporter=tap --test-name-pattern "runTest asks the agent to carry out an instruction step" ../../../build/run-test.test.js
TAP version 13
# Subtest: runTest asks the agent to carry out an instruction step
ok 1 - runTest asks the agent to carry out an instruction step
  ---
  duration_ms: 409.0481
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 736.2681
[step 2] getAgentCommand lets an agent read and run commands, but not edit files, in run mode
$ node --test --test-reporter=tap --test-name-pattern "getAgentCommand lets an agent read and run commands, but not edit files, in run mode" ../../../build/agent.test.js
TAP version 13
# Subtest: getAgentCommand lets an agent read and run commands, but not edit files, in run mode
ok 1 - getAgentCommand lets an agent read and run commands, but not edit files, in run mode
  ---
  duration_ms: 1.2382
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 176.2862
```

## T10 Test targets

- File: <tests/T10 Test targets.md>
- Result: PASS - 3 steps

```text
[step 1] execTest takes several paths, names and ids, and runs each test once
$ node --test --test-reporter=tap --test-name-pattern "execTest takes several paths, names and ids, and runs each test once" ../../../build/test.test.js
TAP version 13
# Subtest: execTest takes several paths, names and ids, and runs each test once
ok 1 - execTest takes several paths, names and ids, and runs each test once
  ---
  duration_ms: 962.6977
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1246.7961
[step 2] execTest of a requirement runs its own tests, and with recurse everything below it
$ node --test --test-reporter=tap --test-name-pattern "execTest of a requirement runs its own tests, and with recurse everything below it" ../../../build/test.test.js
TAP version 13
# Subtest: execTest of a requirement runs its own tests, and with recurse everything below it
ok 1 - execTest of a requirement runs its own tests, and with recurse everything below it
  ---
  duration_ms: 752.5183
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1048.4586
[step 3] selectTargets selects a target, its direct tests, or everything below it
$ node --test --test-reporter=tap --test-name-pattern "selectTargets selects a target, its direct tests, or everything below it" ../../../build/targets.test.js
TAP version 13
# Subtest: selectTargets selects a target, its direct tests, or everything below it
ok 1 - selectTargets selects a target, its direct tests, or everything below it
  ---
  duration_ms: 95.3992
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 375.8319
```

## T11 Execution files

- File: <tests/T11 Execution files.md>
- Result: PASS - 6 steps

```text
[step 1] formatExecution writes the run, the working directory and each test
$ node --test --test-reporter=tap --test-name-pattern "formatExecution writes the run, the working directory and each test" ../../../build/results.test.js
TAP version 13
# Subtest: formatExecution writes the run, the working directory and each test
ok 1 - formatExecution writes the run, the working directory and each test
  ---
  duration_ms: 1.5328
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 285.72
[step 2] writeExecution numbers the files and loadResults keeps the latest result of each test
$ node --test --test-reporter=tap --test-name-pattern "writeExecution numbers the files and loadResults keeps the latest result of each test" ../../../build/results.test.js
TAP version 13
# Subtest: writeExecution numbers the files and loadResults keeps the latest result of each test
ok 1 - writeExecution numbers the files and loadResults keeps the latest result of each test
  ---
  duration_ms: 52.4163
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 342.9448
[step 3] parseExecution reads the result of each test section
$ node --test --test-reporter=tap --test-name-pattern "parseExecution reads the result of each test section" ../../../build/results.test.js
TAP version 13
# Subtest: parseExecution reads the result of each test section
ok 1 - parseExecution reads the result of each test section
  ---
  duration_ms: 12.3457
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 341.4138
[step 4] readWorkingTree reads the commit, the branch and the changed files
$ node --test --test-reporter=tap --test-name-pattern "readWorkingTree reads the commit, the branch and the changed files" ../../../build/results.test.js
TAP version 13
# Subtest: readWorkingTree reads the commit, the branch and the changed files
ok 1 - readWorkingTree reads the commit, the branch and the changed files
  ---
  duration_ms: 687.5897
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 968.9592
[step 5] loadResults prefers a later date, and writeExecution never reuses a number
$ node --test --test-reporter=tap --test-name-pattern "loadResults prefers a later date, and writeExecution never reuses a number" ../../../build/results.test.js
TAP version 13
# Subtest: loadResults prefers a later date, and writeExecution never reuses a number
ok 1 - loadResults prefers a later date, and writeExecution never reuses a number
  ---
  duration_ms: 41.1621
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 295.1738
[step 6] execTest of a folder runs every test, records them, and reports the latest status
$ node --test --test-reporter=tap --test-name-pattern "execTest of a folder runs every test, records them, and reports the latest status" ../../../build/test.test.js
TAP version 13
# Subtest: execTest of a folder runs every test, records them, and reports the latest status
ok 1 - execTest of a folder runs every test, records them, and reports the latest status
  ---
  duration_ms: 431.8063
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 682.8128
```

## T12 Status recalculation

- File: <tests/T12 Status recalculation.md>
- Result: PASS - 6 steps

```text
[step 1] getStatuses passes a requirement only when everything below it passes
$ node --test --test-reporter=tap --test-name-pattern "getStatuses passes a requirement only when everything below it passes" ../../../build/status.test.js
TAP version 13
# Subtest: getStatuses passes a requirement only when everything below it passes
ok 1 - getStatuses passes a requirement only when everything below it passes
  ---
  duration_ms: 46.3161
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 281.4633
[step 2] getStatuses fails a requirement with no links and one in a cycle
$ node --test --test-reporter=tap --test-name-pattern "getStatuses fails a requirement with no links and one in a cycle" ../../../build/status.test.js
TAP version 13
# Subtest: getStatuses fails a requirement with no links and one in a cycle
ok 1 - getStatuses fails a requirement with no links and one in a cycle
  ---
  duration_ms: 34.9585
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 263.0718
[step 3] getStatuses takes the recorded results, and recalculates only what it is asked to
$ node --test --test-reporter=tap --test-name-pattern "getStatuses takes the recorded results, and recalculates only what it is asked to" ../../../build/status.test.js
TAP version 13
# Subtest: getStatuses takes the recorded results, and recalculates only what it is asked to
ok 1 - getStatuses takes the recorded results, and recalculates only what it is asked to
  ---
  duration_ms: 48.991
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 278.3818
[step 4] execTest writes the status of each test and of the requirements above it
$ node --test --test-reporter=tap --test-name-pattern "execTest writes the status of each test and of the requirements above it" ../../../build/test.test.js
TAP version 13
# Subtest: execTest writes the status of each test and of the requirements above it
ok 1 - execTest writes the status of each test and of the requirements above it
  ---
  duration_ms: 525.5275
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 768.4956
[step 5] execTest merges the tests it ran with the recorded statuses, without reading .rq
$ node --test --test-reporter=tap --test-name-pattern "execTest merges the tests it ran with the recorded statuses, without reading \\.rq" ../../../build/test.test.js
TAP version 13
# Subtest: execTest merges the tests it ran with the recorded statuses, without reading .rq
ok 1 - execTest merges the tests it ran with the recorded statuses, without reading .rq
  ---
  duration_ms: 284.5828
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 532.9471
[step 6] execUnlink takes ids, execMove retitles reference links, and both refresh statuses
$ node --test --test-reporter=tap --test-name-pattern "execUnlink takes ids, execMove retitles reference links, and both refresh statuses" ../../../build/change.test.js
TAP version 13
# Subtest: execUnlink takes ids, execMove retitles reference links, and both refresh statuses
ok 1 - execUnlink takes ids, execMove retitles reference links, and both refresh statuses
  ---
  duration_ms: 202.4819
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 445.4779
```

## T13 Manual results

- File: <tests/T13 Manual results.md>
- Result: PASS - 1 step

```text
[step 1] execLog records a result of a test only, in an execution file
$ node --test --test-reporter=tap --test-name-pattern "execLog records a result of a test only, in an execution file" ../../../build/change.test.js
TAP version 13
# Subtest: execLog records a result of a test only, in an execution file
ok 1 - execLog records a result of a test only, in an execution file
  ---
  duration_ms: 135.2545
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 382.1091
```

## T25 Test report

- File: <tests/T25 Test report.md>
- Result: PASS - 7 steps

```text
[step 1] execTest of a folder runs every test, records them, and reports the latest status
$ node --test --test-reporter=tap --test-name-pattern "execTest of a folder runs every test, records them, and reports the latest status" ../../../build/test.test.js
TAP version 13
# Subtest: execTest of a folder runs every test, records them, and reports the latest status
ok 1 - execTest of a folder runs every test, records them, and reports the latest status
  ---
  duration_ms: 410.954
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 659.2936
[step 2] execTest reports structure errors and requirements with no links
$ node --test --test-reporter=tap --test-name-pattern "execTest reports structure errors and requirements with no links" ../../../build/test.test.js
TAP version 13
# Subtest: execTest reports structure errors and requirements with no links
ok 1 - execTest reports structure errors and requirements with no links
  ---
  duration_ms: 27.797
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 267.5784
[step 3] execTest and execLog remove the oldest execution files beyond the retention
$ node --test --test-reporter=tap --test-name-pattern "execTest and execLog remove the oldest execution files beyond the retention" ../../../build/test.test.js
TAP version 13
# Subtest: execTest and execLog remove the oldest execution files beyond the retention
ok 1 - execTest and execLog remove the oldest execution files beyond the retention
  ---
  duration_ms: 452.3895
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 691.488
[step 4] execTest of a requirement runs its own tests, and with recurse everything below it
$ node --test --test-reporter=tap --test-name-pattern "execTest of a requirement runs its own tests, and with recurse everything below it" ../../../build/test.test.js
TAP version 13
# Subtest: execTest of a requirement runs its own tests, and with recurse everything below it
ok 1 - execTest of a requirement runs its own tests, and with recurse everything below it
  ---
  duration_ms: 625.6327
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 865.2771
[step 5] execTest merges the tests it ran with the recorded statuses, without reading .rq
$ node --test --test-reporter=tap --test-name-pattern "execTest merges the tests it ran with the recorded statuses, without reading \\.rq" ../../../build/test.test.js
TAP version 13
# Subtest: execTest merges the tests it ran with the recorded statuses, without reading .rq
ok 1 - execTest merges the tests it ran with the recorded statuses, without reading .rq
  ---
  duration_ms: 291.567
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 530.5575
[step 6] execTest exits with 1 on a structure error even when every node passes
$ node --test --test-reporter=tap --test-name-pattern "execTest exits with 1 on a structure error even when every node passes" ../../../build/test.test.js
TAP version 13
# Subtest: execTest exits with 1 on a structure error even when every node passes
ok 1 - execTest exits with 1 on a structure error even when every node passes
  ---
  duration_ms: 164.9242
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 401.4603
[step 7] rq test returns the verification exit code
$ node --test --test-reporter=tap --test-name-pattern "rq test returns the verification exit code" ../../../build/cli.test.js
TAP version 13
# Subtest: rq test returns the verification exit code
ok 1 - rq test returns the verification exit code
  ---
  duration_ms: 951.415
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1231.5743
```

## T26 Retention

- File: <tests/T26 Retention.md>
- Result: PASS - 4 steps

```text
[step 1] pruneExecutions removes the oldest files beyond the limits, keeping the latest results
$ node --test --test-reporter=tap --test-name-pattern "pruneExecutions removes the oldest files beyond the limits, keeping the latest results" ../../../build/results.test.js
TAP version 13
# Subtest: pruneExecutions removes the oldest files beyond the limits, keeping the latest results
ok 1 - pruneExecutions removes the oldest files beyond the limits, keeping the latest results
  ---
  duration_ms: 69.3268
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 304.2523
[step 2] pruneExecutions keeps 300 files and 50 MB by default, and removes by size
$ node --test --test-reporter=tap --test-name-pattern "pruneExecutions keeps 300 files and 50 MB by default, and removes by size" ../../../build/results.test.js
TAP version 13
# Subtest: pruneExecutions keeps 300 files and 50 MB by default, and removes by size
ok 1 - pruneExecutions keeps 300 files and 50 MB by default, and removes by size
  ---
  duration_ms: 39.2703
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 264.1608
[step 3] pruneExecutions does not keep the results of tests that no longer exist
$ node --test --test-reporter=tap --test-name-pattern "pruneExecutions does not keep the results of tests that no longer exist" ../../../build/results.test.js
TAP version 13
# Subtest: pruneExecutions does not keep the results of tests that no longer exist
ok 1 - pruneExecutions does not keep the results of tests that no longer exist
  ---
  duration_ms: 22.7319
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 251.4699
[step 4] execTest and execLog remove the oldest execution files beyond the retention
$ node --test --test-reporter=tap --test-name-pattern "execTest and execLog remove the oldest execution files beyond the retention" ../../../build/test.test.js
TAP version 13
# Subtest: execTest and execLog remove the oldest execution files beyond the retention
ok 1 - execTest and execLog remove the oldest execution files beyond the retention
  ---
  duration_ms: 455.0712
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 699.8611
```

## T16 Diagram borders

- File: <tests/T16 Diagram borders.md>
- Result: PASS - 2 steps

```text
[step 1] toMermaid draws requirements and tests by status, edges and links
$ node --test --test-reporter=tap --test-name-pattern "toMermaid draws requirements and tests by status, edges and links" ../../../build/mermaid.test.js
TAP version 13
# Subtest: toMermaid draws requirements and tests by status, edges and links
ok 1 - toMermaid draws requirements and tests by status, edges and links
  ---
  duration_ms: 48.0063
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 281.9044
[step 2] getAppearance colours by result and styles a requirement by its coverage
$ node --test --test-reporter=tap --test-name-pattern "getAppearance colours by result and styles a requirement by its coverage" ../../../build/mermaid.test.js
TAP version 13
# Subtest: getAppearance colours by result and styles a requirement by its coverage
ok 1 - getAppearance colours by result and styles a requirement by its coverage
  ---
  duration_ms: 50.3986
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 287.0854
```

## T17 View server

- File: <tests/T17 View server.md>
- Result: PASS - 2 steps

```text
[step 1] execView serves the graph and the rendered documents
$ node --test --test-reporter=tap --test-name-pattern "execView serves the graph and the rendered documents" ../../../build/view.test.js
TAP version 13
# Subtest: execView serves the graph and the rendered documents
ok 1 - execView serves the graph and the rendered documents
  ---
  duration_ms: 194.2625
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 484.0891
[step 2] execView of a file serves its folder and shows its problems
$ node --test --test-reporter=tap --test-name-pattern "execView of a file serves its folder and shows its problems" ../../../build/view.test.js
TAP version 13
# Subtest: execView of a file serves its folder and shows its problems
ok 1 - execView of a file serves its folder and shows its problems
  ---
  duration_ms: 80.6404
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 360.5633
```

## T18 Changing the graph

- File: <tests/T18 Changing the graph.md>
- Result: PASS - 9 steps

```text
[step 1] execAdd creates a requirement next to its parent and links it
$ node --test --test-reporter=tap --test-name-pattern "execAdd creates a requirement next to its parent and links it" ../../../build/change.test.js
TAP version 13
# Subtest: execAdd creates a requirement next to its parent and links it
ok 1 - execAdd creates a requirement next to its parent and links it
  ---
  duration_ms: 93.7781
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 329.7143
[step 2] execAdd creates a test with steps in the tests folder
$ node --test --test-reporter=tap --test-name-pattern "execAdd creates a test with steps in the tests folder" ../../../build/change.test.js
TAP version 13
# Subtest: execAdd creates a test with steps in the tests folder
ok 1 - execAdd creates a test with steps in the tests folder
  ---
  duration_ms: 125.4979
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 364.0152
[step 3] execAdd refuses a test parent, a bad name and an existing file
$ node --test --test-reporter=tap --test-name-pattern "execAdd refuses a test parent, a bad name and an existing file" ../../../build/change.test.js
TAP version 13
# Subtest: execAdd refuses a test parent, a bad name and an existing file
ok 1 - execAdd refuses a test parent, a bad name and an existing file
  ---
  duration_ms: 38.1807
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 284.0262
[step 4] execLink links an existing node and refuses duplicates, cycles and a second parent
$ node --test --test-reporter=tap --test-name-pattern "execLink links an existing node and refuses duplicates, cycles and a second parent" ../../../build/change.test.js
TAP version 13
# Subtest: execLink links an existing node and refuses duplicates, cycles and a second parent
ok 1 - execLink links an existing node and refuses duplicates, cycles and a second parent
  ---
  duration_ms: 177.8508
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 415.0548
[step 5] execUnlink removes every link to the child
$ node --test --test-reporter=tap --test-name-pattern "execUnlink removes every link to the child" ../../../build/change.test.js
TAP version 13
# Subtest: execUnlink removes every link to the child
ok 1 - execUnlink removes every link to the child
  ---
  duration_ms: 63.5246
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 306.7765
[step 6] execRemove deletes a leaf and the links to it
$ node --test --test-reporter=tap --test-name-pattern "execRemove deletes a leaf and the links to it" ../../../build/change.test.js
TAP version 13
# Subtest: execRemove deletes a leaf and the links to it
ok 1 - execRemove deletes a leaf and the links to it
  ---
  duration_ms: 67.0841
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 307.1263
[step 7] execRemove --recursive deletes what only removed documents link to
$ node --test --test-reporter=tap --test-name-pattern "execRemove --recursive deletes what only removed documents link to" ../../../build/change.test.js
TAP version 13
# Subtest: execRemove --recursive deletes what only removed documents link to
ok 1 - execRemove --recursive deletes what only removed documents link to
  ---
  duration_ms: 97.4268
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 334.365
[step 8] execMove renames a document and rewrites the links to it
$ node --test --test-reporter=tap --test-name-pattern "execMove renames a document and rewrites the links to it" ../../../build/change.test.js
TAP version 13
# Subtest: execMove renames a document and rewrites the links to it
ok 1 - execMove renames a document and rewrites the links to it
  ---
  duration_ms: 159.1255
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 401.221
[step 9] execUnlink takes ids, execMove retitles reference links, and both refresh statuses
$ node --test --test-reporter=tap --test-name-pattern "execUnlink takes ids, execMove retitles reference links, and both refresh statuses" ../../../build/change.test.js
TAP version 13
# Subtest: execUnlink takes ids, execMove retitles reference links, and both refresh statuses
ok 1 - execUnlink takes ids, execMove retitles reference links, and both refresh statuses
  ---
  duration_ms: 197.2892
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 437.1375
```

## T19 Querying the graph

- File: <tests/T19 Querying the graph.md>
- Result: PASS - 4 steps

```text
[step 1] execList prints every node from the root down, as text or JSON
$ node --test --test-reporter=tap --test-name-pattern "execList prints every node from the root down, as text or JSON" ../../../build/query.test.js
TAP version 13
# Subtest: execList prints every node from the root down, as text or JSON
ok 1 - execList prints every node from the root down, as text or JSON
  ---
  duration_ms: 50.1251
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 289.136
[step 2] execLinks prints what a requirement links to, missing and other files included
$ node --test --test-reporter=tap --test-name-pattern "execLinks prints what a requirement links to, missing and other files included" ../../../build/query.test.js
TAP version 13
# Subtest: execLinks prints what a requirement links to, missing and other files included
ok 1 - execLinks prints what a requirement links to, missing and other files included
  ---
  duration_ms: 38.8021
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 270.0463
[step 3] execBacklinks prints the requirements that link to a document
$ node --test --test-reporter=tap --test-name-pattern "execBacklinks prints the requirements that link to a document" ../../../build/query.test.js
TAP version 13
# Subtest: execBacklinks prints the requirements that link to a document
ok 1 - execBacklinks prints the requirements that link to a document
  ---
  duration_ms: 51.3833
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 290.2087
[step 4] execToJson prints the graph with the structural fields
$ node --test --test-reporter=tap --test-name-pattern "execToJson prints the graph with the structural fields" ../../../build/query.test.js
TAP version 13
# Subtest: execToJson prints the graph with the structural fields
ok 1 - execToJson prints the graph with the structural fields
  ---
  duration_ms: 45.875
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 278.8889
```

## T20 Checking the graph

- File: <tests/T20 Checking the graph.md>
- Result: PASS - 3 steps

```text
[step 1] execCheck passes a well-formed graph without running its steps
$ node --test --test-reporter=tap --test-name-pattern "execCheck passes a well-formed graph without running its steps" ../../../build/check.test.js
TAP version 13
# Subtest: execCheck passes a well-formed graph without running its steps
ok 1 - execCheck passes a well-formed graph without running its steps
  ---
  duration_ms: 55.2057
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 291.0956
[step 2] execCheck reports problems of the graph and of each document
$ node --test --test-reporter=tap --test-name-pattern "execCheck reports problems of the graph and of each document" ../../../build/check.test.js
TAP version 13
# Subtest: execCheck reports problems of the graph and of each document
ok 1 - execCheck reports problems of the graph and of each document
  ---
  duration_ms: 57.3185
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 295.2007
[step 3] execCheck reports a malformed Status and a test with a coverage
$ node --test --test-reporter=tap --test-name-pattern "execCheck reports a malformed Status and a test with a coverage" ../../../build/check.test.js
TAP version 13
# Subtest: execCheck reports a malformed Status and a test with a coverage
ok 1 - execCheck reports a malformed Status and a test with a coverage
  ---
  duration_ms: 34.3253
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 269.8401
```

## T27 Link format

- File: <tests/T27 Link format.md>
- Result: PASS - 2 steps

```text
[step 1] addImplementationLink adds a relative link to the Implementation list
$ node --test --test-reporter=tap --test-name-pattern "addImplementationLink adds a relative link to the Implementation list" ../../../build/edit.test.js
TAP version 13
# Subtest: addImplementationLink adds a relative link to the Implementation list
ok 1 - addImplementationLink adds a relative link to the Implementation list
  ---
  duration_ms: 17.1668
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 217.1722
[step 2] writeStatus adds, replaces and removes the section
$ node --test --test-reporter=tap --test-name-pattern "writeStatus adds, replaces and removes the section" ../../../build/status-section.test.js
TAP version 13
# Subtest: writeStatus adds, replaces and removes the section
ok 1 - writeStatus adds, replaces and removes the section
  ---
  duration_ms: 9.6438
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 206.2355
```

## T28 Markdown post-processing

- File: <tests/T28 Markdown post-processing.md>
- Result: PASS - 3 steps

```text
[step 1] findConfig reads the nearest rq.json of the folder or a parent
$ node --test --test-reporter=tap --test-name-pattern "findConfig reads the nearest rq\\.json of the folder or a parent" ../../../build/post-process.test.js
TAP version 13
# Subtest: findConfig reads the nearest rq.json of the folder or a parent
ok 1 - findConfig reads the nearest rq.json of the folder or a parent
  ---
  duration_ms: 20.3962
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 313.6289
[step 2] postProcess runs the command with the written files that still exist
$ node --test --test-reporter=tap --test-name-pattern "postProcess runs the command with the written files that still exist" ../../../build/post-process.test.js
TAP version 13
# Subtest: postProcess runs the command with the written files that still exist
ok 1 - postProcess runs the command with the written files that still exist
  ---
  duration_ms: 249.361
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 554.2478
[step 3] rq post-processes the markdown files a command wrote
$ node --test --test-reporter=tap --test-name-pattern "rq post-processes the markdown files a command wrote" ../../../build/post-process.test.js
TAP version 13
# Subtest: rq post-processes the markdown files a command wrote
ok 1 - rq post-processes the markdown files a command wrote
  ---
  duration_ms: 237.339
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 525.0249
```
