# E2 rq

- Date: 2026-10-09T15:25:50.428Z
- Command: `rq test .`
- Result: PASS - 10 of 10 tests passed
- Commit: aacb65725ffa6edb536039b75d2bbfa9b278b73c
- Branch: main
- Changed files:
  - `?? apps/board/dev/rq/`

## T10 Command line

- File: <tests/T10 Command line.md>
- Result: PASS - 4 steps

```text
[step 1] board without arguments prints help with every command
$ node --test --test-reporter=tap --test-name-pattern "board without arguments prints help with every command" ../../../build/cli.test.js
TAP version 13
# Subtest: board without arguments prints help with every command
ok 1 - board without arguments prints help with every command
  ---
  duration_ms: 4.8981
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 320.4408
[step 2] board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote
$ node --test --test-reporter=tap --test-name-pattern "board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote" ../../../build/cli.test.js
TAP version 13
# Subtest: board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote
ok 1 - board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote
  ---
  duration_ms: 347.2465
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 668.0241
[step 3] board returns 1 and says why when a command fails
$ node --test --test-reporter=tap --test-name-pattern "board returns 1 and says why when a command fails" ../../../build/cli.test.js
TAP version 13
# Subtest: board returns 1 and says why when a command fails
ok 1 - board returns 1 and says why when a command fails
  ---
  duration_ms: 80.4951
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 390.7016
[step 4] getCommand takes BOARD_AI_COMMAND, and fails without an agent
$ node --test --test-reporter=tap --test-name-pattern "getCommand takes BOARD_AI_COMMAND, and fails without an agent" ../../../build/ask.test.js
TAP version 13
# Subtest: getCommand takes BOARD_AI_COMMAND, and fails without an agent
ok 1 - getCommand takes BOARD_AI_COMMAND, and fails without an agent
  ---
  duration_ms: 1.3266
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 229.1055
```

## T1 Documents and ids

- File: <tests/T1 Documents and ids.md>
- Result: PASS - 4 steps

```text
[step 1] parseId and getItemId read ideas, plans, tasks and results
$ node --test --test-reporter=tap --test-name-pattern "parseId and getItemId read ideas, plans, tasks and results" ../../../build/items.test.js
TAP version 13
# Subtest: parseId and getItemId read ideas, plans, tasks and results
ok 1 - parseId and getItemId read ideas, plans, tasks and results
  ---
  duration_ms: 1.8725
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 260.7136
[step 2] loadBoard reads the items of each folder, and reports misplaced and duplicate ids
$ node --test --test-reporter=tap --test-name-pattern "loadBoard reads the items of each folder, and reports misplaced and duplicate ids" ../../../build/items.test.js
TAP version 13
# Subtest: loadBoard reads the items of each folder, and reports misplaced and duplicate ids
ok 1 - loadBoard reads the items of each folder, and reports misplaced and duplicate ids
  ---
  duration_ms: 57.2752
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 313.1153
[step 3] findItem takes an id, a .md name or a path, and itemsOf groups an idea
$ node --test --test-reporter=tap --test-name-pattern "findItem takes an id, a \\.md name or a path, and itemsOf groups an idea" ../../../build/items.test.js
TAP version 13
# Subtest: findItem takes an id, a .md name or a path, and itemsOf groups an idea
ok 1 - findItem takes an id, a .md name or a path, and itemsOf groups an idea
  ---
  duration_ms: 42.9974
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 306.1302
[step 4] itemPath names a new item, and toFileSubject makes a subject fit a file name
$ node --test --test-reporter=tap --test-name-pattern "itemPath names a new item, and toFileSubject makes a subject fit a file name" ../../../build/items.test.js
TAP version 13
# Subtest: itemPath names a new item, and toFileSubject makes a subject fit a file name
ok 1 - itemPath names a new item, and toFileSubject makes a subject fit a file name
  ---
  duration_ms: 1.3992
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 255.4737
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
  duration_ms: 12.6571
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 235.1075
[step 2] addQuestions adds to the Open questions section, or adds the section
$ node --test --test-reporter=tap --test-name-pattern "addQuestions adds to the Open questions section, or adds the section" ../../../build/questions.test.js
TAP version 13
# Subtest: addQuestions adds to the Open questions section, or adds the section
ok 1 - addQuestions adds to the Open questions section, or adds the section
  ---
  duration_ms: 7.7715
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 226.6348
```

## T3 Develop

- File: <tests/T3 Develop.md>
- Result: PASS - 3 steps

```text
[step 1] execDevelop rewrites an idea from the agent, with the guidance and the related documents
$ node --test --test-reporter=tap --test-name-pattern "execDevelop rewrites an idea from the agent, with the guidance and the related documents" ../../../build/develop.test.js
TAP version 13
# Subtest: execDevelop rewrites an idea from the agent, with the guidance and the related documents
ok 1 - execDevelop rewrites an idea from the agent, with the guidance and the related documents
  ---
  duration_ms: 276.0474
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 532.3546
[step 2] execDevelop refuses a result, a document with another heading, and a failed agent
$ node --test --test-reporter=tap --test-name-pattern "execDevelop refuses a result, a document with another heading, and a failed agent" ../../../build/develop.test.js
TAP version 13
# Subtest: execDevelop refuses a result, a document with another heading, and a failed agent
ok 1 - execDevelop refuses a result, a document with another heading, and a failed agent
  ---
  duration_ms: 266.694
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 524.3633
[step 3] toDocument takes the answer, unwrapping a fence, and checks its heading
$ node --test --test-reporter=tap --test-name-pattern "toDocument takes the answer, unwrapping a fence, and checks its heading" ../../../build/ask.test.js
TAP version 13
# Subtest: toDocument takes the answer, unwrapping a fence, and checks its heading
ok 1 - toDocument takes the answer, unwrapping a fence, and checks its heading
  ---
  duration_ms: 1.2618
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 220.2319
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
  duration_ms: 157.1236
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 419.51
[step 2] execPlan refuses an idea with a plan, and anything but an idea
$ node --test --test-reporter=tap --test-name-pattern "execPlan refuses an idea with a plan, and anything but an idea" ../../../build/plan.test.js
TAP version 13
# Subtest: execPlan refuses an idea with a plan, and anything but an idea
ok 1 - execPlan refuses an idea with a plan, and anything but an idea
  ---
  duration_ms: 52.717
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 318.4765
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
  duration_ms: 9.6876
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 275.2517
[step 2] execTasks writes the tasks of a plan from the agent, in order
$ node --test --test-reporter=tap --test-name-pattern "execTasks writes the tasks of a plan from the agent, in order" ../../../build/tasks.test.js
TAP version 13
# Subtest: execTasks writes the tasks of a plan from the agent, in order
ok 1 - execTasks writes the tasks of a plan from the agent, in order
  ---
  duration_ms: 172.4928
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 442.9176
[step 3] execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks
$ node --test --test-reporter=tap --test-name-pattern "execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks" ../../../build/tasks.test.js
TAP version 13
# Subtest: execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks
ok 1 - execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks
  ---
  duration_ms: 179.0202
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 442.2439
```

## T6 Exec

- File: <tests/T6 Exec.md>
- Result: PASS - 3 steps

```text
[step 1] execExec carries out the tasks in order, skipping done ones, and writes their results
$ node --test --test-reporter=tap --test-name-pattern "execExec carries out the tasks in order, skipping done ones, and writes their results" ../../../build/exec.test.js
TAP version 13
# Subtest: execExec carries out the tasks in order, skipping done ones, and writes their results
ok 1 - execExec carries out the tasks in order, skipping done ones, and writes their results
  ---
  duration_ms: 264.1318
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 525.818
[step 2] execExec stops at a blocked task, asks its questions, and runs it again later
$ node --test --test-reporter=tap --test-name-pattern "execExec stops at a blocked task, asks its questions, and runs it again later" ../../../build/exec.test.js
TAP version 13
# Subtest: execExec stops at a blocked task, asks its questions, and runs it again later
ok 1 - execExec stops at a blocked task, asks its questions, and runs it again later
  ---
  duration_ms: 272.6715
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 535.3257
[step 3] execExec stops at a failed task, and refuses a plan without tasks
$ node --test --test-reporter=tap --test-name-pattern "execExec stops at a failed task, and refuses a plan without tasks" ../../../build/exec.test.js
TAP version 13
# Subtest: execExec stops at a failed task, and refuses a plan without tasks
ok 1 - execExec stops at a failed task, and refuses a plan without tasks
  ---
  duration_ms: 218.2247
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 481.5751
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
  duration_ms: 52.6155
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 321.8202
[step 2] execArchive takes any item of the idea, and refuses an archive that exists
$ node --test --test-reporter=tap --test-name-pattern "execArchive takes any item of the idea, and refuses an archive that exists" ../../../build/archive.test.js
TAP version 13
# Subtest: execArchive takes any item of the idea, and refuses an archive that exists
ok 1 - execArchive takes any item of the idea, and refuses an archive that exists
  ---
  duration_ms: 62.6945
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 324.3282
```

## T8 List

- File: <tests/T8 List.md>
- Result: PASS - 1 step

```text
[step 1] execList prints the columns with the status and open questions of each item
$ node --test --test-reporter=tap --test-name-pattern "execList prints the columns with the status and open questions of each item" ../../../build/list.test.js
TAP version 13
# Subtest: execList prints the columns with the status and open questions of each item
ok 1 - execList prints the columns with the status and open questions of each item
  ---
  duration_ms: 70.4672
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 340.5569
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
  duration_ms: 113.5924
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 406.2809
```
