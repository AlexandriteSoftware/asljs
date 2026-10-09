# E6 rq

- Date: 2026-10-09T15:53:59.256Z
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
  duration_ms: 4.9347
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 336.8062
[step 2] board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote
$ node --test --test-reporter=tap --test-name-pattern "board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote" ../../../build/cli.test.js
TAP version 13
# Subtest: board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote
ok 1 - board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote
  ---
  duration_ms: 341.624
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 675.4267
[step 3] board returns 1 and says why when a command fails
$ node --test --test-reporter=tap --test-name-pattern "board returns 1 and says why when a command fails" ../../../build/cli.test.js
TAP version 13
# Subtest: board returns 1 and says why when a command fails
ok 1 - board returns 1 and says why when a command fails
  ---
  duration_ms: 85.858
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 420.344
[step 4] board --ai runs the named agent with the model
$ node --test --test-reporter=tap --test-name-pattern "board --ai runs the named agent with the model" ../../../build/cli.test.js
TAP version 13
# Subtest: board --ai runs the named agent with the model
ok 1 - board --ai runs the named agent with the model
  ---
  duration_ms: 187.0479
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 482.6085
[step 5] detectAgent picks the first agent whose command runs, claude before copilot
$ node --test --test-reporter=tap --test-name-pattern "detectAgent picks the first agent whose command runs, claude before copilot" ../../../../../libs/mdcli/build/agent.test.js
TAP version 13
# Subtest: detectAgent picks the first agent whose command runs, claude before copilot
ok 1 - detectAgent picks the first agent whose command runs, claude before copilot
  ---
  duration_ms: 2.2348
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 140.8172
[step 6] getCommand takes BOARD_AI_COMMAND, and fails without an agent
$ node --test --test-reporter=tap --test-name-pattern "getCommand takes BOARD_AI_COMMAND, and fails without an agent" ../../../build/ask.test.js
TAP version 13
# Subtest: getCommand takes BOARD_AI_COMMAND, and fails without an agent
ok 1 - getCommand takes BOARD_AI_COMMAND, and fails without an agent
  ---
  duration_ms: 1.4449
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 230.2507
[step 7] execExec runs the detected agent with its model, allowed to edit files and run commands
$ node --test --test-reporter=tap --test-name-pattern "execExec runs the detected agent with its model, allowed to edit files and run commands" ../../../build/exec.test.js
TAP version 13
# Subtest: execExec runs the detected agent with its model, allowed to edit files and run commands
ok 1 - execExec runs the detected agent with its model, allowed to edit files and run commands
  ---
  duration_ms: 176.5225
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 457.8308
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
  duration_ms: 1.741
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 277.5809
[step 2] loadBoard reads the items of each folder, and reports misplaced and duplicate ids
$ node --test --test-reporter=tap --test-name-pattern "loadBoard reads the items of each folder, and reports misplaced and duplicate ids" ../../../build/items.test.js
TAP version 13
# Subtest: loadBoard reads the items of each folder, and reports misplaced and duplicate ids
ok 1 - loadBoard reads the items of each folder, and reports misplaced and duplicate ids
  ---
  duration_ms: 58.3772
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 323.6606
[step 3] findItem takes an id, a .md name or a path, and itemsOf groups an idea
$ node --test --test-reporter=tap --test-name-pattern "findItem takes an id, a \\.md name or a path, and itemsOf groups an idea" ../../../build/items.test.js
TAP version 13
# Subtest: findItem takes an id, a .md name or a path, and itemsOf groups an idea
ok 1 - findItem takes an id, a .md name or a path, and itemsOf groups an idea
  ---
  duration_ms: 41.5729
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 313.739
[step 4] itemPath names a new item, and toFileSubject makes a subject fit a file name
$ node --test --test-reporter=tap --test-name-pattern "itemPath names a new item, and toFileSubject makes a subject fit a file name" ../../../build/items.test.js
TAP version 13
# Subtest: itemPath names a new item, and toFileSubject makes a subject fit a file name
ok 1 - itemPath names a new item, and toFileSubject makes a subject fit a file name
  ---
  duration_ms: 1.2263
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 268.274
[step 5] loadBoard takes the subject from the heading, or from the file name without one
$ node --test --test-reporter=tap --test-name-pattern "loadBoard takes the subject from the heading, or from the file name without one" ../../../build/items.test.js
TAP version 13
# Subtest: loadBoard takes the subject from the heading, or from the file name without one
ok 1 - loadBoard takes the subject from the heading, or from the file name without one
  ---
  duration_ms: 22.1792
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 287.1347
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
  duration_ms: 271.004
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 543.9055
[step 2] execDevelop refuses a result, a document with another heading, and a failed agent
$ node --test --test-reporter=tap --test-name-pattern "execDevelop refuses a result, a document with another heading, and a failed agent" ../../../build/develop.test.js
TAP version 13
# Subtest: execDevelop refuses a result, a document with another heading, and a failed agent
ok 1 - execDevelop refuses a result, a document with another heading, and a failed agent
  ---
  duration_ms: 298.209
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 574.6386
[step 3] execDevelop rewrites a plan with its idea for context
$ node --test --test-reporter=tap --test-name-pattern "execDevelop rewrites a plan with its idea for context" ../../../build/develop.test.js
TAP version 13
# Subtest: execDevelop rewrites a plan with its idea for context
ok 1 - execDevelop rewrites a plan with its idea for context
  ---
  duration_ms: 160.311
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 424.159
[step 4] board develop takes the item and the guidance
$ node --test --test-reporter=tap --test-name-pattern "board develop takes the item and the guidance" ../../../build/cli.test.js
TAP version 13
# Subtest: board develop takes the item and the guidance
ok 1 - board develop takes the item and the guidance
  ---
  duration_ms: 166.8622
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 466.5351
[step 5] toDocument takes the answer, unwrapping a fence, and checks its heading
$ node --test --test-reporter=tap --test-name-pattern "toDocument takes the answer, unwrapping a fence, and checks its heading" ../../../build/ask.test.js
TAP version 13
# Subtest: toDocument takes the answer, unwrapping a fence, and checks its heading
ok 1 - toDocument takes the answer, unwrapping a fence, and checks its heading
  ---
  duration_ms: 1.2703
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 236.482
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
  duration_ms: 167.093
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 432.2379
[step 2] execPlan refuses an idea with a plan, and anything but an idea
$ node --test --test-reporter=tap --test-name-pattern "execPlan refuses an idea with a plan, and anything but an idea" ../../../build/plan.test.js
TAP version 13
# Subtest: execPlan refuses an idea with a plan, and anything but an idea
ok 1 - execPlan refuses an idea with a plan, and anything but an idea
  ---
  duration_ms: 56.9596
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 347.6295
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
  duration_ms: 9.8273
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 288.964
[step 2] execTasks writes the tasks of a plan from the agent, in order
$ node --test --test-reporter=tap --test-name-pattern "execTasks writes the tasks of a plan from the agent, in order" ../../../build/tasks.test.js
TAP version 13
# Subtest: execTasks writes the tasks of a plan from the agent, in order
ok 1 - execTasks writes the tasks of a plan from the agent, in order
  ---
  duration_ms: 177.2678
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 456.8779
[step 3] execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks
$ node --test --test-reporter=tap --test-name-pattern "execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks" ../../../build/tasks.test.js
TAP version 13
# Subtest: execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks
ok 1 - execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks
  ---
  duration_ms: 192.0094
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 479.6432
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
  duration_ms: 313.9586
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 595.2519
[step 2] execExec stops at a blocked task, asks its questions, and runs it again later
$ node --test --test-reporter=tap --test-name-pattern "execExec stops at a blocked task, asks its questions, and runs it again later" ../../../build/exec.test.js
TAP version 13
# Subtest: execExec stops at a blocked task, asks its questions, and runs it again later
ok 1 - execExec stops at a blocked task, asks its questions, and runs it again later
  ---
  duration_ms: 287.0941
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 562.9241
[step 3] execExec stops at a failed task, and refuses a plan without tasks
$ node --test --test-reporter=tap --test-name-pattern "execExec stops at a failed task, and refuses a plan without tasks" ../../../build/exec.test.js
TAP version 13
# Subtest: execExec stops at a failed task, and refuses a plan without tasks
ok 1 - execExec stops at a failed task, and refuses a plan without tasks
  ---
  duration_ms: 203.6882
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 481.1952
[step 4] execExec runs the detected agent with its model, allowed to edit files and run commands
$ node --test --test-reporter=tap --test-name-pattern "execExec runs the detected agent with its model, allowed to edit files and run commands" ../../../build/exec.test.js
TAP version 13
# Subtest: execExec runs the detected agent with its model, allowed to edit files and run commands
ok 1 - execExec runs the detected agent with its model, allowed to edit files and run commands
  ---
  duration_ms: 179.5869
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 458.601
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
  duration_ms: 12.0996
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 253.0266
[step 2] addQuestions adds to the Open questions section, or adds the section
$ node --test --test-reporter=tap --test-name-pattern "addQuestions adds to the Open questions section, or adds the section" ../../../build/questions.test.js
TAP version 13
# Subtest: addQuestions adds to the Open questions section, or adds the section
ok 1 - addQuestions adds to the Open questions section, or adds the section
  ---
  duration_ms: 8.0797
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 241.4649
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
  duration_ms: 55.0653
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 321.378
[step 2] execArchive takes any item of the idea, and refuses an archive that exists
$ node --test --test-reporter=tap --test-name-pattern "execArchive takes any item of the idea, and refuses an archive that exists" ../../../build/archive.test.js
TAP version 13
# Subtest: execArchive takes any item of the idea, and refuses an archive that exists
ok 1 - execArchive takes any item of the idea, and refuses an archive that exists
  ---
  duration_ms: 65.5589
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 333.8352
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
  duration_ms: 83.4099
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 362.153
[step 2] execList shows a plan without tasks as NEW, and reports an id used twice
$ node --test --test-reporter=tap --test-name-pattern "execList shows a plan without tasks as NEW, and reports an id used twice" ../../../build/list.test.js
TAP version 13
# Subtest: execList shows a plan without tasks as NEW, and reports an id used twice
ok 1 - execList shows a plan without tasks as NEW, and reports an id used twice
  ---
  duration_ms: 64.2302
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 339.6948
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
  duration_ms: 151.3746
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 431.2425
```
