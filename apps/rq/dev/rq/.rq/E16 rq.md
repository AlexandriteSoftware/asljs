# E16 rq

- Date: 2026-10-09T15:55:38.227Z
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
  - `?? "apps/rq/dev/rq/.rq/E14 rq.md"`
  - `?? "apps/rq/dev/rq/.rq/E15 T14 Coverage check.md"`

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
  duration_ms: 5.8046
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
# duration_ms 365.0068
[step 2] rq test returns the verification exit code
$ node --test --test-reporter=tap --test-name-pattern "rq test returns the verification exit code" ../../../build/cli.test.js
TAP version 13
# Subtest: rq test returns the verification exit code
ok 1 - rq test returns the verification exit code
  ---
  duration_ms: 1059.6617
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
# duration_ms 1388.2805
[step 3] rq view rejects an invalid port
$ node --test --test-reporter=tap --test-name-pattern "rq view rejects an invalid port" ../../../build/cli.test.js
TAP version 13
# Subtest: rq view rejects an invalid port
ok 1 - rq view rejects an invalid port
  ---
  duration_ms: 22.658
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
# duration_ms 394.7905
[step 4] every command returns 1 when it fails
$ node --test --test-reporter=tap --test-name-pattern "every command returns 1 when it fails" ../../../build/cli.test.js
TAP version 13
# Subtest: every command returns 1 when it fails
ok 1 - every command returns 1 when it fails
  ---
  duration_ms: 91.9854
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
# duration_ms 410.4762
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
The step passed. `node ../../../bin/rq.js` lists 14 commands: `test`, `coverage`, `view`, `check`, `list`, `links`, `backlinks`, `tojson`, `add`, `link`, `unlink`, `remove`, `move` and `log`. `add` has two subcommands, `add requirement` and `add test`. Each command's `--help` options and arguments are described in one of the docs pages:

- **`Querying the graph.md`**: `list`, `links`, `backlinks` and `tojson`, with their arguments, `--json` (not on `tojson`) and `--working-dir`.
- **`Changing the graph.md`**:
  - `add requirement`: `--statement`, `--path`
  - `add test`: `--description`, `--step`, `--path`
  - `link` and `unlink`
  - `remove`: `--recursive`
  - `move`
  - `log`: `--status`, `--note`, `--time`
  - all of them: `--working-dir`
- **`rq check.md`**: `check <path>` and `--working-dir`.
- **`rq test.md`**: `test <target>...`, `--recurse`, `--name`, `--ai` and `--working-dir`.
- **`rq coverage.md`**: `coverage <target>...`, `--recurse`, `--ai` and `--working-dir`.
- **`rq view.md`**: `view <path>`, `--port` and `--working-dir`.

One small difference doesn't affect the result: `rq links` help names its argument `<file>`, while the docs call it `<requirement>`. Both mean the same argument.

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
  duration_ms: 63.5862
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
# duration_ms 330.9871
[step 2] parseDocument reads a requirement: title, local links and Implementation links
$ node --test --test-reporter=tap --test-name-pattern "parseDocument reads a requirement: title, local links and Implementation links" ../../../build/document.test.js
TAP version 13
# Subtest: parseDocument reads a requirement: title, local links and Implementation links
ok 1 - parseDocument reads a requirement: title, local links and Implementation links
  ---
  duration_ms: 12.8517
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
# duration_ms 242.5176
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
  duration_ms: 361.8592
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
# duration_ms 629.3789
[step 2] runTest runs every line of every code block of a shell step and records the output
$ node --test --test-reporter=tap --test-name-pattern "runTest runs every line of every code block of a shell step and records the output" ../../../build/run-test.test.js
TAP version 13
# Subtest: runTest runs every line of every code block of a shell step and records the output
ok 1 - runTest runs every line of every code block of a shell step and records the output
  ---
  duration_ms: 322.2312
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
# duration_ms 583.5322
[step 3] splitCommands skips comments and empty lines and joins continued lines
$ node --test --test-reporter=tap --test-name-pattern "splitCommands skips comments and empty lines and joins continued lines" ../../../build/steps.test.js
TAP version 13
# Subtest: splitCommands skips comments and empty lines and joins continued lines
ok 1 - splitCommands skips comments and empty lines and joins continued lines
  ---
  duration_ms: 1.4168
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
# duration_ms 229.4129
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
  duration_ms: 547.8523
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
# duration_ms 810.2248
[step 2] runProgram passes the arguments without a shell
$ node --test --test-reporter=tap --test-name-pattern "runProgram passes the arguments without a shell" ../../../../../libs/mdcli/build/run-command.test.js
TAP version 13
# Subtest: runProgram passes the arguments without a shell
ok 1 - runProgram passes the arguments without a shell
  ---
  duration_ms: 78.4848
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
# duration_ms 168.6507
[step 3] the JavaScript and .NET arguments and their no-test checks
$ node --test --test-reporter=tap --test-name-pattern "the JavaScript and \\.NET arguments and their no-test checks" ../../../build/run-test.test.js
TAP version 13
# Subtest: the JavaScript and .NET arguments and their no-test checks
ok 1 - the JavaScript and .NET arguments and their no-test checks
  ---
  duration_ms: 1.7014
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
# duration_ms 263.0806
```

## T14 Coverage check

- File: <tests/T14 Coverage check.md>
- Result: PASS - 7 steps

```text
[step 1] checkCoverage asks the agent about a requirement and its links
$ node --test --test-reporter=tap --test-name-pattern "checkCoverage asks the agent about a requirement and its links" ../../../build/coverage.test.js
TAP version 13
# Subtest: checkCoverage asks the agent about a requirement and its links
ok 1 - checkCoverage asks the agent about a requirement and its links
  ---
  duration_ms: 463.4798
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
# duration_ms 729.1475
[step 2] checkCoverage prompt names the requirement and its links
$ node --test --test-reporter=tap --test-name-pattern "checkCoverage prompt names the requirement and its links" ../../../build/coverage.test.js
TAP version 13
# Subtest: checkCoverage prompt names the requirement and its links
ok 1 - checkCoverage prompt names the requirement and its links
  ---
  duration_ms: 157.2244
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
# duration_ms 424.8731
[step 3] execCoverage records the verdict of each selected requirement in its Status
$ node --test --test-reporter=tap --test-name-pattern "execCoverage records the verdict of each selected requirement in its Status" ../../../build/coverage.test.js
TAP version 13
# Subtest: execCoverage records the verdict of each selected requirement in its Status
ok 1 - execCoverage records the verdict of each selected requirement in its Status
  ---
  duration_ms: 492.454
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
# duration_ms 757.9007
[step 4] execCoverage writes the analysis to the Coverage section, before the Status
$ node --test --test-reporter=tap --test-name-pattern "execCoverage writes the analysis to the Coverage section, before the Status" ../../../build/coverage.test.js
TAP version 13
# Subtest: execCoverage writes the analysis to the Coverage section, before the Status
ok 1 - execCoverage writes the analysis to the Coverage section, before the Status
  ---
  duration_ms: 298.2703
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
# duration_ms 567.8695
[step 5] writeCoverageSection adds the section before the Status, or replaces it
$ node --test --test-reporter=tap --test-name-pattern "writeCoverageSection adds the section before the Status, or replaces it" ../../../build/coverage-section.test.js
TAP version 13
# Subtest: writeCoverageSection adds the section before the Status, or replaces it
ok 1 - writeCoverageSection adds the section before the Status, or replaces it
  ---
  duration_ms: 15.4519
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
# duration_ms 234.4537
[step 6] writeCoverageSection replaces the links of the analysis by their text
$ node --test --test-reporter=tap --test-name-pattern "writeCoverageSection replaces the links of the analysis by their text" ../../../build/coverage-section.test.js
TAP version 13
# Subtest: writeCoverageSection replaces the links of the analysis by their text
ok 1 - writeCoverageSection replaces the links of the analysis by their text
  ---
  duration_ms: 7.917
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
# duration_ms 231.7077
[step 7] execTest writes the status of each test and of the requirements above it
$ node --test --test-reporter=tap --test-name-pattern "execTest writes the status of each test and of the requirements above it" ../../../build/test.test.js
TAP version 13
# Subtest: execTest writes the status of each test and of the requirements above it
ok 1 - execTest writes the status of each test and of the requirements above it
  ---
  duration_ms: 532.6525
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
# duration_ms 804.262
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
  duration_ms: 1.693
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
# duration_ms 136.8895
[step 2] getAgentCommand prefers the override, then the named agent, then the detected one
$ node --test --test-reporter=tap --test-name-pattern "getAgentCommand prefers the override, then the named agent, then the detected one" ../../../../../libs/mdcli/build/agent.test.js
TAP version 13
# Subtest: getAgentCommand prefers the override, then the named agent, then the detected one
ok 1 - getAgentCommand prefers the override, then the named agent, then the detected one
  ---
  duration_ms: 1.1552
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
# duration_ms 131.0005
[step 3] askAgent reads the verdict from the last JSON line
$ node --test --test-reporter=tap --test-name-pattern "askAgent reads the verdict from the last JSON line" ../../../../../libs/mdcli/build/agent.test.js
TAP version 13
# Subtest: askAgent reads the verdict from the last JSON line
ok 1 - askAgent reads the verdict from the last JSON line
  ---
  duration_ms: 515.7734
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
# duration_ms 647.8076
[step 4] detectAgent picks the first agent whose command runs, claude before copilot
$ node --test --test-reporter=tap --test-name-pattern "detectAgent picks the first agent whose command runs, claude before copilot" ../../../../../libs/mdcli/build/agent.test.js
TAP version 13
# Subtest: detectAgent picks the first agent whose command runs, claude before copilot
ok 1 - detectAgent picks the first agent whose command runs, claude before copilot
  ---
  duration_ms: 1.6496
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
# duration_ms 129.937
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
  duration_ms: 23.4279
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
# duration_ms 278.0291
[step 2] rq add, links, backlinks, log and check forward their options
$ node --test --test-reporter=tap --test-name-pattern "rq add, links, backlinks, log and check forward their options" ../../../build/cli.test.js
TAP version 13
# Subtest: rq add, links, backlinks, log and check forward their options
ok 1 - rq add, links, backlinks, log and check forward their options
  ---
  duration_ms: 241.8639
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
# duration_ms 518.8876
[step 3] every command works in --working-dir and takes ids and .md names
$ node --test --test-reporter=tap --test-name-pattern "every command works in --working-dir and takes ids and \\.md names" ../../../build/cli.test.js
TAP version 13
# Subtest: every command works in --working-dir and takes ids and .md names
ok 1 - every command works in --working-dir and takes ids and .md names
  ---
  duration_ms: 679.3007
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
# duration_ms 958.3978
[step 4] execView takes an id in the working folder and reads the recorded statuses
$ node --test --test-reporter=tap --test-name-pattern "execView takes an id in the working folder and reads the recorded statuses" ../../../build/view.test.js
TAP version 13
# Subtest: execView takes an id in the working folder and reads the recorded statuses
ok 1 - execView takes an id in the working folder and reads the recorded statuses
  ---
  duration_ms: 82.3526
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
# duration_ms 347.5888
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
  duration_ms: 1.1226
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
# duration_ms 267.0854
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
  duration_ms: 63.8372
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
# duration_ms 342.0673
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
  duration_ms: 39.2188
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
# duration_ms 319.4483
[step 2] loadGraph reports broken links, cycles and unreachable documents
$ node --test --test-reporter=tap --test-name-pattern "loadGraph reports broken links, cycles and unreachable documents" ../../../build/graph.test.js
TAP version 13
# Subtest: loadGraph reports broken links, cycles and unreachable documents
ok 1 - loadGraph reports broken links, cycles and unreachable documents
  ---
  duration_ms: 82.4273
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
# duration_ms 363.1771
[step 3] execLink links an existing node and refuses duplicates, cycles and a second parent
$ node --test --test-reporter=tap --test-name-pattern "execLink links an existing node and refuses duplicates, cycles and a second parent" ../../../build/change.test.js
TAP version 13
# Subtest: execLink links an existing node and refuses duplicates, cycles and a second parent
ok 1 - execLink links an existing node and refuses duplicates, cycles and a second parent
  ---
  duration_ms: 183.3896
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
# duration_ms 472.9356
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
  duration_ms: 62.0081
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
# duration_ms 346.168
[step 2] loadGraph follows only Implementation links to requirements and tests
$ node --test --test-reporter=tap --test-name-pattern "loadGraph follows only Implementation links to requirements and tests" ../../../build/graph.test.js
TAP version 13
# Subtest: loadGraph follows only Implementation links to requirements and tests
ok 1 - loadGraph follows only Implementation links to requirements and tests
  ---
  duration_ms: 49.0354
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
# duration_ms 333.8326
[step 3] loadGraph makes no edges from the links of a test
$ node --test --test-reporter=tap --test-name-pattern "loadGraph makes no edges from the links of a test" ../../../build/graph.test.js
TAP version 13
# Subtest: loadGraph makes no edges from the links of a test
ok 1 - loadGraph makes no edges from the links of a test
  ---
  duration_ms: 55.9716
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
# duration_ms 341.2307
[step 4] execCheck reports problems of the graph and of each document
$ node --test --test-reporter=tap --test-name-pattern "execCheck reports problems of the graph and of each document" ../../../build/check.test.js
TAP version 13
# Subtest: execCheck reports problems of the graph and of each document
ok 1 - execCheck reports problems of the graph and of each document
  ---
  duration_ms: 74.8247
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
# duration_ms 351.3747
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
  duration_ms: 12.1139
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
# duration_ms 254.256
[step 2] writeStatus adds, replaces and removes the section
$ node --test --test-reporter=tap --test-name-pattern "writeStatus adds, replaces and removes the section" ../../../build/status-section.test.js
TAP version 13
# Subtest: writeStatus adds, replaces and removes the section
ok 1 - writeStatus adds, replaces and removes the section
  ---
  duration_ms: 9.8569
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
# duration_ms 253.5523
[step 3] writeStatus keeps the content of the section it does not own
$ node --test --test-reporter=tap --test-name-pattern "writeStatus keeps the content of the section it does not own" ../../../build/status-section.test.js
TAP version 13
# Subtest: writeStatus keeps the content of the section it does not own
ok 1 - writeStatus keeps the content of the section it does not own
  ---
  duration_ms: 12.9856
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
# duration_ms 247.8121
[step 4] execCheck reports a malformed Status and a test with a coverage
$ node --test --test-reporter=tap --test-name-pattern "execCheck reports a malformed Status and a test with a coverage" ../../../build/check.test.js
TAP version 13
# Subtest: execCheck reports a malformed Status and a test with a coverage
ok 1 - execCheck reports a malformed Status and a test with a coverage
  ---
  duration_ms: 39.6895
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
# duration_ms 312.1886
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
  duration_ms: 12.7466
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
# duration_ms 257.7935
[step 2] parseSteps reports what is wrong with the steps
$ node --test --test-reporter=tap --test-name-pattern "parseSteps reports what is wrong with the steps" ../../../build/steps.test.js
TAP version 13
# Subtest: parseSteps reports what is wrong with the steps
ok 1 - parseSteps reports what is wrong with the steps
  ---
  duration_ms: 11.5369
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
# duration_ms 258.261
[step 3] parseDocument reads the steps of a test
$ node --test --test-reporter=tap --test-name-pattern "parseDocument reads the steps of a test" ../../../build/document.test.js
TAP version 13
# Subtest: parseDocument reads the steps of a test
ok 1 - parseDocument reads the steps of a test
  ---
  duration_ms: 8.8982
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
# duration_ms 246.5128
[step 4] execCheck reports problems of the graph and of each document
$ node --test --test-reporter=tap --test-name-pattern "execCheck reports problems of the graph and of each document" ../../../build/check.test.js
TAP version 13
# Subtest: execCheck reports problems of the graph and of each document
ok 1 - execCheck reports problems of the graph and of each document
  ---
  duration_ms: 70.9253
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
# duration_ms 348.5418
[step 5] runTest fails a test with a malformed step without running any step
$ node --test --test-reporter=tap --test-name-pattern "runTest fails a test with a malformed step without running any step" ../../../build/run-test.test.js
TAP version 13
# Subtest: runTest fails a test with a malformed step without running any step
ok 1 - runTest fails a test with a malformed step without running any step
  ---
  duration_ms: 20.6906
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
# duration_ms 304.4393
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
  duration_ms: 347.304
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
# duration_ms 631.1423
[step 2] runTest fails a .NET step that exits with 0 but runs no test
$ node --test --test-reporter=tap --test-name-pattern "runTest fails a \\.NET step that exits with 0 but runs no test" ../../../build/run-test.test.js
TAP version 13
# Subtest: runTest fails a .NET step that exits with 0 but runs no test
ok 1 - runTest fails a .NET step that exits with 0 but runs no test
  ---
  duration_ms: 22.6435
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
# duration_ms 323.8263
[step 3] the JavaScript and .NET arguments and their no-test checks
$ node --test --test-reporter=tap --test-name-pattern "the JavaScript and \\.NET arguments and their no-test checks" ../../../build/run-test.test.js
TAP version 13
# Subtest: the JavaScript and .NET arguments and their no-test checks
ok 1 - the JavaScript and .NET arguments and their no-test checks
  ---
  duration_ms: 2.0503
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
# duration_ms 290.593
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
  duration_ms: 260.7783
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
# duration_ms 541.0427
[step 2] getAgentCommand lets an agent read and run commands in run mode, and also edit in edit mode
$ node --test --test-reporter=tap --test-name-pattern "getAgentCommand lets an agent read and run commands in run mode, and also edit in edit mode" ../../../../../libs/mdcli/build/agent.test.js
TAP version 13
# Subtest: getAgentCommand lets an agent read and run commands in run mode, and also edit in edit mode
ok 1 - getAgentCommand lets an agent read and run commands in run mode, and also edit in edit mode
  ---
  duration_ms: 1.0588
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
# duration_ms 144.354
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
  duration_ms: 843.0473
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
# duration_ms 1134.2758
[step 2] execTest of a requirement runs its own tests, and with recurse everything below it
$ node --test --test-reporter=tap --test-name-pattern "execTest of a requirement runs its own tests, and with recurse everything below it" ../../../build/test.test.js
TAP version 13
# Subtest: execTest of a requirement runs its own tests, and with recurse everything below it
ok 1 - execTest of a requirement runs its own tests, and with recurse everything below it
  ---
  duration_ms: 645.2847
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
# duration_ms 937.5112
[step 3] execTest takes a requirement or test file by its path
$ node --test --test-reporter=tap --test-name-pattern "execTest takes a requirement or test file by its path" ../../../build/test.test.js
TAP version 13
# Subtest: execTest takes a requirement or test file by its path
ok 1 - execTest takes a requirement or test file by its path
  ---
  duration_ms: 393.9915
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
# duration_ms 676.8047
[step 4] selectTargets selects a target, its direct tests, or everything below it
$ node --test --test-reporter=tap --test-name-pattern "selectTargets selects a target, its direct tests, or everything below it" ../../../build/targets.test.js
TAP version 13
# Subtest: selectTargets selects a target, its direct tests, or everything below it
ok 1 - selectTargets selects a target, its direct tests, or everything below it
  ---
  duration_ms: 81.0615
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
# duration_ms 378.2562
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
  duration_ms: 1.451
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
# duration_ms 296.475
[step 2] writeExecution numbers the files and loadResults keeps the latest result of each test
$ node --test --test-reporter=tap --test-name-pattern "writeExecution numbers the files and loadResults keeps the latest result of each test" ../../../build/results.test.js
TAP version 13
# Subtest: writeExecution numbers the files and loadResults keeps the latest result of each test
ok 1 - writeExecution numbers the files and loadResults keeps the latest result of each test
  ---
  duration_ms: 36.1744
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
# duration_ms 325.7898
[step 3] parseExecution reads the result of each test section
$ node --test --test-reporter=tap --test-name-pattern "parseExecution reads the result of each test section" ../../../build/results.test.js
TAP version 13
# Subtest: parseExecution reads the result of each test section
ok 1 - parseExecution reads the result of each test section
  ---
  duration_ms: 9.9862
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
# duration_ms 300.516
[step 4] readWorkingTree reads the commit, the branch and the changed files
$ node --test --test-reporter=tap --test-name-pattern "readWorkingTree reads the commit, the branch and the changed files" ../../../build/results.test.js
TAP version 13
# Subtest: readWorkingTree reads the commit, the branch and the changed files
ok 1 - readWorkingTree reads the commit, the branch and the changed files
  ---
  duration_ms: 795.7341
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
# duration_ms 1100.6717
[step 5] loadResults prefers a later date, and writeExecution never reuses a number
$ node --test --test-reporter=tap --test-name-pattern "loadResults prefers a later date, and writeExecution never reuses a number" ../../../build/results.test.js
TAP version 13
# Subtest: loadResults prefers a later date, and writeExecution never reuses a number
ok 1 - loadResults prefers a later date, and writeExecution never reuses a number
  ---
  duration_ms: 38.4916
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
# duration_ms 374.1818
[step 6] execTest of a folder runs every test, records them, and reports the latest status
$ node --test --test-reporter=tap --test-name-pattern "execTest of a folder runs every test, records them, and reports the latest status" ../../../build/test.test.js
TAP version 13
# Subtest: execTest of a folder runs every test, records them, and reports the latest status
ok 1 - execTest of a folder runs every test, records them, and reports the latest status
  ---
  duration_ms: 426.16
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
# duration_ms 745.4431
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
  duration_ms: 54.3917
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
# duration_ms 355.9983
[step 2] getStatuses fails a requirement with no links and one in a cycle
$ node --test --test-reporter=tap --test-name-pattern "getStatuses fails a requirement with no links and one in a cycle" ../../../build/status.test.js
TAP version 13
# Subtest: getStatuses fails a requirement with no links and one in a cycle
ok 1 - getStatuses fails a requirement with no links and one in a cycle
  ---
  duration_ms: 41.5895
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
# duration_ms 336.0806
[step 3] getStatuses takes the recorded results, and recalculates only what it is asked to
$ node --test --test-reporter=tap --test-name-pattern "getStatuses takes the recorded results, and recalculates only what it is asked to" ../../../build/status.test.js
TAP version 13
# Subtest: getStatuses takes the recorded results, and recalculates only what it is asked to
ok 1 - getStatuses takes the recorded results, and recalculates only what it is asked to
  ---
  duration_ms: 60.8362
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
# duration_ms 360.6781
[step 4] execTest writes the status of each test and of the requirements above it
$ node --test --test-reporter=tap --test-name-pattern "execTest writes the status of each test and of the requirements above it" ../../../build/test.test.js
TAP version 13
# Subtest: execTest writes the status of each test and of the requirements above it
ok 1 - execTest writes the status of each test and of the requirements above it
  ---
  duration_ms: 577.7389
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
# duration_ms 879.3224
[step 5] execTest merges the tests it ran with the recorded statuses, without reading .rq
$ node --test --test-reporter=tap --test-name-pattern "execTest merges the tests it ran with the recorded statuses, without reading \\.rq" ../../../build/test.test.js
TAP version 13
# Subtest: execTest merges the tests it ran with the recorded statuses, without reading .rq
ok 1 - execTest merges the tests it ran with the recorded statuses, without reading .rq
  ---
  duration_ms: 313.6528
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
# duration_ms 632.9451
[step 6] execUnlink takes ids, execMove retitles reference links, and both refresh statuses
$ node --test --test-reporter=tap --test-name-pattern "execUnlink takes ids, execMove retitles reference links, and both refresh statuses" ../../../build/change.test.js
TAP version 13
# Subtest: execUnlink takes ids, execMove retitles reference links, and both refresh statuses
ok 1 - execUnlink takes ids, execMove retitles reference links, and both refresh statuses
  ---
  duration_ms: 224.96
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
# duration_ms 553.1311
[step 7] execAdd, execLink, execRemove and execMove refresh the statuses they make stale
$ node --test --test-reporter=tap --test-name-pattern "execAdd, execLink, execRemove and execMove refresh the statuses they make stale" ../../../build/change.test.js
TAP version 13
# Subtest: execAdd, execLink, execRemove and execMove refresh the statuses they make stale
ok 1 - execAdd, execLink, execRemove and execMove refresh the statuses they make stale
  ---
  duration_ms: 323.0575
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
# duration_ms 649.6554
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
  duration_ms: 149.691
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
# duration_ms 519.991
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
  duration_ms: 445.7105
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
# duration_ms 777.4408
[step 2] execTest reports structure errors and requirements with no links
$ node --test --test-reporter=tap --test-name-pattern "execTest reports structure errors and requirements with no links" ../../../build/test.test.js
TAP version 13
# Subtest: execTest reports structure errors and requirements with no links
ok 1 - execTest reports structure errors and requirements with no links
  ---
  duration_ms: 35.416
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
# duration_ms 361.2441
[step 3] execTest and execLog remove the oldest execution files beyond the retention
$ node --test --test-reporter=tap --test-name-pattern "execTest and execLog remove the oldest execution files beyond the retention" ../../../build/test.test.js
TAP version 13
# Subtest: execTest and execLog remove the oldest execution files beyond the retention
ok 1 - execTest and execLog remove the oldest execution files beyond the retention
  ---
  duration_ms: 555.8912
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
# duration_ms 905.9987
[step 4] execTest of a requirement runs its own tests, and with recurse everything below it
$ node --test --test-reporter=tap --test-name-pattern "execTest of a requirement runs its own tests, and with recurse everything below it" ../../../build/test.test.js
TAP version 13
# Subtest: execTest of a requirement runs its own tests, and with recurse everything below it
ok 1 - execTest of a requirement runs its own tests, and with recurse everything below it
  ---
  duration_ms: 686.888
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
# duration_ms 1022.4039
[step 5] execTest merges the tests it ran with the recorded statuses, without reading .rq
$ node --test --test-reporter=tap --test-name-pattern "execTest merges the tests it ran with the recorded statuses, without reading \\.rq" ../../../build/test.test.js
TAP version 13
# Subtest: execTest merges the tests it ran with the recorded statuses, without reading .rq
ok 1 - execTest merges the tests it ran with the recorded statuses, without reading .rq
  ---
  duration_ms: 287.4133
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
# duration_ms 593.4084
[step 6] execTest exits with 1 on a structure error even when every node passes
$ node --test --test-reporter=tap --test-name-pattern "execTest exits with 1 on a structure error even when every node passes" ../../../build/test.test.js
TAP version 13
# Subtest: execTest exits with 1 on a structure error even when every node passes
ok 1 - execTest exits with 1 on a structure error even when every node passes
  ---
  duration_ms: 180.5892
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
# duration_ms 488.2263
[step 7] rq test returns the verification exit code
$ node --test --test-reporter=tap --test-name-pattern "rq test returns the verification exit code" ../../../build/cli.test.js
TAP version 13
# Subtest: rq test returns the verification exit code
ok 1 - rq test returns the verification exit code
  ---
  duration_ms: 987.4346
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
# duration_ms 1293.1824
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
  duration_ms: 53.2334
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
# duration_ms 342.7543
[step 2] pruneExecutions keeps 300 files and 50 MB by default, and removes by size
$ node --test --test-reporter=tap --test-name-pattern "pruneExecutions keeps 300 files and 50 MB by default, and removes by size" ../../../build/results.test.js
TAP version 13
# Subtest: pruneExecutions keeps 300 files and 50 MB by default, and removes by size
ok 1 - pruneExecutions keeps 300 files and 50 MB by default, and removes by size
  ---
  duration_ms: 63.3678
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
# duration_ms 352.4347
[step 3] pruneExecutions does not keep the results of tests that no longer exist
$ node --test --test-reporter=tap --test-name-pattern "pruneExecutions does not keep the results of tests that no longer exist" ../../../build/results.test.js
TAP version 13
# Subtest: pruneExecutions does not keep the results of tests that no longer exist
ok 1 - pruneExecutions does not keep the results of tests that no longer exist
  ---
  duration_ms: 26.5779
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
# duration_ms 317.5005
[step 4] execTest and execLog remove the oldest execution files beyond the retention
$ node --test --test-reporter=tap --test-name-pattern "execTest and execLog remove the oldest execution files beyond the retention" ../../../build/test.test.js
TAP version 13
# Subtest: execTest and execLog remove the oldest execution files beyond the retention
ok 1 - execTest and execLog remove the oldest execution files beyond the retention
  ---
  duration_ms: 472.9959
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
# duration_ms 770.7041
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
  duration_ms: 55.7158
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
# duration_ms 342.0442
[step 2] getAppearance colours by result and styles a requirement by its coverage
$ node --test --test-reporter=tap --test-name-pattern "getAppearance colours by result and styles a requirement by its coverage" ../../../build/mermaid.test.js
TAP version 13
# Subtest: getAppearance colours by result and styles a requirement by its coverage
ok 1 - getAppearance colours by result and styles a requirement by its coverage
  ---
  duration_ms: 54.2739
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
# duration_ms 333.8027
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
  duration_ms: 203.0929
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
# duration_ms 511.069
[step 2] execView of a file serves its folder and shows its problems
$ node --test --test-reporter=tap --test-name-pattern "execView of a file serves its folder and shows its problems" ../../../build/view.test.js
TAP version 13
# Subtest: execView of a file serves its folder and shows its problems
ok 1 - execView of a file serves its folder and shows its problems
  ---
  duration_ms: 78.3888
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
# duration_ms 366.2327
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
  duration_ms: 117.9557
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
# duration_ms 435.9954
[step 2] execAdd creates a test with steps in the tests folder
$ node --test --test-reporter=tap --test-name-pattern "execAdd creates a test with steps in the tests folder" ../../../build/change.test.js
TAP version 13
# Subtest: execAdd creates a test with steps in the tests folder
ok 1 - execAdd creates a test with steps in the tests folder
  ---
  duration_ms: 1562.3482
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
# duration_ms 2030.8357
[step 3] execAdd refuses a test parent, a bad name and an existing file
$ node --test --test-reporter=tap --test-name-pattern "execAdd refuses a test parent, a bad name and an existing file" ../../../build/change.test.js
TAP version 13
# Subtest: execAdd refuses a test parent, a bad name and an existing file
ok 1 - execAdd refuses a test parent, a bad name and an existing file
  ---
  duration_ms: 186.4028
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
# duration_ms 1295.9018
[step 4] execLink links an existing node and refuses duplicates, cycles and a second parent
$ node --test --test-reporter=tap --test-name-pattern "execLink links an existing node and refuses duplicates, cycles and a second parent" ../../../build/change.test.js
TAP version 13
# Subtest: execLink links an existing node and refuses duplicates, cycles and a second parent
ok 1 - execLink links an existing node and refuses duplicates, cycles and a second parent
  ---
  duration_ms: 236.4034
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
# duration_ms 752.5998
[step 5] execUnlink removes every link to the child
$ node --test --test-reporter=tap --test-name-pattern "execUnlink removes every link to the child" ../../../build/change.test.js
TAP version 13
# Subtest: execUnlink removes every link to the child
ok 1 - execUnlink removes every link to the child
  ---
  duration_ms: 844.8301
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
# duration_ms 1313.8709
[step 6] execRemove deletes a leaf and the links to it
$ node --test --test-reporter=tap --test-name-pattern "execRemove deletes a leaf and the links to it" ../../../build/change.test.js
TAP version 13
# Subtest: execRemove deletes a leaf and the links to it
ok 1 - execRemove deletes a leaf and the links to it
  ---
  duration_ms: 429.6392
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
# duration_ms 1010.9289
[step 7] execRemove --recursive deletes what only removed documents link to
$ node --test --test-reporter=tap --test-name-pattern "execRemove --recursive deletes what only removed documents link to" ../../../build/change.test.js
TAP version 13
# Subtest: execRemove --recursive deletes what only removed documents link to
ok 1 - execRemove --recursive deletes what only removed documents link to
  ---
  duration_ms: 138.3884
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
# duration_ms 639.0945
[step 8] execMove renames a document and rewrites the links to it
$ node --test --test-reporter=tap --test-name-pattern "execMove renames a document and rewrites the links to it" ../../../build/change.test.js
TAP version 13
# Subtest: execMove renames a document and rewrites the links to it
ok 1 - execMove renames a document and rewrites the links to it
  ---
  duration_ms: 470.6298
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
# duration_ms 875.5021
[step 9] execUnlink takes ids, execMove retitles reference links, and both refresh statuses
$ node --test --test-reporter=tap --test-name-pattern "execUnlink takes ids, execMove retitles reference links, and both refresh statuses" ../../../build/change.test.js
TAP version 13
# Subtest: execUnlink takes ids, execMove retitles reference links, and both refresh statuses
ok 1 - execUnlink takes ids, execMove retitles reference links, and both refresh statuses
  ---
  duration_ms: 263.4564
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
# duration_ms 693.4288
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
  duration_ms: 86.6897
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
# duration_ms 474.1179
[step 2] execLinks prints what a requirement links to, missing and other files included
$ node --test --test-reporter=tap --test-name-pattern "execLinks prints what a requirement links to, missing and other files included" ../../../build/query.test.js
TAP version 13
# Subtest: execLinks prints what a requirement links to, missing and other files included
ok 1 - execLinks prints what a requirement links to, missing and other files included
  ---
  duration_ms: 63.8271
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
# duration_ms 488.5746
[step 3] execBacklinks prints the requirements that link to a document
$ node --test --test-reporter=tap --test-name-pattern "execBacklinks prints the requirements that link to a document" ../../../build/query.test.js
TAP version 13
# Subtest: execBacklinks prints the requirements that link to a document
ok 1 - execBacklinks prints the requirements that link to a document
  ---
  duration_ms: 81.7647
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
# duration_ms 478.0859
[step 4] execToJson prints the graph with the structural fields
$ node --test --test-reporter=tap --test-name-pattern "execToJson prints the graph with the structural fields" ../../../build/query.test.js
TAP version 13
# Subtest: execToJson prints the graph with the structural fields
ok 1 - execToJson prints the graph with the structural fields
  ---
  duration_ms: 81.203
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
# duration_ms 608.4044
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
  duration_ms: 84.648
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
# duration_ms 515.9814
[step 2] execCheck reports problems of the graph and of each document
$ node --test --test-reporter=tap --test-name-pattern "execCheck reports problems of the graph and of each document" ../../../build/check.test.js
TAP version 13
# Subtest: execCheck reports problems of the graph and of each document
ok 1 - execCheck reports problems of the graph and of each document
  ---
  duration_ms: 65.6163
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
# duration_ms 426.8519
[step 3] execCheck reports a malformed Status and a test with a coverage
$ node --test --test-reporter=tap --test-name-pattern "execCheck reports a malformed Status and a test with a coverage" ../../../build/check.test.js
TAP version 13
# Subtest: execCheck reports a malformed Status and a test with a coverage
ok 1 - execCheck reports a malformed Status and a test with a coverage
  ---
  duration_ms: 48.7016
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
# duration_ms 405.2963
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
  duration_ms: 26.8802
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
# duration_ms 445.1077
[step 2] writeStatus adds, replaces and removes the section
$ node --test --test-reporter=tap --test-name-pattern "writeStatus adds, replaces and removes the section" ../../../build/status-section.test.js
TAP version 13
# Subtest: writeStatus adds, replaces and removes the section
ok 1 - writeStatus adds, replaces and removes the section
  ---
  duration_ms: 15.1587
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
# duration_ms 314.5823
[step 3] writeStatus labels the execution link with the execution id, numbered when taken
$ node --test --test-reporter=tap --test-name-pattern "writeStatus labels the execution link with the execution id, numbered when taken" ../../../build/status-section.test.js
TAP version 13
# Subtest: writeStatus labels the execution link with the execution id, numbered when taken
ok 1 - writeStatus labels the execution link with the execution id, numbered when taken
  ---
  duration_ms: 13.6202
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
# duration_ms 333.7595
[step 4] execTest writes the status of each test and of the requirements above it
$ node --test --test-reporter=tap --test-name-pattern "execTest writes the status of each test and of the requirements above it" ../../../build/test.test.js
TAP version 13
# Subtest: execTest writes the status of each test and of the requirements above it
ok 1 - execTest writes the status of each test and of the requirements above it
  ---
  duration_ms: 719.7291
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
# duration_ms 1088.6118
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
  duration_ms: 30.3866
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
# duration_ms 234.7782
[step 2] postProcess runs the command with the written files that still exist
$ node --test --test-reporter=tap --test-name-pattern "postProcess runs the command with the written files that still exist" ../../../../../libs/mdcli/build/post-process.test.js
TAP version 13
# Subtest: postProcess runs the command with the written files that still exist
ok 1 - postProcess runs the command with the written files that still exist
  ---
  duration_ms: 318.8647
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
# duration_ms 507.9839
[step 3] rq post-processes the markdown files a command wrote
$ node --test --test-reporter=tap --test-name-pattern "rq post-processes the markdown files a command wrote" ../../../build/cli.test.js
TAP version 13
# Subtest: rq post-processes the markdown files a command wrote
ok 1 - rq post-processes the markdown files a command wrote
  ---
  duration_ms: 502.3417
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
# duration_ms 899.9736
```
