# E4 rq

- Date: 2026-10-09T15:39:21.237Z
- Command: `rq test .`
- Result: PASS - 10 of 10 tests passed
- Commit: aacb65725ffa6edb536039b75d2bbfa9b278b73c
- Branch: main
- Changed files:
  - `?? apps/board/dev/rq/`

## T10 Command line

- File: <tests/T10 Command line.md>
- Result: PASS - 5 steps

```text
[step 1] board without arguments prints help with every command
$ node --test --test-reporter=tap --test-name-pattern "board without arguments prints help with every command" ../../../build/cli.test.js
TAP version 13
# Subtest: board without arguments prints help with every command
ok 1 - board without arguments prints help with every command
  ---
  duration_ms: 4.0863
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 287.0122
[step 2] board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote
$ node --test --test-reporter=tap --test-name-pattern "board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote" ../../../build/cli.test.js
TAP version 13
# Subtest: board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote
ok 1 - board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote
  ---
  duration_ms: 291.2193
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 563.7943
[step 3] board returns 1 and says why when a command fails
$ node --test --test-reporter=tap --test-name-pattern "board returns 1 and says why when a command fails" ../../../build/cli.test.js
TAP version 13
# Subtest: board returns 1 and says why when a command fails
ok 1 - board returns 1 and says why when a command fails
  ---
  duration_ms: 77.7832
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 351.7697
[step 4] getCommand takes BOARD_AI_COMMAND, and fails without an agent
$ node --test --test-reporter=tap --test-name-pattern "getCommand takes BOARD_AI_COMMAND, and fails without an agent" ../../../build/ask.test.js
TAP version 13
# Subtest: getCommand takes BOARD_AI_COMMAND, and fails without an agent
ok 1 - getCommand takes BOARD_AI_COMMAND, and fails without an agent
  ---
  duration_ms: 1.3868
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 219.4139
[step 5] execExec runs the detected agent with its model, allowed to edit files and run commands
$ node --test --test-reporter=tap --test-name-pattern "execExec runs the detected agent with its model, allowed to edit files and run commands" ../../../build/exec.test.js
TAP version 13
# Subtest: execExec runs the detected agent with its model, allowed to edit files and run commands
ok 1 - execExec runs the detected agent with its model, allowed to edit files and run commands
  ---
  duration_ms: 170.7817
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 438.3353
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
  duration_ms: 1.5485
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 256.3223
[step 2] loadBoard reads the items of each folder, and reports misplaced and duplicate ids
$ node --test --test-reporter=tap --test-name-pattern "loadBoard reads the items of each folder, and reports misplaced and duplicate ids" ../../../build/items.test.js
TAP version 13
# Subtest: loadBoard reads the items of each folder, and reports misplaced and duplicate ids
ok 1 - loadBoard reads the items of each folder, and reports misplaced and duplicate ids
  ---
  duration_ms: 59.762
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 313.8013
[step 3] findItem takes an id, a .md name or a path, and itemsOf groups an idea
$ node --test --test-reporter=tap --test-name-pattern "findItem takes an id, a \\.md name or a path, and itemsOf groups an idea" ../../../build/items.test.js
TAP version 13
# Subtest: findItem takes an id, a .md name or a path, and itemsOf groups an idea
ok 1 - findItem takes an id, a .md name or a path, and itemsOf groups an idea
  ---
  duration_ms: 44.2272
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 298.9963
[step 4] itemPath names a new item, and toFileSubject makes a subject fit a file name
$ node --test --test-reporter=tap --test-name-pattern "itemPath names a new item, and toFileSubject makes a subject fit a file name" ../../../build/items.test.js
TAP version 13
# Subtest: itemPath names a new item, and toFileSubject makes a subject fit a file name
ok 1 - itemPath names a new item, and toFileSubject makes a subject fit a file name
  ---
  duration_ms: 1.3623
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 259.9201
[step 5] loadBoard takes the subject from the heading, or from the file name without one
$ node --test --test-reporter=tap --test-name-pattern "loadBoard takes the subject from the heading, or from the file name without one" ../../../build/items.test.js
TAP version 13
# Subtest: loadBoard takes the subject from the heading, or from the file name without one
ok 1 - loadBoard takes the subject from the heading, or from the file name without one
  ---
  duration_ms: 22.4576
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 277.9658
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
  duration_ms: 286.163
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 541.1435
[step 2] execDevelop refuses a result, a document with another heading, and a failed agent
$ node --test --test-reporter=tap --test-name-pattern "execDevelop refuses a result, a document with another heading, and a failed agent" ../../../build/develop.test.js
TAP version 13
# Subtest: execDevelop refuses a result, a document with another heading, and a failed agent
ok 1 - execDevelop refuses a result, a document with another heading, and a failed agent
  ---
  duration_ms: 270.6541
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 532.3325
[step 3] execDevelop rewrites a plan with its idea for context
$ node --test --test-reporter=tap --test-name-pattern "execDevelop rewrites a plan with its idea for context" ../../../build/develop.test.js
TAP version 13
# Subtest: execDevelop rewrites a plan with its idea for context
ok 1 - execDevelop rewrites a plan with its idea for context
  ---
  duration_ms: 167.1382
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 426.6916
[step 4] board develop takes the item and the guidance
$ node --test --test-reporter=tap --test-name-pattern "board develop takes the item and the guidance" ../../../build/cli.test.js
TAP version 13
# Subtest: board develop takes the item and the guidance
ok 1 - board develop takes the item and the guidance
  ---
  duration_ms: 158.7084
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 436.1681
[step 5] toDocument takes the answer, unwrapping a fence, and checks its heading
$ node --test --test-reporter=tap --test-name-pattern "toDocument takes the answer, unwrapping a fence, and checks its heading" ../../../build/ask.test.js
TAP version 13
# Subtest: toDocument takes the answer, unwrapping a fence, and checks its heading
ok 1 - toDocument takes the answer, unwrapping a fence, and checks its heading
  ---
  duration_ms: 1.1711
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 226.0268
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
  duration_ms: 155.3453
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 411.5919
[step 2] execPlan refuses an idea with a plan, and anything but an idea
$ node --test --test-reporter=tap --test-name-pattern "execPlan refuses an idea with a plan, and anything but an idea" ../../../build/plan.test.js
TAP version 13
# Subtest: execPlan refuses an idea with a plan, and anything but an idea
ok 1 - execPlan refuses an idea with a plan, and anything but an idea
  ---
  duration_ms: 53.5963
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 308.1039
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
  duration_ms: 11.5724
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 253.8996
[step 2] addQuestions adds to the Open questions section, or adds the section
$ node --test --test-reporter=tap --test-name-pattern "addQuestions adds to the Open questions section, or adds the section" ../../../build/questions.test.js
TAP version 13
# Subtest: addQuestions adds to the Open questions section, or adds the section
ok 1 - addQuestions adds to the Open questions section, or adds the section
  ---
  duration_ms: 7.9635
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 229.4244
```

## T5 Tasks

- File: <tests/T5 Tasks.md>
- Result: PASS - 3 steps

```text
[step 1] readTasks reads a task per level 2 heading
$ node --test --test-reporter=tap --test-name-pattern "readTasks reads a task per level 2 heading" ../../../build/tasks.test.js
TAP version 13
# Subtest: readTasks reads a task per level 2 heading
ok 1 - readTasks reads a task per level 2 heading
  ---
  duration_ms: 9.4688
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 270.0733
[step 2] execTasks writes the tasks of a plan from the agent, in order
$ node --test --test-reporter=tap --test-name-pattern "execTasks writes the tasks of a plan from the agent, in order" ../../../build/tasks.test.js
TAP version 13
# Subtest: execTasks writes the tasks of a plan from the agent, in order
ok 1 - execTasks writes the tasks of a plan from the agent, in order
  ---
  duration_ms: 177.9882
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 431.8705
[step 3] execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks
$ node --test --test-reporter=tap --test-name-pattern "execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks" ../../../build/tasks.test.js
TAP version 13
# Subtest: execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks
ok 1 - execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks
  ---
  duration_ms: 201.656
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 452.769
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
  duration_ms: 273.5783
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 535.0801
[step 2] execExec stops at a blocked task, asks its questions, and runs it again later
$ node --test --test-reporter=tap --test-name-pattern "execExec stops at a blocked task, asks its questions, and runs it again later" ../../../build/exec.test.js
TAP version 13
# Subtest: execExec stops at a blocked task, asks its questions, and runs it again later
ok 1 - execExec stops at a blocked task, asks its questions, and runs it again later
  ---
  duration_ms: 264.6351
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 529.9308
[step 3] execExec stops at a failed task, and refuses a plan without tasks
$ node --test --test-reporter=tap --test-name-pattern "execExec stops at a failed task, and refuses a plan without tasks" ../../../build/exec.test.js
TAP version 13
# Subtest: execExec stops at a failed task, and refuses a plan without tasks
ok 1 - execExec stops at a failed task, and refuses a plan without tasks
  ---
  duration_ms: 206.3553
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 474.008
[step 4] execExec runs the detected agent with its model, allowed to edit files and run commands
$ node --test --test-reporter=tap --test-name-pattern "execExec runs the detected agent with its model, allowed to edit files and run commands" ../../../build/exec.test.js
TAP version 13
# Subtest: execExec runs the detected agent with its model, allowed to edit files and run commands
ok 1 - execExec runs the detected agent with its model, allowed to edit files and run commands
  ---
  duration_ms: 165.3612
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 422.7735
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
  duration_ms: 54.467
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 308.3777
[step 2] execArchive takes any item of the idea, and refuses an archive that exists
$ node --test --test-reporter=tap --test-name-pattern "execArchive takes any item of the idea, and refuses an archive that exists" ../../../build/archive.test.js
TAP version 13
# Subtest: execArchive takes any item of the idea, and refuses an archive that exists
ok 1 - execArchive takes any item of the idea, and refuses an archive that exists
  ---
  duration_ms: 64.0485
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 315.1184
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
  duration_ms: 86.4451
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 344.9491
[step 2] execList shows a plan without tasks as NEW, and reports an id used twice
$ node --test --test-reporter=tap --test-name-pattern "execList shows a plan without tasks as NEW, and reports an id used twice" ../../../build/list.test.js
TAP version 13
# Subtest: execList shows a plan without tasks as NEW, and reports an id used twice
ok 1 - execList shows a plan without tasks as NEW, and reports an id used twice
  ---
  duration_ms: 75.4677
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 337.6998
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
  duration_ms: 138.1527
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 402.1827
```
