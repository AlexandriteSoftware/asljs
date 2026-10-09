# E14 rq

- Date: 2026-10-09T15:29:12.863Z
- Command: `rq test .`
- Result: PASS - 29 of 29 tests passed
- Commit: aacb65725ffa6edb536039b75d2bbfa9b278b73c
- Branch: main
- Changed files:
  - `M "apps/rq/dev/rq/tests/T1 Node kinds.md"`
  - `M "apps/rq/dev/rq/tests/T10 Test targets.md"`
  - `M "apps/rq/dev/rq/tests/T11 Execution files.md"`
  - `M "apps/rq/dev/rq/tests/T12 Status recalculation.md"`
  - `M "apps/rq/dev/rq/tests/T13 Manual results.md"`
  - `M "apps/rq/dev/rq/tests/T14 Coverage check.md"`
  - `M "apps/rq/dev/rq/tests/T15 AI agents.md"`
  - `M "apps/rq/dev/rq/tests/T16 Diagram borders.md"`
  - `M "apps/rq/dev/rq/tests/T17 View server.md"`
  - `M "apps/rq/dev/rq/tests/T18 Changing the graph.md"`
  - `M "apps/rq/dev/rq/tests/T19 Querying the graph.md"`
  - `M "apps/rq/dev/rq/tests/T2 Requirement hierarchy.md"`
  - `M "apps/rq/dev/rq/tests/T20 Checking the graph.md"`
  - `M "apps/rq/dev/rq/tests/T21 Working folder.md"`
  - `M "apps/rq/dev/rq/tests/T22 Command line.md"`
  - `M "apps/rq/dev/rq/tests/T23 Command documentation.md"`
  - `M "apps/rq/dev/rq/tests/T24 Edges.md"`
  - `M "apps/rq/dev/rq/tests/T25 Test report.md"`
  - `M "apps/rq/dev/rq/tests/T26 Retention.md"`
  - `M "apps/rq/dev/rq/tests/T27 Link format.md"`
  - `M "apps/rq/dev/rq/tests/T28 Markdown post-processing.md"`
  - `M "apps/rq/dev/rq/tests/T29 Ids and cycles.md"`
  - `M "apps/rq/dev/rq/tests/T3 Tests.md"`
  - `M "apps/rq/dev/rq/tests/T4 Status section.md"`
  - `M "apps/rq/dev/rq/tests/T5 Step types.md"`
  - `M "apps/rq/dev/rq/tests/T6 Shell steps.md"`
  - `M "apps/rq/dev/rq/tests/T7 JavaScript steps.md"`
  - `M "apps/rq/dev/rq/tests/T8 NET steps.md"`
  - `M "apps/rq/dev/rq/tests/T9 Instruction steps.md"`
  - `?? "apps/rq/dev/rq/.rq/E11 T7 T9 T15 T28.md"`
  - `?? "apps/rq/dev/rq/.rq/E12 T9.md"`
  - `?? "apps/rq/dev/rq/.rq/E13 rq.md"`

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
  duration_ms: 6.0876
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
# duration_ms 389.2598
[step 2] rq test returns the verification exit code
$ node --test --test-reporter=tap --test-name-pattern "rq test returns the verification exit code" ../../../build/cli.test.js
TAP version 13
# Subtest: rq test returns the verification exit code
ok 1 - rq test returns the verification exit code
  ---
  duration_ms: 1156.1209
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
# duration_ms 1485.9901
[step 3] rq view rejects an invalid port
$ node --test --test-reporter=tap --test-name-pattern "rq view rejects an invalid port" ../../../build/cli.test.js
TAP version 13
# Subtest: rq view rejects an invalid port
ok 1 - rq view rejects an invalid port
  ---
  duration_ms: 23.5849
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
# duration_ms 391.4146
[step 4] every command returns 1 when it fails
$ node --test --test-reporter=tap --test-name-pattern "every command returns 1 when it fails" ../../../build/cli.test.js
TAP version 13
# Subtest: every command returns 1 when it fails
ok 1 - every command returns 1 when it fails
  ---
  duration_ms: 96.16
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
# duration_ms 430.6661
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
All 15 commands and their options are documented in the package's `docs` pages, so this step passes.

`rq --help` lists `test`, `coverage`, `view`, `check`, `list`, `links`, `backlinks`, `tojson`, `add` (with `requirement` and `test` under it), `link`, `unlink`, `remove`, `move` and `log`. I compared each one's own `--help` with the docs:

- **`rq test.md`** documents `test`: `<targets...>`, `--recurse`, `--name`, `--ai`, `--working-dir`.
- **`rq coverage.md`** documents `coverage`: `<targets...>`, `--recurse`, `--ai`, `--working-dir`.
- **`rq view.md`** documents `view`: `<path>`, `--port`, `--working-dir`.
- **`rq check.md`** documents `check`: `<path>`, `--working-dir`.
- **`Querying the graph.md`** documents:
  - `list`: `--json`, `--working-dir`
  - `links`: `--json`, `--working-dir`
  - `backlinks`: `--json`, `--working-dir`
  - `tojson`: `--working-dir`
- **`Changing the graph.md`** documents:
  - `add requirement`: `<parent> <name>`, `--statement`, `--path`, `--working-dir`
  - `add test`: `<parent> <name>`, `--description`, `--step`, `--path`, `--working-dir`
  - `link`, `unlink`, `move`: `--working-dir`
  - `remove`: `--recursive`, `--working-dir`
  - `log`: `--status`, `--note`, `--time`, `--working-dir`

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
  duration_ms: 51.0716
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
# duration_ms 309.8586
[step 2] parseDocument reads a requirement: title, local links and Implementation links
$ node --test --test-reporter=tap --test-name-pattern "parseDocument reads a requirement: title, local links and Implementation links" ../../../build/document.test.js
TAP version 13
# Subtest: parseDocument reads a requirement: title, local links and Implementation links
ok 1 - parseDocument reads a requirement: title, local links and Implementation links
  ---
  duration_ms: 13.2223
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
# duration_ms 239.5246
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
  duration_ms: 350.1305
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
# duration_ms 613.4231
[step 2] runTest runs every line of every code block of a shell step and records the output
$ node --test --test-reporter=tap --test-name-pattern "runTest runs every line of every code block of a shell step and records the output" ../../../build/run-test.test.js
TAP version 13
# Subtest: runTest runs every line of every code block of a shell step and records the output
ok 1 - runTest runs every line of every code block of a shell step and records the output
  ---
  duration_ms: 341.2667
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
# duration_ms 606.4055
[step 3] splitCommands skips comments and empty lines and joins continued lines
$ node --test --test-reporter=tap --test-name-pattern "splitCommands skips comments and empty lines and joins continued lines" ../../../build/steps.test.js
TAP version 13
# Subtest: splitCommands skips comments and empty lines and joins continued lines
ok 1 - splitCommands skips comments and empty lines and joins continued lines
  ---
  duration_ms: 1.6813
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
# duration_ms 229.3269
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
  duration_ms: 537.0843
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
# duration_ms 797.5938
[step 2] runProgram passes the arguments without a shell
$ node --test --test-reporter=tap --test-name-pattern "runProgram passes the arguments without a shell" ../../../../../libs/mdcli/build/run-command.test.js
TAP version 13
# Subtest: runProgram passes the arguments without a shell
ok 1 - runProgram passes the arguments without a shell
  ---
  duration_ms: 79.5222
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
# duration_ms 171.9043
[step 3] the JavaScript and .NET arguments and their no-test checks
$ node --test --test-reporter=tap --test-name-pattern "the JavaScript and \\.NET arguments and their no-test checks" ../../../build/run-test.test.js
TAP version 13
# Subtest: the JavaScript and .NET arguments and their no-test checks
ok 1 - the JavaScript and .NET arguments and their no-test checks
  ---
  duration_ms: 1.7079
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
# duration_ms 258.5507
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
  duration_ms: 448.8609
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
# duration_ms 712.3024
[step 2] checkCoverage prompt names the requirement and its links
$ node --test --test-reporter=tap --test-name-pattern "checkCoverage prompt names the requirement and its links" ../../../build/coverage.test.js
TAP version 13
# Subtest: checkCoverage prompt names the requirement and its links
ok 1 - checkCoverage prompt names the requirement and its links
  ---
  duration_ms: 161.663
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
# duration_ms 418.6426
[step 3] execCoverage records the verdict of each selected requirement in its Status
$ node --test --test-reporter=tap --test-name-pattern "execCoverage records the verdict of each selected requirement in its Status" ../../../build/coverage.test.js
TAP version 13
# Subtest: execCoverage records the verdict of each selected requirement in its Status
ok 1 - execCoverage records the verdict of each selected requirement in its Status
  ---
  duration_ms: 490.4809
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
# duration_ms 759.6182
[step 4] execCoverage writes the analysis to the Coverage section, before the Status
$ node --test --test-reporter=tap --test-name-pattern "execCoverage writes the analysis to the Coverage section, before the Status" ../../../build/coverage.test.js
TAP version 13
# Subtest: execCoverage writes the analysis to the Coverage section, before the Status
ok 1 - execCoverage writes the analysis to the Coverage section, before the Status
  ---
  duration_ms: 283.372
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
# duration_ms 557.9061
[step 5] writeCoverageSection adds the section before the Status, or replaces it
$ node --test --test-reporter=tap --test-name-pattern "writeCoverageSection adds the section before the Status, or replaces it" ../../../build/coverage-section.test.js
TAP version 13
# Subtest: writeCoverageSection adds the section before the Status, or replaces it
ok 1 - writeCoverageSection adds the section before the Status, or replaces it
  ---
  duration_ms: 14.8174
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
# duration_ms 230.3625
[step 6] execTest writes the status of each test and of the requirements above it
$ node --test --test-reporter=tap --test-name-pattern "execTest writes the status of each test and of the requirements above it" ../../../build/test.test.js
TAP version 13
# Subtest: execTest writes the status of each test and of the requirements above it
ok 1 - execTest writes the status of each test and of the requirements above it
  ---
  duration_ms: 530.8964
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
# duration_ms 799.1872
```

## T15 AI agents

- File: <tests/T15 AI agents.md>
- Result: PASS - 4 steps

```text
[step 1] parseAgentSpec reads an optional agent and model
$ node --test --test-reporter=tap --test-name-pattern "parseAgentSpec reads an optional agent and model" ../../../../../libs/mdcli/build/agent.test.js
TAP version 13
# Subtest: parseAgentSpec reads an optional agent and model
ok 1 - parseAgentSpec reads an optional agent and model
  ---
  duration_ms: 2.2783
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
# duration_ms 133.6132
[step 2] getAgentCommand prefers the override, then the named agent, then the detected one
$ node --test --test-reporter=tap --test-name-pattern "getAgentCommand prefers the override, then the named agent, then the detected one" ../../../../../libs/mdcli/build/agent.test.js
TAP version 13
# Subtest: getAgentCommand prefers the override, then the named agent, then the detected one
ok 1 - getAgentCommand prefers the override, then the named agent, then the detected one
  ---
  duration_ms: 1.067
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
# duration_ms 128.8441
[step 3] askAgent reads the verdict from the last JSON line
$ node --test --test-reporter=tap --test-name-pattern "askAgent reads the verdict from the last JSON line" ../../../../../libs/mdcli/build/agent.test.js
TAP version 13
# Subtest: askAgent reads the verdict from the last JSON line
ok 1 - askAgent reads the verdict from the last JSON line
  ---
  duration_ms: 508.7271
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
# duration_ms 638.2489
[step 4] detectAgent picks the first agent whose command runs, claude before copilot
$ node --test --test-reporter=tap --test-name-pattern "detectAgent picks the first agent whose command runs, claude before copilot" ../../../../../libs/mdcli/build/agent.test.js
TAP version 13
# Subtest: detectAgent picks the first agent whose command runs, claude before copilot
ok 1 - detectAgent picks the first agent whose command runs, claude before copilot
  ---
  duration_ms: 1.9417
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
# duration_ms 136.5934
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
  duration_ms: 23.0628
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
# duration_ms 298.2555
[step 2] rq add, links, backlinks, log and check forward their options
$ node --test --test-reporter=tap --test-name-pattern "rq add, links, backlinks, log and check forward their options" ../../../build/cli.test.js
TAP version 13
# Subtest: rq add, links, backlinks, log and check forward their options
ok 1 - rq add, links, backlinks, log and check forward their options
  ---
  duration_ms: 254.9348
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
# duration_ms 564.5843
[step 3] every command works in --working-dir and takes ids and .md names
$ node --test --test-reporter=tap --test-name-pattern "every command works in --working-dir and takes ids and \\.md names" ../../../build/cli.test.js
TAP version 13
# Subtest: every command works in --working-dir and takes ids and .md names
ok 1 - every command works in --working-dir and takes ids and .md names
  ---
  duration_ms: 710.3914
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
# duration_ms 1012.6037
[step 4] execView takes an id in the working folder and reads the recorded statuses
$ node --test --test-reporter=tap --test-name-pattern "execView takes an id in the working folder and reads the recorded statuses" ../../../build/view.test.js
TAP version 13
# Subtest: execView takes an id in the working folder and reads the recorded statuses
ok 1 - execView takes an id in the working folder and reads the recorded statuses
  ---
  duration_ms: 89.6382
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
# duration_ms 375.0129
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
  duration_ms: 1.1723
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
# duration_ms 282.4649
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
  duration_ms: 76.7587
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
# duration_ms 357.6656
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
  duration_ms: 38.2933
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
# duration_ms 315.8933
[step 2] loadGraph reports broken links, cycles and unreachable documents
$ node --test --test-reporter=tap --test-name-pattern "loadGraph reports broken links, cycles and unreachable documents" ../../../build/graph.test.js
TAP version 13
# Subtest: loadGraph reports broken links, cycles and unreachable documents
ok 1 - loadGraph reports broken links, cycles and unreachable documents
  ---
  duration_ms: 78.1233
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
# duration_ms 356.0794
[step 3] execLink links an existing node and refuses duplicates, cycles and a second parent
$ node --test --test-reporter=tap --test-name-pattern "execLink links an existing node and refuses duplicates, cycles and a second parent" ../../../build/change.test.js
TAP version 13
# Subtest: execLink links an existing node and refuses duplicates, cycles and a second parent
ok 1 - execLink links an existing node and refuses duplicates, cycles and a second parent
  ---
  duration_ms: 175.0862
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
# duration_ms 468.5879
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
  duration_ms: 64.339
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
# duration_ms 342.9054
[step 2] loadGraph follows only Implementation links to requirements and tests
$ node --test --test-reporter=tap --test-name-pattern "loadGraph follows only Implementation links to requirements and tests" ../../../build/graph.test.js
TAP version 13
# Subtest: loadGraph follows only Implementation links to requirements and tests
ok 1 - loadGraph follows only Implementation links to requirements and tests
  ---
  duration_ms: 51.6496
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
# duration_ms 326.2129
[step 3] loadGraph makes no edges from the links of a test
$ node --test --test-reporter=tap --test-name-pattern "loadGraph makes no edges from the links of a test" ../../../build/graph.test.js
TAP version 13
# Subtest: loadGraph makes no edges from the links of a test
ok 1 - loadGraph makes no edges from the links of a test
  ---
  duration_ms: 57.2819
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
# duration_ms 334.375
[step 4] execCheck reports problems of the graph and of each document
$ node --test --test-reporter=tap --test-name-pattern "execCheck reports problems of the graph and of each document" ../../../build/check.test.js
TAP version 13
# Subtest: execCheck reports problems of the graph and of each document
ok 1 - execCheck reports problems of the graph and of each document
  ---
  duration_ms: 62.9192
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
# duration_ms 343.8946
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
  duration_ms: 12.4388
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
# duration_ms 263.2845
[step 2] writeStatus adds, replaces and removes the section
$ node --test --test-reporter=tap --test-name-pattern "writeStatus adds, replaces and removes the section" ../../../build/status-section.test.js
TAP version 13
# Subtest: writeStatus adds, replaces and removes the section
ok 1 - writeStatus adds, replaces and removes the section
  ---
  duration_ms: 9.7725
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
# duration_ms 248.3823
[step 3] writeStatus keeps the content of the section it does not own
$ node --test --test-reporter=tap --test-name-pattern "writeStatus keeps the content of the section it does not own" ../../../build/status-section.test.js
TAP version 13
# Subtest: writeStatus keeps the content of the section it does not own
ok 1 - writeStatus keeps the content of the section it does not own
  ---
  duration_ms: 13.1408
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
# duration_ms 253.2748
[step 4] execCheck reports a malformed Status and a test with a coverage
$ node --test --test-reporter=tap --test-name-pattern "execCheck reports a malformed Status and a test with a coverage" ../../../build/check.test.js
TAP version 13
# Subtest: execCheck reports a malformed Status and a test with a coverage
ok 1 - execCheck reports a malformed Status and a test with a coverage
  ---
  duration_ms: 39.7947
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
# duration_ms 318.6341
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
  duration_ms: 14.0674
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
# duration_ms 253.7334
[step 2] parseSteps reports what is wrong with the steps
$ node --test --test-reporter=tap --test-name-pattern "parseSteps reports what is wrong with the steps" ../../../build/steps.test.js
TAP version 13
# Subtest: parseSteps reports what is wrong with the steps
ok 1 - parseSteps reports what is wrong with the steps
  ---
  duration_ms: 11.5892
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
# duration_ms 245.8184
[step 3] parseDocument reads the steps of a test
$ node --test --test-reporter=tap --test-name-pattern "parseDocument reads the steps of a test" ../../../build/document.test.js
TAP version 13
# Subtest: parseDocument reads the steps of a test
ok 1 - parseDocument reads the steps of a test
  ---
  duration_ms: 8.7634
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
# duration_ms 245.2671
[step 4] execCheck reports problems of the graph and of each document
$ node --test --test-reporter=tap --test-name-pattern "execCheck reports problems of the graph and of each document" ../../../build/check.test.js
TAP version 13
# Subtest: execCheck reports problems of the graph and of each document
ok 1 - execCheck reports problems of the graph and of each document
  ---
  duration_ms: 73.7113
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
# duration_ms 353.6512
[step 5] runTest fails a test with a malformed step without running any step
$ node --test --test-reporter=tap --test-name-pattern "runTest fails a test with a malformed step without running any step" ../../../build/run-test.test.js
TAP version 13
# Subtest: runTest fails a test with a malformed step without running any step
ok 1 - runTest fails a test with a malformed step without running any step
  ---
  duration_ms: 20.2208
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
# duration_ms 302.819
```

## T8 NET steps

- File: <tests/T8 NET steps.md>
- Result: PASS - 3 steps

```text
[step 1] runTest runs dotnet test with the project and the filter
$ node --test --test-reporter=tap --test-name-pattern "runTest runs dotnet test with the project and the filter" ../../../build/run-test.test.js
TAP version 13
# Subtest: runTest runs dotnet test with the project and the filter
ok 1 - runTest runs dotnet test with the project and the filter
  ---
  duration_ms: 366.3859
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
# duration_ms 649.555
[step 2] runTest fails a .NET step that exits with 0 but runs no test
$ node --test --test-reporter=tap --test-name-pattern "runTest fails a \\.NET step that exits with 0 but runs no test" ../../../build/run-test.test.js
TAP version 13
# Subtest: runTest fails a .NET step that exits with 0 but runs no test
ok 1 - runTest fails a .NET step that exits with 0 but runs no test
  ---
  duration_ms: 18.7723
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
# duration_ms 326.1677
[step 3] the JavaScript and .NET arguments and their no-test checks
$ node --test --test-reporter=tap --test-name-pattern "the JavaScript and \\.NET arguments and their no-test checks" ../../../build/run-test.test.js
TAP version 13
# Subtest: the JavaScript and .NET arguments and their no-test checks
ok 1 - the JavaScript and .NET arguments and their no-test checks
  ---
  duration_ms: 1.9443
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
# duration_ms 286.5262
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
  duration_ms: 251.5309
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
# duration_ms 527.9751
[step 2] getAgentCommand lets an agent read and run commands in run mode, and also edit in edit mode
$ node --test --test-reporter=tap --test-name-pattern "getAgentCommand lets an agent read and run commands in run mode, and also edit in edit mode" ../../../../../libs/mdcli/build/agent.test.js
TAP version 13
# Subtest: getAgentCommand lets an agent read and run commands in run mode, and also edit in edit mode
ok 1 - getAgentCommand lets an agent read and run commands in run mode, and also edit in edit mode
  ---
  duration_ms: 1.0796
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
# duration_ms 138.9967
```

## T10 Test targets

- File: <tests/T10 Test targets.md>
- Result: PASS - 4 steps

```text
[step 1] execTest takes several paths, names and ids, and runs each test once
$ node --test --test-reporter=tap --test-name-pattern "execTest takes several paths, names and ids, and runs each test once" ../../../build/test.test.js
TAP version 13
# Subtest: execTest takes several paths, names and ids, and runs each test once
ok 1 - execTest takes several paths, names and ids, and runs each test once
  ---
  duration_ms: 763.786
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
# duration_ms 1045.0504
[step 2] execTest of a requirement runs its own tests, and with recurse everything below it
$ node --test --test-reporter=tap --test-name-pattern "execTest of a requirement runs its own tests, and with recurse everything below it" ../../../build/test.test.js
TAP version 13
# Subtest: execTest of a requirement runs its own tests, and with recurse everything below it
ok 1 - execTest of a requirement runs its own tests, and with recurse everything below it
  ---
  duration_ms: 650.2429
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
# duration_ms 938.96
[step 3] execTest takes a requirement or test file by its path
$ node --test --test-reporter=tap --test-name-pattern "execTest takes a requirement or test file by its path" ../../../build/test.test.js
TAP version 13
# Subtest: execTest takes a requirement or test file by its path
ok 1 - execTest takes a requirement or test file by its path
  ---
  duration_ms: 406.2765
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
# duration_ms 696.1128
[step 4] selectTargets selects a target, its direct tests, or everything below it
$ node --test --test-reporter=tap --test-name-pattern "selectTargets selects a target, its direct tests, or everything below it" ../../../build/targets.test.js
TAP version 13
# Subtest: selectTargets selects a target, its direct tests, or everything below it
ok 1 - selectTargets selects a target, its direct tests, or everything below it
  ---
  duration_ms: 78.7104
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
# duration_ms 359.0416
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
  duration_ms: 2.9338
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
# duration_ms 285.6828
[step 2] writeExecution numbers the files and loadResults keeps the latest result of each test
$ node --test --test-reporter=tap --test-name-pattern "writeExecution numbers the files and loadResults keeps the latest result of each test" ../../../build/results.test.js
TAP version 13
# Subtest: writeExecution numbers the files and loadResults keeps the latest result of each test
ok 1 - writeExecution numbers the files and loadResults keeps the latest result of each test
  ---
  duration_ms: 46.7035
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
# duration_ms 323.7845
[step 3] parseExecution reads the result of each test section
$ node --test --test-reporter=tap --test-name-pattern "parseExecution reads the result of each test section" ../../../build/results.test.js
TAP version 13
# Subtest: parseExecution reads the result of each test section
ok 1 - parseExecution reads the result of each test section
  ---
  duration_ms: 10.8982
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
# duration_ms 293.8055
[step 4] readWorkingTree reads the commit, the branch and the changed files
$ node --test --test-reporter=tap --test-name-pattern "readWorkingTree reads the commit, the branch and the changed files" ../../../build/results.test.js
TAP version 13
# Subtest: readWorkingTree reads the commit, the branch and the changed files
ok 1 - readWorkingTree reads the commit, the branch and the changed files
  ---
  duration_ms: 538.507
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
# duration_ms 813.6012
[step 5] loadResults prefers a later date, and writeExecution never reuses a number
$ node --test --test-reporter=tap --test-name-pattern "loadResults prefers a later date, and writeExecution never reuses a number" ../../../build/results.test.js
TAP version 13
# Subtest: loadResults prefers a later date, and writeExecution never reuses a number
ok 1 - loadResults prefers a later date, and writeExecution never reuses a number
  ---
  duration_ms: 38.0797
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
# duration_ms 322.0013
[step 6] execTest of a folder runs every test, records them, and reports the latest status
$ node --test --test-reporter=tap --test-name-pattern "execTest of a folder runs every test, records them, and reports the latest status" ../../../build/test.test.js
TAP version 13
# Subtest: execTest of a folder runs every test, records them, and reports the latest status
ok 1 - execTest of a folder runs every test, records them, and reports the latest status
  ---
  duration_ms: 400.5649
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
# duration_ms 697.1011
```

## T12 Status recalculation

- File: <tests/T12 Status recalculation.md>
- Result: PASS - 7 steps

```text
[step 1] getStatuses passes a requirement only when everything below it passes
$ node --test --test-reporter=tap --test-name-pattern "getStatuses passes a requirement only when everything below it passes" ../../../build/status.test.js
TAP version 13
# Subtest: getStatuses passes a requirement only when everything below it passes
ok 1 - getStatuses passes a requirement only when everything below it passes
  ---
  duration_ms: 54.5226
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
# duration_ms 330.6179
[step 2] getStatuses fails a requirement with no links and one in a cycle
$ node --test --test-reporter=tap --test-name-pattern "getStatuses fails a requirement with no links and one in a cycle" ../../../build/status.test.js
TAP version 13
# Subtest: getStatuses fails a requirement with no links and one in a cycle
ok 1 - getStatuses fails a requirement with no links and one in a cycle
  ---
  duration_ms: 31.5642
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
# duration_ms 310.5433
[step 3] getStatuses takes the recorded results, and recalculates only what it is asked to
$ node --test --test-reporter=tap --test-name-pattern "getStatuses takes the recorded results, and recalculates only what it is asked to" ../../../build/status.test.js
TAP version 13
# Subtest: getStatuses takes the recorded results, and recalculates only what it is asked to
ok 1 - getStatuses takes the recorded results, and recalculates only what it is asked to
  ---
  duration_ms: 57.4281
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
# duration_ms 339.6386
[step 4] execTest writes the status of each test and of the requirements above it
$ node --test --test-reporter=tap --test-name-pattern "execTest writes the status of each test and of the requirements above it" ../../../build/test.test.js
TAP version 13
# Subtest: execTest writes the status of each test and of the requirements above it
ok 1 - execTest writes the status of each test and of the requirements above it
  ---
  duration_ms: 591.53
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
# duration_ms 887.5659
[step 5] execTest merges the tests it ran with the recorded statuses, without reading .rq
$ node --test --test-reporter=tap --test-name-pattern "execTest merges the tests it ran with the recorded statuses, without reading \\.rq" ../../../build/test.test.js
TAP version 13
# Subtest: execTest merges the tests it ran with the recorded statuses, without reading .rq
ok 1 - execTest merges the tests it ran with the recorded statuses, without reading .rq
  ---
  duration_ms: 317.4333
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
# duration_ms 644.3419
[step 6] execUnlink takes ids, execMove retitles reference links, and both refresh statuses
$ node --test --test-reporter=tap --test-name-pattern "execUnlink takes ids, execMove retitles reference links, and both refresh statuses" ../../../build/change.test.js
TAP version 13
# Subtest: execUnlink takes ids, execMove retitles reference links, and both refresh statuses
ok 1 - execUnlink takes ids, execMove retitles reference links, and both refresh statuses
  ---
  duration_ms: 223.9423
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
# duration_ms 520.1324
[step 7] execAdd, execLink, execRemove and execMove refresh the statuses they make stale
$ node --test --test-reporter=tap --test-name-pattern "execAdd, execLink, execRemove and execMove refresh the statuses they make stale" ../../../build/change.test.js
TAP version 13
# Subtest: execAdd, execLink, execRemove and execMove refresh the statuses they make stale
ok 1 - execAdd, execLink, execRemove and execMove refresh the statuses they make stale
  ---
  duration_ms: 263.5339
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
# duration_ms 565.6183
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
  duration_ms: 137.9072
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
# duration_ms 449.7982
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
  duration_ms: 452.4742
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
# duration_ms 768.2589
[step 2] execTest reports structure errors and requirements with no links
$ node --test --test-reporter=tap --test-name-pattern "execTest reports structure errors and requirements with no links" ../../../build/test.test.js
TAP version 13
# Subtest: execTest reports structure errors and requirements with no links
ok 1 - execTest reports structure errors and requirements with no links
  ---
  duration_ms: 33.941
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
# duration_ms 328.6339
[step 3] execTest and execLog remove the oldest execution files beyond the retention
$ node --test --test-reporter=tap --test-name-pattern "execTest and execLog remove the oldest execution files beyond the retention" ../../../build/test.test.js
TAP version 13
# Subtest: execTest and execLog remove the oldest execution files beyond the retention
ok 1 - execTest and execLog remove the oldest execution files beyond the retention
  ---
  duration_ms: 475.2177
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
# duration_ms 762.2219
[step 4] execTest of a requirement runs its own tests, and with recurse everything below it
$ node --test --test-reporter=tap --test-name-pattern "execTest of a requirement runs its own tests, and with recurse everything below it" ../../../build/test.test.js
TAP version 13
# Subtest: execTest of a requirement runs its own tests, and with recurse everything below it
ok 1 - execTest of a requirement runs its own tests, and with recurse everything below it
  ---
  duration_ms: 675.3251
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
# duration_ms 959.185
[step 5] execTest merges the tests it ran with the recorded statuses, without reading .rq
$ node --test --test-reporter=tap --test-name-pattern "execTest merges the tests it ran with the recorded statuses, without reading \\.rq" ../../../build/test.test.js
TAP version 13
# Subtest: execTest merges the tests it ran with the recorded statuses, without reading .rq
ok 1 - execTest merges the tests it ran with the recorded statuses, without reading .rq
  ---
  duration_ms: 315.1848
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
# duration_ms 609.9784
[step 6] execTest exits with 1 on a structure error even when every node passes
$ node --test --test-reporter=tap --test-name-pattern "execTest exits with 1 on a structure error even when every node passes" ../../../build/test.test.js
TAP version 13
# Subtest: execTest exits with 1 on a structure error even when every node passes
ok 1 - execTest exits with 1 on a structure error even when every node passes
  ---
  duration_ms: 170.4312
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
# duration_ms 461.0672
[step 7] rq test returns the verification exit code
$ node --test --test-reporter=tap --test-name-pattern "rq test returns the verification exit code" ../../../build/cli.test.js
TAP version 13
# Subtest: rq test returns the verification exit code
ok 1 - rq test returns the verification exit code
  ---
  duration_ms: 965.1505
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
# duration_ms 1271.2001
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
  duration_ms: 61.3574
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
# duration_ms 356.3359
[step 2] pruneExecutions keeps 300 files and 50 MB by default, and removes by size
$ node --test --test-reporter=tap --test-name-pattern "pruneExecutions keeps 300 files and 50 MB by default, and removes by size" ../../../build/results.test.js
TAP version 13
# Subtest: pruneExecutions keeps 300 files and 50 MB by default, and removes by size
ok 1 - pruneExecutions keeps 300 files and 50 MB by default, and removes by size
  ---
  duration_ms: 48.7314
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
# duration_ms 341.2864
[step 3] pruneExecutions does not keep the results of tests that no longer exist
$ node --test --test-reporter=tap --test-name-pattern "pruneExecutions does not keep the results of tests that no longer exist" ../../../build/results.test.js
TAP version 13
# Subtest: pruneExecutions does not keep the results of tests that no longer exist
ok 1 - pruneExecutions does not keep the results of tests that no longer exist
  ---
  duration_ms: 23.9846
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
# duration_ms 323.8076
[step 4] execTest and execLog remove the oldest execution files beyond the retention
$ node --test --test-reporter=tap --test-name-pattern "execTest and execLog remove the oldest execution files beyond the retention" ../../../build/test.test.js
TAP version 13
# Subtest: execTest and execLog remove the oldest execution files beyond the retention
ok 1 - execTest and execLog remove the oldest execution files beyond the retention
  ---
  duration_ms: 469.1528
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
# duration_ms 756.4671
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
  duration_ms: 52.4643
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
# duration_ms 333.8579
[step 2] getAppearance colours by result and styles a requirement by its coverage
$ node --test --test-reporter=tap --test-name-pattern "getAppearance colours by result and styles a requirement by its coverage" ../../../build/mermaid.test.js
TAP version 13
# Subtest: getAppearance colours by result and styles a requirement by its coverage
ok 1 - getAppearance colours by result and styles a requirement by its coverage
  ---
  duration_ms: 55.5587
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
# duration_ms 346.3108
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
  duration_ms: 178.3192
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
# duration_ms 461.7514
[step 2] execView of a file serves its folder and shows its problems
$ node --test --test-reporter=tap --test-name-pattern "execView of a file serves its folder and shows its problems" ../../../build/view.test.js
TAP version 13
# Subtest: execView of a file serves its folder and shows its problems
ok 1 - execView of a file serves its folder and shows its problems
  ---
  duration_ms: 80.2439
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
# duration_ms 366.7537
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
  duration_ms: 103.836
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
# duration_ms 395.5457
[step 2] execAdd creates a test with steps in the tests folder
$ node --test --test-reporter=tap --test-name-pattern "execAdd creates a test with steps in the tests folder" ../../../build/change.test.js
TAP version 13
# Subtest: execAdd creates a test with steps in the tests folder
ok 1 - execAdd creates a test with steps in the tests folder
  ---
  duration_ms: 144.445
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
# duration_ms 432.5404
[step 3] execAdd refuses a test parent, a bad name and an existing file
$ node --test --test-reporter=tap --test-name-pattern "execAdd refuses a test parent, a bad name and an existing file" ../../../build/change.test.js
TAP version 13
# Subtest: execAdd refuses a test parent, a bad name and an existing file
ok 1 - execAdd refuses a test parent, a bad name and an existing file
  ---
  duration_ms: 43.3087
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
# duration_ms 331.8372
[step 4] execLink links an existing node and refuses duplicates, cycles and a second parent
$ node --test --test-reporter=tap --test-name-pattern "execLink links an existing node and refuses duplicates, cycles and a second parent" ../../../build/change.test.js
TAP version 13
# Subtest: execLink links an existing node and refuses duplicates, cycles and a second parent
ok 1 - execLink links an existing node and refuses duplicates, cycles and a second parent
  ---
  duration_ms: 174.1376
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
# duration_ms 456.7944
[step 5] execUnlink removes every link to the child
$ node --test --test-reporter=tap --test-name-pattern "execUnlink removes every link to the child" ../../../build/change.test.js
TAP version 13
# Subtest: execUnlink removes every link to the child
ok 1 - execUnlink removes every link to the child
  ---
  duration_ms: 71.0197
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
# duration_ms 366.283
[step 6] execRemove deletes a leaf and the links to it
$ node --test --test-reporter=tap --test-name-pattern "execRemove deletes a leaf and the links to it" ../../../build/change.test.js
TAP version 13
# Subtest: execRemove deletes a leaf and the links to it
ok 1 - execRemove deletes a leaf and the links to it
  ---
  duration_ms: 68.9489
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
# duration_ms 358.7365
[step 7] execRemove --recursive deletes what only removed documents link to
$ node --test --test-reporter=tap --test-name-pattern "execRemove --recursive deletes what only removed documents link to" ../../../build/change.test.js
TAP version 13
# Subtest: execRemove --recursive deletes what only removed documents link to
ok 1 - execRemove --recursive deletes what only removed documents link to
  ---
  duration_ms: 105.8969
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
# duration_ms 394.1499
[step 8] execMove renames a document and rewrites the links to it
$ node --test --test-reporter=tap --test-name-pattern "execMove renames a document and rewrites the links to it" ../../../build/change.test.js
TAP version 13
# Subtest: execMove renames a document and rewrites the links to it
ok 1 - execMove renames a document and rewrites the links to it
  ---
  duration_ms: 182.1969
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
# duration_ms 513.9669
[step 9] execUnlink takes ids, execMove retitles reference links, and both refresh statuses
$ node --test --test-reporter=tap --test-name-pattern "execUnlink takes ids, execMove retitles reference links, and both refresh statuses" ../../../build/change.test.js
TAP version 13
# Subtest: execUnlink takes ids, execMove retitles reference links, and both refresh statuses
ok 1 - execUnlink takes ids, execMove retitles reference links, and both refresh statuses
  ---
  duration_ms: 236.2965
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
# duration_ms 594.1064
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
  duration_ms: 65.4283
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
# duration_ms 416.3442
[step 2] execLinks prints what a requirement links to, missing and other files included
$ node --test --test-reporter=tap --test-name-pattern "execLinks prints what a requirement links to, missing and other files included" ../../../build/query.test.js
TAP version 13
# Subtest: execLinks prints what a requirement links to, missing and other files included
ok 1 - execLinks prints what a requirement links to, missing and other files included
  ---
  duration_ms: 53.0202
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
# duration_ms 392.1155
[step 3] execBacklinks prints the requirements that link to a document
$ node --test --test-reporter=tap --test-name-pattern "execBacklinks prints the requirements that link to a document" ../../../build/query.test.js
TAP version 13
# Subtest: execBacklinks prints the requirements that link to a document
ok 1 - execBacklinks prints the requirements that link to a document
  ---
  duration_ms: 71.0896
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
# duration_ms 414.4988
[step 4] execToJson prints the graph with the structural fields
$ node --test --test-reporter=tap --test-name-pattern "execToJson prints the graph with the structural fields" ../../../build/query.test.js
TAP version 13
# Subtest: execToJson prints the graph with the structural fields
ok 1 - execToJson prints the graph with the structural fields
  ---
  duration_ms: 61.9862
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
# duration_ms 402.7713
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
  duration_ms: 70.4505
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
# duration_ms 398.7518
[step 2] execCheck reports problems of the graph and of each document
$ node --test --test-reporter=tap --test-name-pattern "execCheck reports problems of the graph and of each document" ../../../build/check.test.js
TAP version 13
# Subtest: execCheck reports problems of the graph and of each document
ok 1 - execCheck reports problems of the graph and of each document
  ---
  duration_ms: 62.4523
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
# duration_ms 388.5101
[step 3] execCheck reports a malformed Status and a test with a coverage
$ node --test --test-reporter=tap --test-name-pattern "execCheck reports a malformed Status and a test with a coverage" ../../../build/check.test.js
TAP version 13
# Subtest: execCheck reports a malformed Status and a test with a coverage
ok 1 - execCheck reports a malformed Status and a test with a coverage
  ---
  duration_ms: 41.0654
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
# duration_ms 332.4086
```

## T27 Link format

- File: <tests/T27 Link format.md>
- Result: PASS - 4 steps

```text
[step 1] addImplementationLink adds a relative link to the Implementation list
$ node --test --test-reporter=tap --test-name-pattern "addImplementationLink adds a relative link to the Implementation list" ../../../build/edit.test.js
TAP version 13
# Subtest: addImplementationLink adds a relative link to the Implementation list
ok 1 - addImplementationLink adds a relative link to the Implementation list
  ---
  duration_ms: 19.6061
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
# duration_ms 282.2372
[step 2] writeStatus adds, replaces and removes the section
$ node --test --test-reporter=tap --test-name-pattern "writeStatus adds, replaces and removes the section" ../../../build/status-section.test.js
TAP version 13
# Subtest: writeStatus adds, replaces and removes the section
ok 1 - writeStatus adds, replaces and removes the section
  ---
  duration_ms: 10.2212
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
# duration_ms 252.7716
[step 3] writeStatus labels the execution link with the execution id, numbered when taken
$ node --test --test-reporter=tap --test-name-pattern "writeStatus labels the execution link with the execution id, numbered when taken" ../../../build/status-section.test.js
TAP version 13
# Subtest: writeStatus labels the execution link with the execution id, numbered when taken
ok 1 - writeStatus labels the execution link with the execution id, numbered when taken
  ---
  duration_ms: 9.6741
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
# duration_ms 257.8105
[step 4] execTest writes the status of each test and of the requirements above it
$ node --test --test-reporter=tap --test-name-pattern "execTest writes the status of each test and of the requirements above it" ../../../build/test.test.js
TAP version 13
# Subtest: execTest writes the status of each test and of the requirements above it
ok 1 - execTest writes the status of each test and of the requirements above it
  ---
  duration_ms: 535.5294
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
# duration_ms 826.0764
```

## T28 Markdown post-processing

- File: <tests/T28 Markdown post-processing.md>
- Result: PASS - 3 steps

```text
[step 1] findConfig reads the nearest rq.json of the folder or a parent
$ node --test --test-reporter=tap --test-name-pattern "findConfig reads the nearest rq\\.json of the folder or a parent" ../../../../../libs/mdcli/build/post-process.test.js
TAP version 13
# Subtest: findConfig reads the nearest rq.json of the folder or a parent
ok 1 - findConfig reads the nearest rq.json of the folder or a parent
  ---
  duration_ms: 22.3545
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
# duration_ms 163.3363
[step 2] postProcess runs the command with the written files that still exist
$ node --test --test-reporter=tap --test-name-pattern "postProcess runs the command with the written files that still exist" ../../../../../libs/mdcli/build/post-process.test.js
TAP version 13
# Subtest: postProcess runs the command with the written files that still exist
ok 1 - postProcess runs the command with the written files that still exist
  ---
  duration_ms: 260.8948
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
# duration_ms 397.6696
[step 3] rq post-processes the markdown files a command wrote
$ node --test --test-reporter=tap --test-name-pattern "rq post-processes the markdown files a command wrote" ../../../build/cli.test.js
TAP version 13
# Subtest: rq post-processes the markdown files a command wrote
ok 1 - rq post-processes the markdown files a command wrote
  ---
  duration_ms: 389.7063
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
# duration_ms 688.6458
```
