# E5 rq

- Date: 2026-10-09T15:48:09.836Z
- Command: `rq test .`
- Result: PASS - 10 of 10 tests passed
- Commit: aacb65725ffa6edb536039b75d2bbfa9b278b73c
- Branch: main
- Changed files:
  - `?? apps/board/dev/rq/`

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
  duration_ms: 3.9668
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 282.2003
[step 2] board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote
$ node --test --test-reporter=tap --test-name-pattern "board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote" ../../../build/cli.test.js
TAP version 13
# Subtest: board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote
ok 1 - board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote
  ---
  duration_ms: 275.7794
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 555.696
[step 3] board returns 1 and says why when a command fails
$ node --test --test-reporter=tap --test-name-pattern "board returns 1 and says why when a command fails" ../../../build/cli.test.js
TAP version 13
# Subtest: board returns 1 and says why when a command fails
ok 1 - board returns 1 and says why when a command fails
  ---
  duration_ms: 79.4382
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 355.4543
[step 4] board --ai runs the named agent with the model
$ node --test --test-reporter=tap --test-name-pattern "board --ai runs the named agent with the model" ../../../build/cli.test.js
TAP version 13
# Subtest: board --ai runs the named agent with the model
ok 1 - board --ai runs the named agent with the model
  ---
  duration_ms: 176.0038
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 453.9645
[step 5] detectAgent picks the first agent whose command runs, claude before copilot
$ node --test --test-reporter=tap --test-name-pattern "detectAgent picks the first agent whose command runs, claude before copilot" ../../../../../libs/mdcli/build/agent.test.js
TAP version 13
# Subtest: detectAgent picks the first agent whose command runs, claude before copilot
ok 1 - detectAgent picks the first agent whose command runs, claude before copilot
  ---
  duration_ms: 1.7688
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 133.6154
[step 6] getCommand takes BOARD_AI_COMMAND, and fails without an agent
$ node --test --test-reporter=tap --test-name-pattern "getCommand takes BOARD_AI_COMMAND, and fails without an agent" ../../../build/ask.test.js
TAP version 13
# Subtest: getCommand takes BOARD_AI_COMMAND, and fails without an agent
ok 1 - getCommand takes BOARD_AI_COMMAND, and fails without an agent
  ---
  duration_ms: 1.3617
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 220.1338
[step 7] execExec runs the detected agent with its model, allowed to edit files and run commands
$ node --test --test-reporter=tap --test-name-pattern "execExec runs the detected agent with its model, allowed to edit files and run commands" ../../../build/exec.test.js
TAP version 13
# Subtest: execExec runs the detected agent with its model, allowed to edit files and run commands
ok 1 - execExec runs the detected agent with its model, allowed to edit files and run commands
  ---
  duration_ms: 172.1289
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 430.9139
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
  duration_ms: 1.6096
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 251.9345
[step 2] loadBoard reads the items of each folder, and reports misplaced and duplicate ids
$ node --test --test-reporter=tap --test-name-pattern "loadBoard reads the items of each folder, and reports misplaced and duplicate ids" ../../../build/items.test.js
TAP version 13
# Subtest: loadBoard reads the items of each folder, and reports misplaced and duplicate ids
ok 1 - loadBoard reads the items of each folder, and reports misplaced and duplicate ids
  ---
  duration_ms: 74.9384
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 328.0051
[step 3] findItem takes an id, a .md name or a path, and itemsOf groups an idea
$ node --test --test-reporter=tap --test-name-pattern "findItem takes an id, a \\.md name or a path, and itemsOf groups an idea" ../../../build/items.test.js
TAP version 13
# Subtest: findItem takes an id, a .md name or a path, and itemsOf groups an idea
ok 1 - findItem takes an id, a .md name or a path, and itemsOf groups an idea
  ---
  duration_ms: 43.2984
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 302.9777
[step 4] itemPath names a new item, and toFileSubject makes a subject fit a file name
$ node --test --test-reporter=tap --test-name-pattern "itemPath names a new item, and toFileSubject makes a subject fit a file name" ../../../build/items.test.js
TAP version 13
# Subtest: itemPath names a new item, and toFileSubject makes a subject fit a file name
ok 1 - itemPath names a new item, and toFileSubject makes a subject fit a file name
  ---
  duration_ms: 1.1366
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 254.9218
[step 5] loadBoard takes the subject from the heading, or from the file name without one
$ node --test --test-reporter=tap --test-name-pattern "loadBoard takes the subject from the heading, or from the file name without one" ../../../build/items.test.js
TAP version 13
# Subtest: loadBoard takes the subject from the heading, or from the file name without one
ok 1 - loadBoard takes the subject from the heading, or from the file name without one
  ---
  duration_ms: 24.4663
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 282.8759
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
  duration_ms: 261.6794
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 525.7113
[step 2] execDevelop refuses a result, a document with another heading, and a failed agent
$ node --test --test-reporter=tap --test-name-pattern "execDevelop refuses a result, a document with another heading, and a failed agent" ../../../build/develop.test.js
TAP version 13
# Subtest: execDevelop refuses a result, a document with another heading, and a failed agent
ok 1 - execDevelop refuses a result, a document with another heading, and a failed agent
  ---
  duration_ms: 273.3757
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 540.9327
[step 3] execDevelop rewrites a plan with its idea for context
$ node --test --test-reporter=tap --test-name-pattern "execDevelop rewrites a plan with its idea for context" ../../../build/develop.test.js
TAP version 13
# Subtest: execDevelop rewrites a plan with its idea for context
ok 1 - execDevelop rewrites a plan with its idea for context
  ---
  duration_ms: 156.8406
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 421.6524
[step 4] board develop takes the item and the guidance
$ node --test --test-reporter=tap --test-name-pattern "board develop takes the item and the guidance" ../../../build/cli.test.js
TAP version 13
# Subtest: board develop takes the item and the guidance
ok 1 - board develop takes the item and the guidance
  ---
  duration_ms: 167.9358
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 462.833
[step 5] toDocument takes the answer, unwrapping a fence, and checks its heading
$ node --test --test-reporter=tap --test-name-pattern "toDocument takes the answer, unwrapping a fence, and checks its heading" ../../../build/ask.test.js
TAP version 13
# Subtest: toDocument takes the answer, unwrapping a fence, and checks its heading
ok 1 - toDocument takes the answer, unwrapping a fence, and checks its heading
  ---
  duration_ms: 1.3741
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 243.3286
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
  duration_ms: 167.6249
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 442.6299
[step 2] execPlan refuses an idea with a plan, and anything but an idea
$ node --test --test-reporter=tap --test-name-pattern "execPlan refuses an idea with a plan, and anything but an idea" ../../../build/plan.test.js
TAP version 13
# Subtest: execPlan refuses an idea with a plan, and anything but an idea
ok 1 - execPlan refuses an idea with a plan, and anything but an idea
  ---
  duration_ms: 55.0565
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 341.5767
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
  duration_ms: 9.5925
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 280.3833
[step 2] execTasks writes the tasks of a plan from the agent, in order
$ node --test --test-reporter=tap --test-name-pattern "execTasks writes the tasks of a plan from the agent, in order" ../../../build/tasks.test.js
TAP version 13
# Subtest: execTasks writes the tasks of a plan from the agent, in order
ok 1 - execTasks writes the tasks of a plan from the agent, in order
  ---
  duration_ms: 191.5812
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 477.0279
[step 3] execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks
$ node --test --test-reporter=tap --test-name-pattern "execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks" ../../../build/tasks.test.js
TAP version 13
# Subtest: execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks
ok 1 - execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks
  ---
  duration_ms: 198.2046
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 484.5427
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
  duration_ms: 292.0028
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 579.623
[step 2] execExec stops at a blocked task, asks its questions, and runs it again later
$ node --test --test-reporter=tap --test-name-pattern "execExec stops at a blocked task, asks its questions, and runs it again later" ../../../build/exec.test.js
TAP version 13
# Subtest: execExec stops at a blocked task, asks its questions, and runs it again later
ok 1 - execExec stops at a blocked task, asks its questions, and runs it again later
  ---
  duration_ms: 296.0462
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 583.2133
[step 3] execExec stops at a failed task, and refuses a plan without tasks
$ node --test --test-reporter=tap --test-name-pattern "execExec stops at a failed task, and refuses a plan without tasks" ../../../build/exec.test.js
TAP version 13
# Subtest: execExec stops at a failed task, and refuses a plan without tasks
ok 1 - execExec stops at a failed task, and refuses a plan without tasks
  ---
  duration_ms: 198.1203
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 475.584
[step 4] execExec runs the detected agent with its model, allowed to edit files and run commands
$ node --test --test-reporter=tap --test-name-pattern "execExec runs the detected agent with its model, allowed to edit files and run commands" ../../../build/exec.test.js
TAP version 13
# Subtest: execExec runs the detected agent with its model, allowed to edit files and run commands
ok 1 - execExec runs the detected agent with its model, allowed to edit files and run commands
  ---
  duration_ms: 181.8986
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 470.9641
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
  duration_ms: 12.0937
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 251.8318
[step 2] addQuestions adds to the Open questions section, or adds the section
$ node --test --test-reporter=tap --test-name-pattern "addQuestions adds to the Open questions section, or adds the section" ../../../build/questions.test.js
TAP version 13
# Subtest: addQuestions adds to the Open questions section, or adds the section
ok 1 - addQuestions adds to the Open questions section, or adds the section
  ---
  duration_ms: 8.4708
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 253.3133
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
  duration_ms: 54.5149
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 331.7925
[step 2] execArchive takes any item of the idea, and refuses an archive that exists
$ node --test --test-reporter=tap --test-name-pattern "execArchive takes any item of the idea, and refuses an archive that exists" ../../../build/archive.test.js
TAP version 13
# Subtest: execArchive takes any item of the idea, and refuses an archive that exists
ok 1 - execArchive takes any item of the idea, and refuses an archive that exists
  ---
  duration_ms: 62.9925
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 341.5504
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
  duration_ms: 85.2408
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 363.2826
[step 2] execList shows a plan without tasks as NEW, and reports an id used twice
$ node --test --test-reporter=tap --test-name-pattern "execList shows a plan without tasks as NEW, and reports an id used twice" ../../../build/list.test.js
TAP version 13
# Subtest: execList shows a plan without tasks as NEW, and reports an id used twice
ok 1 - execList shows a plan without tasks as NEW, and reports an id used twice
  ---
  duration_ms: 63.9199
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 344.4321
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
  duration_ms: 153.9824
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 436.028
```
