# E7 rq

- Date: 2026-10-09T16:27:21.860Z
- Command: `rq test .`
- Result: PASS - 11 of 11 tests passed
- Commit: 0472944cb8521fd63173f5dd364a557d2f9ba3d5
- Branch: main
- Changed files:
  - `M "apps/board/dev/rq/R1 board.md"`
  - `M "apps/board/dev/rq/R11 Agents and configuration.md"`
  - `M "apps/board/dev/rq/commands/R10 List.md"`
  - `M "apps/board/dev/rq/commands/R13 View.md"`
  - `M "apps/board/dev/rq/commands/R4 Moving documents.md"`
  - `M "apps/board/dev/rq/commands/R5 Develop.md"`
  - `M "apps/board/dev/rq/commands/R6 Plan.md"`
  - `M "apps/board/dev/rq/commands/R7 Tasks.md"`
  - `M "apps/board/dev/rq/commands/R8 Exec.md"`
  - `M "apps/board/dev/rq/commands/R9 Archive.md"`
  - `M "apps/board/dev/rq/model/R12 Ids and documents.md"`
  - `M "apps/board/dev/rq/model/R2 Board model.md"`
  - `M "apps/board/dev/rq/model/R3 Open questions.md"`
  - `M "apps/board/dev/rq/tests/T1 Documents and ids.md"`
  - `M "apps/board/dev/rq/tests/T10 Command line.md"`
  - `M "apps/board/dev/rq/tests/T2 Open questions.md"`
  - `M "apps/board/dev/rq/tests/T3 Develop.md"`
  - `M "apps/board/dev/rq/tests/T4 Plan.md"`
  - `M "apps/board/dev/rq/tests/T5 Tasks.md"`
  - `M "apps/board/dev/rq/tests/T6 Exec.md"`
  - `M "apps/board/dev/rq/tests/T7 Archive.md"`
  - `M "apps/board/dev/rq/tests/T8 List.md"`
  - `M "apps/board/dev/rq/tests/T9 View.md"`
  - `?? "apps/board/dev/rq/R14 MCP server.md"`
  - `?? "apps/board/dev/rq/tests/T11 MCP server.md"`

## T10 Command line

- File: <tests/T10 Command line.md>
- Result: PASS - 7 steps

```text
[step 1] board without arguments prints help with every command
$ node --test --test-reporter=tap --test-name-pattern "board without arguments prints help with every command" ../../../build/cli.test.js
TAP version 13
# Subtest: board without arguments prints help with every command
ok 1 - board without arguments prints help with every command
  ---
  duration_ms: 10.5742
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 789.2076
[step 2] board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote
$ node --test --test-reporter=tap --test-name-pattern "board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote" ../../../build/cli.test.js
TAP version 13
# Subtest: board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote
ok 1 - board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote
  ---
  duration_ms: 686.0046
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1308.6459
[step 3] board returns 1 and says why when a command fails
$ node --test --test-reporter=tap --test-name-pattern "board returns 1 and says why when a command fails" ../../../build/cli.test.js
TAP version 13
# Subtest: board returns 1 and says why when a command fails
ok 1 - board returns 1 and says why when a command fails
  ---
  duration_ms: 159.9888
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 956.3165
[step 4] board --ai runs the named agent with the model
$ node --test --test-reporter=tap --test-name-pattern "board --ai runs the named agent with the model" ../../../build/cli.test.js
TAP version 13
# Subtest: board --ai runs the named agent with the model
ok 1 - board --ai runs the named agent with the model
  ---
  duration_ms: 398.5517
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1019.2086
[step 5] detectAgent picks the first agent whose command runs, claude before copilot
$ node --test --test-reporter=tap --test-name-pattern "detectAgent picks the first agent whose command runs, claude before copilot" ../../../../../libs/mdcli/build/agent.test.js
TAP version 13
# Subtest: detectAgent picks the first agent whose command runs, claude before copilot
ok 1 - detectAgent picks the first agent whose command runs, claude before copilot
  ---
  duration_ms: 8.1611
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 367.231
[step 6] getCommand takes BOARD_AI_COMMAND, and fails without an agent
$ node --test --test-reporter=tap --test-name-pattern "getCommand takes BOARD_AI_COMMAND, and fails without an agent" ../../../build/ask.test.js
TAP version 13
# Subtest: getCommand takes BOARD_AI_COMMAND, and fails without an agent
ok 1 - getCommand takes BOARD_AI_COMMAND, and fails without an agent
  ---
  duration_ms: 6.0507
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 694.9397
[step 7] execExec runs the detected agent with its model, allowed to edit files and run commands
$ node --test --test-reporter=tap --test-name-pattern "execExec runs the detected agent with its model, allowed to edit files and run commands" ../../../build/exec.test.js
TAP version 13
# Subtest: execExec runs the detected agent with its model, allowed to edit files and run commands
ok 1 - execExec runs the detected agent with its model, allowed to edit files and run commands
  ---
  duration_ms: 387.8878
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 933.4815
```

## T1 Documents and ids

- File: <tests/T1 Documents and ids.md>
- Result: PASS - 5 steps

```text
[step 1] parseId and getItemId read ideas, plans, tasks and results
$ node --test --test-reporter=tap --test-name-pattern "parseId and getItemId read ideas, plans, tasks and results" ../../../build/items.test.js
TAP version 13
# Subtest: parseId and getItemId read ideas, plans, tasks and results
ok 1 - parseId and getItemId read ideas, plans, tasks and results
  ---
  duration_ms: 3.7927
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 539.7842
[step 2] loadBoard reads the items of each folder, and reports misplaced and duplicate ids
$ node --test --test-reporter=tap --test-name-pattern "loadBoard reads the items of each folder, and reports misplaced and duplicate ids" ../../../build/items.test.js
TAP version 13
# Subtest: loadBoard reads the items of each folder, and reports misplaced and duplicate ids
ok 1 - loadBoard reads the items of each folder, and reports misplaced and duplicate ids
  ---
  duration_ms: 108.7049
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 660.3577
[step 3] findItem takes an id, a .md name or a path, and itemsOf groups an idea
$ node --test --test-reporter=tap --test-name-pattern "findItem takes an id, a \\.md name or a path, and itemsOf groups an idea" ../../../build/items.test.js
TAP version 13
# Subtest: findItem takes an id, a .md name or a path, and itemsOf groups an idea
ok 1 - findItem takes an id, a .md name or a path, and itemsOf groups an idea
  ---
  duration_ms: 82.7173
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 614.1429
[step 4] itemPath names a new item, and toFileSubject makes a subject fit a file name
$ node --test --test-reporter=tap --test-name-pattern "itemPath names a new item, and toFileSubject makes a subject fit a file name" ../../../build/items.test.js
TAP version 13
# Subtest: itemPath names a new item, and toFileSubject makes a subject fit a file name
ok 1 - itemPath names a new item, and toFileSubject makes a subject fit a file name
  ---
  duration_ms: 3.0734
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 460.6324
[step 5] loadBoard takes the subject from the heading, or from the file name without one
$ node --test --test-reporter=tap --test-name-pattern "loadBoard takes the subject from the heading, or from the file name without one" ../../../build/items.test.js
TAP version 13
# Subtest: loadBoard takes the subject from the heading, or from the file name without one
ok 1 - loadBoard takes the subject from the heading, or from the file name without one
  ---
  duration_ms: 33.3937
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 524.3765
```

## T3 Develop

- File: <tests/T3 Develop.md>
- Result: PASS - 5 steps

```text
[step 1] execDevelop rewrites an idea from the agent, with the guidance and the related documents
$ node --test --test-reporter=tap --test-name-pattern "execDevelop rewrites an idea from the agent, with the guidance and the related documents" ../../../build/develop.test.js
TAP version 13
# Subtest: execDevelop rewrites an idea from the agent, with the guidance and the related documents
ok 1 - execDevelop rewrites an idea from the agent, with the guidance and the related documents
  ---
  duration_ms: 446.8955
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 920.3958
[step 2] execDevelop refuses a result, a document with another heading, and a failed agent
$ node --test --test-reporter=tap --test-name-pattern "execDevelop refuses a result, a document with another heading, and a failed agent" ../../../build/develop.test.js
TAP version 13
# Subtest: execDevelop refuses a result, a document with another heading, and a failed agent
ok 1 - execDevelop refuses a result, a document with another heading, and a failed agent
  ---
  duration_ms: 370.4485
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 744.0774
[step 3] execDevelop rewrites a plan with its idea for context
$ node --test --test-reporter=tap --test-name-pattern "execDevelop rewrites a plan with its idea for context" ../../../build/develop.test.js
TAP version 13
# Subtest: execDevelop rewrites a plan with its idea for context
ok 1 - execDevelop rewrites a plan with its idea for context
  ---
  duration_ms: 201.7646
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 553.9905
[step 4] board develop takes the item and the guidance
$ node --test --test-reporter=tap --test-name-pattern "board develop takes the item and the guidance" ../../../build/cli.test.js
TAP version 13
# Subtest: board develop takes the item and the guidance
ok 1 - board develop takes the item and the guidance
  ---
  duration_ms: 198.6773
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 590.4357
[step 5] toDocument takes the answer, unwrapping a fence, and checks its heading
$ node --test --test-reporter=tap --test-name-pattern "toDocument takes the answer, unwrapping a fence, and checks its heading" ../../../build/ask.test.js
TAP version 13
# Subtest: toDocument takes the answer, unwrapping a fence, and checks its heading
ok 1 - toDocument takes the answer, unwrapping a fence, and checks its heading
  ---
  duration_ms: 1.7134
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 343.9896
```

## T4 Plan

- File: <tests/T4 Plan.md>
- Result: PASS - 2 steps

```text
[step 1] execPlan writes the plan of an idea from the agent
$ node --test --test-reporter=tap --test-name-pattern "execPlan writes the plan of an idea from the agent" ../../../build/plan.test.js
TAP version 13
# Subtest: execPlan writes the plan of an idea from the agent
ok 1 - execPlan writes the plan of an idea from the agent
  ---
  duration_ms: 198.2664
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 556.3469
[step 2] execPlan refuses an idea with a plan, and anything but an idea
$ node --test --test-reporter=tap --test-name-pattern "execPlan refuses an idea with a plan, and anything but an idea" ../../../build/plan.test.js
TAP version 13
# Subtest: execPlan refuses an idea with a plan, and anything but an idea
ok 1 - execPlan refuses an idea with a plan, and anything but an idea
  ---
  duration_ms: 63.9562
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 397.6085
```

## T5 Tasks

- File: <tests/T5 Tasks.md>
- Result: PASS - 3 steps

```text
[step 1] readTasks reads a task per level 2 heading, with its headings a level up
$ node --test --test-reporter=tap --test-name-pattern "readTasks reads a task per level 2 heading, with its headings a level up" ../../../build/tasks.test.js
TAP version 13
# Subtest: readTasks reads a task per level 2 heading, with its headings a level up
ok 1 - readTasks reads a task per level 2 heading, with its headings a level up
  ---
  duration_ms: 21.0059
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 374.9288
[step 2] execTasks writes the tasks of a plan from the agent, in order
$ node --test --test-reporter=tap --test-name-pattern "execTasks writes the tasks of a plan from the agent, in order" ../../../build/tasks.test.js
TAP version 13
# Subtest: execTasks writes the tasks of a plan from the agent, in order
ok 1 - execTasks writes the tasks of a plan from the agent, in order
  ---
  duration_ms: 187.8768
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 495.6832
[step 3] execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks
$ node --test --test-reporter=tap --test-name-pattern "execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks" ../../../build/tasks.test.js
TAP version 13
# Subtest: execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks
ok 1 - execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks
  ---
  duration_ms: 200.1972
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 488.5625
```

## T6 Exec

- File: <tests/T6 Exec.md>
- Result: PASS - 4 steps

```text
[step 1] execExec carries out the tasks in order, skipping done ones, and writes their results
$ node --test --test-reporter=tap --test-name-pattern "execExec carries out the tasks in order, skipping done ones, and writes their results" ../../../build/exec.test.js
TAP version 13
# Subtest: execExec carries out the tasks in order, skipping done ones, and writes their results
ok 1 - execExec carries out the tasks in order, skipping done ones, and writes their results
  ---
  duration_ms: 303.2459
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 590.749
[step 2] execExec stops at a blocked task, asks its questions, and runs it again later
$ node --test --test-reporter=tap --test-name-pattern "execExec stops at a blocked task, asks its questions, and runs it again later" ../../../build/exec.test.js
TAP version 13
# Subtest: execExec stops at a blocked task, asks its questions, and runs it again later
ok 1 - execExec stops at a blocked task, asks its questions, and runs it again later
  ---
  duration_ms: 292.3017
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 576.5149
[step 3] execExec stops at a failed task, and refuses a plan without tasks
$ node --test --test-reporter=tap --test-name-pattern "execExec stops at a failed task, and refuses a plan without tasks" ../../../build/exec.test.js
TAP version 13
# Subtest: execExec stops at a failed task, and refuses a plan without tasks
ok 1 - execExec stops at a failed task, and refuses a plan without tasks
  ---
  duration_ms: 218.4889
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 506.5037
[step 4] execExec runs the detected agent with its model, allowed to edit files and run commands
$ node --test --test-reporter=tap --test-name-pattern "execExec runs the detected agent with its model, allowed to edit files and run commands" ../../../build/exec.test.js
TAP version 13
# Subtest: execExec runs the detected agent with its model, allowed to edit files and run commands
ok 1 - execExec runs the detected agent with its model, allowed to edit files and run commands
  ---
  duration_ms: 180.4689
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 467.6145
```

## T11 MCP server

- File: <tests/T11 MCP server.md>
- Result: PASS - 8 steps

```text
[step 1] createTools makes a tool of every board command
$ node --test --test-reporter=tap --test-name-pattern "createTools makes a tool of every board command" ../../../build/mcp.test.js
TAP version 13
# Subtest: createTools makes a tool of every board command
ok 1 - createTools makes a tool of every board command
  ---
  duration_ms: 3.7028
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 307.7746
[step 2] board-mcp runs the commands with the agent in their working folder, and reports failures as errors
$ node --test --test-reporter=tap --test-name-pattern "board-mcp runs the commands with the agent in their working folder, and reports failures as errors" ../../../build/mcp.test.js
TAP version 13
# Subtest: board-mcp runs the commands with the agent in their working folder, and reports failures as errors
ok 1 - board-mcp runs the commands with the agent in their working folder, and reports failures as errors
  ---
  duration_ms: 190.8425
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 490.1306
[step 3] serverInfo names the server and the package version
$ node --test --test-reporter=tap --test-name-pattern "serverInfo names the server and the package version" ../../../build/mcp.test.js
TAP version 13
# Subtest: serverInfo names the server and the package version
ok 1 - serverInfo names the server and the package version
  ---
  duration_ms: 5.3804
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 308.2097
[step 4] handleMessage answers initialize, tools/list, unknown methods and notifications
$ node --test --test-reporter=tap --test-name-pattern "handleMessage answers initialize, tools/list, unknown methods and notifications" ../../../../../libs/mdcli/build/mcp.test.js
TAP version 13
# Subtest: handleMessage answers initialize, tools/list, unknown methods and notifications
ok 1 - handleMessage answers initialize, tools/list, unknown methods and notifications
  ---
  duration_ms: 1.7562
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 113.6484
[step 5] tools/call sends a result as JSON, text as it is, and a failure as an error result
$ node --test --test-reporter=tap --test-name-pattern "tools/call sends a result as JSON, text as it is, and a failure as an error result" ../../../../../libs/mdcli/build/mcp.test.js
TAP version 13
# Subtest: tools/call sends a result as JSON, text as it is, and a failure as an error result
ok 1 - tools/call sends a result as JSON, text as it is, and a failure as an error result
  ---
  duration_ms: 2.126
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 115.4047
[step 6] serveLines answers line-delimited requests and reports invalid lines
$ node --test --test-reporter=tap --test-name-pattern "serveLines answers line-delimited requests and reports invalid lines" ../../../../../libs/mdcli/build/mcp.test.js
TAP version 13
# Subtest: serveLines answers line-delimited requests and reports invalid lines
ok 1 - serveLines answers line-delimited requests and reports invalid lines
  ---
  duration_ms: 4.2025
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 112.0289
[step 7] commandTools makes a tool per command, with its arguments and options
$ node --test --test-reporter=tap --test-name-pattern "commandTools makes a tool per command, with its arguments and options" ../../../../../libs/mdcli/build/mcp.test.js
TAP version 13
# Subtest: commandTools makes a tool per command, with its arguments and options
ok 1 - commandTools makes a tool per command, with its arguments and options
  ---
  duration_ms: 3.0331
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 114.3485
[step 8] commandTools runs the command line of a call, one at a time, and answers its output
$ node --test --test-reporter=tap --test-name-pattern "commandTools runs the command line of a call, one at a time, and answers its output" ../../../../../libs/mdcli/build/mcp.test.js
TAP version 13
# Subtest: commandTools runs the command line of a call, one at a time, and answers its output
ok 1 - commandTools runs the command line of a call, one at a time, and answers its output
  ---
  duration_ms: 42.1852
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 158.9137
```

## T2 Open questions

- File: <tests/T2 Open questions.md>
- Result: PASS - 2 steps

```text
[step 1] readQuestions reads each question and its answer
$ node --test --test-reporter=tap --test-name-pattern "readQuestions reads each question and its answer" ../../../build/questions.test.js
TAP version 13
# Subtest: readQuestions reads each question and its answer
ok 1 - readQuestions reads each question and its answer
  ---
  duration_ms: 12.4025
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 243.0354
[step 2] addQuestions adds to the Open questions section, or adds the section
$ node --test --test-reporter=tap --test-name-pattern "addQuestions adds to the Open questions section, or adds the section" ../../../build/questions.test.js
TAP version 13
# Subtest: addQuestions adds to the Open questions section, or adds the section
ok 1 - addQuestions adds to the Open questions section, or adds the section
  ---
  duration_ms: 8.5304
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 243.2647
```

## T7 Archive

- File: <tests/T7 Archive.md>
- Result: PASS - 2 steps

```text
[step 1] execArchive moves an idea with its plan, tasks and results to the archive
$ node --test --test-reporter=tap --test-name-pattern "execArchive moves an idea with its plan, tasks and results to the archive" ../../../build/archive.test.js
TAP version 13
# Subtest: execArchive moves an idea with its plan, tasks and results to the archive
ok 1 - execArchive moves an idea with its plan, tasks and results to the archive
  ---
  duration_ms: 124.5364
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 462.1512
[step 2] execArchive takes any item of the idea, and refuses an archive that exists
$ node --test --test-reporter=tap --test-name-pattern "execArchive takes any item of the idea, and refuses an archive that exists" ../../../build/archive.test.js
TAP version 13
# Subtest: execArchive takes any item of the idea, and refuses an archive that exists
ok 1 - execArchive takes any item of the idea, and refuses an archive that exists
  ---
  duration_ms: 72.7419
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 431.4069
```

## T8 List

- File: <tests/T8 List.md>
- Result: PASS - 2 steps

```text
[step 1] execList prints the columns with the status and open questions of each item
$ node --test --test-reporter=tap --test-name-pattern "execList prints the columns with the status and open questions of each item" ../../../build/list.test.js
TAP version 13
# Subtest: execList prints the columns with the status and open questions of each item
ok 1 - execList prints the columns with the status and open questions of each item
  ---
  duration_ms: 94.4884
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 640.4651
[step 2] execList shows a plan without tasks as NEW, and reports an id used twice
$ node --test --test-reporter=tap --test-name-pattern "execList shows a plan without tasks as NEW, and reports an id used twice" ../../../build/list.test.js
TAP version 13
# Subtest: execList shows a plan without tasks as NEW, and reports an id used twice
ok 1 - execList shows a plan without tasks as NEW, and reports an id used twice
  ---
  duration_ms: 73.9947
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 398.9671
```

## T9 View

- File: <tests/T9 View.md>
- Result: PASS - 1 step

```text
[step 1] execView serves the board in columns, and the documents rendered
$ node --test --test-reporter=tap --test-name-pattern "execView serves the board in columns, and the documents rendered" ../../../build/view.test.js
TAP version 13
# Subtest: execView serves the board in columns, and the documents rendered
ok 1 - execView serves the board in columns, and the documents rendered
  ---
  duration_ms: 162.4358
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 476.6359
```
