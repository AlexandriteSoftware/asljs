# R4 Moving documents

The commands move documents through the columns: `plan`, `tasks` and `exec`
write the next column's documents, `develop` elaborates a document in its
column, `archive` takes an idea and what came of it off the board, and `list`
and `view` show it. `develop`, `plan`, `tasks` and `exec` ask an AI agent, which
is told not to ask the user anything: what it cannot settle goes to a document's
`## Open questions`, answered in the file before the command runs again.

## Implementation

- [R5 Develop][R5]
- [R6 Plan][R6]
- [R7 Tasks][R7]
- [R8 Exec][R8]
- [R9 Archive][R9]
- [R10 List][R10]
- [R13 View][R13]
- [T3 Develop][T3]
- [T4 Plan][T4]
- [T5 Tasks][T5]
- [T6 Exec][T6]

[R5]: <R5 Develop.md>
[R6]: <R6 Plan.md>
[R7]: <R7 Tasks.md>
[R8]: <R8 Exec.md>
[R9]: <R9 Archive.md>
[R10]: <R10 List.md>
[R13]: <R13 View.md>
[T3]: <../tests/T3 Develop.md>
[T4]: <../tests/T4 Plan.md>
[T5]: <../tests/T5 Tasks.md>
[T6]: <../tests/T6 Exec.md>

## Coverage

R4 is fully covered by what it links to. Each statement and what covers it:

- **`plan`, `tasks` and `exec` write the next column's documents.** R6 covers
  `plan`, which writes `Plans/P<n> <subject>.md` from an idea. R7 covers
  `tasks`, which writes `Tasks/T<n>-<m> <subject>.md` from a plan. R8 covers
  `exec`, which writes `Results/R<n>-<m> <subject>.md` for each task. The tests
  are T4 ("execPlan writes the plan of an idea from the agent"), T5 ("execTasks
  writes the tasks of a plan from the agent, in order") and T6 ("execExec
  carries out the tasks in order, skipping done ones, and writes their
  results").
- **`develop` elaborates a document in its column.** R5 says the agent rewrites
  an idea, plan or task under the same heading. T3 checks this with "execDevelop
  rewrites an idea from the agent…", "execDevelop rewrites a plan with its idea
  for context" and "toDocument … checks its heading".
- **`archive` takes an idea and what came of it off the board.** R9 says it
  moves the idea, its plan, tasks and results to `Archive/I<n> <subject>/`.
- **`list` and `view` show the board.** R10 covers `list`, which prints the
  documents column by column with status and open questions. R13 covers `view`,
  which serves the columns and cards in a browser.
- **`develop`, `plan`, `tasks` and `exec` ask an AI agent.** R5, R6, R7 and R8
  each describe their command as working from an agent. T3, T4, T5 and T6 test
  each one with the fake agent. T6's "execExec runs the detected agent with its
  model, allowed to edit files and run commands" also covers how the agent is
  chosen for `exec`.
- **The agent is told not to ask the user anything.** None of the linked
  requirements says this. The steps of T3, T4, T5 and T6 do check it: the tests
  behind them (`develop.test.ts`, `plan.test.ts`, `tasks.test.ts` and
  `exec.test.ts`) each assert that the prompt contains "Nobody answers while you
  work: do not ask the user anything." So all four agent commands are covered by
  their tests.
- **What the agent cannot settle goes to a document's `## Open questions`.** R6
  says a plan includes open questions. R5 says the open questions are kept. R8
  says a blocked task's questions are added to the task. T4's plan test expects
  an `## Open questions` section in the written plan. T5's "readTasks reads a
  task per level 2 heading, with its headings a level up" turns a task's `###
  Open questions` into that task's `## Open questions`. T6's "execExec stops at
  a blocked task, asks its questions, and runs it again later" checks that the
  questions are added to the task.
- **The questions are answered in the file before the command runs again.** R5
  says answered questions are folded in on the next `develop`. R8 says a later
  run carries on from the blocked task. T6's blocked-task test runs that task
  again. T3's develop test rewrites from the document as it is in the file,
  answers included.

One possible improvement, not needed for coverage: the "told not to ask the
user" rule is only covered through test assertions. A sentence in R5–R8, or a
link from R4 to R3, would make the requirements themselves state it.

Verdict: every statement of R4 is covered by its linked sub-requirements and
tests.

## Status

- Result: PASS
- Coverage: COMPLETE
