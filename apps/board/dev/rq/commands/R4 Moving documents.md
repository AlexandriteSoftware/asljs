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

Every statement in R4 is covered by a linked requirement or test.

- **`plan`, `tasks` and `exec` write the next column's documents.** R6 covers
  `plan` writing `Plans/P<n> <subject>.md`. R7 covers `tasks` writing
  `Tasks/T<n>-<m> <subject>.md`. R8 covers `exec` writing `Results/R<n>-<m>
  <subject>.md`. T4, T5 and T6 test these.
- **`develop` elaborates a document in its column.** R5 covers rewriting an
  idea, plan or task under the same heading, and T3 tests it.
- **`archive` takes an idea and what came of it off the board.** R9 covers
  moving the idea with its plan, tasks and results to `Archive/I<n> <subject>/`.
- **`list` and `view` show the board.** R10 covers `list` and R13 covers `view`.
- **`develop`, `plan`, `tasks` and `exec` ask an AI agent.** R5, R6, R7 and R8
  each state that the command uses an agent. T3, T4, T5 and T6 run each command
  against the fake agent. T6 also checks that `exec` runs the detected agent
  with permission to edit files and run commands.
- **The agent is told not to ask the user anything.** None of R5 to R8 states
  this. The linked tests do check it: each asserts that the prompt contains
  "Nobody answers while you work: do not ask the user anything." T3 checks it in
  its first step, T4 in its first step and T5 in its "execTasks writes the tasks
  of a plan from the agent" step. T6 checks it in its `exec` prompt.
- **What the agent cannot settle goes to a document's `## Open questions`.** R6
  lists open questions as part of the plan. R5 keeps the open questions and adds
  the ones the agent cannot settle. R8 adds a blocked task's questions to the
  task. T3 checks the prompt tells the agent to add questions it cannot settle.
  T4 checks the written plan keeps its `## Open questions`. T6 checks that a
  blocked task's questions are added to it.
- **Questions are answered in the file before the command runs again.** R5 folds
  the answered questions into the rewrite, and T3 checks the prompt says to fold
  in every answered question. R8 says a later run carries on from the blocked
  task. T6 checks the blocked task is run again after its questions are added.

One weak spot: the "do not ask the user" rule is covered only by tests, not by
any sub-requirement. It is still covered, so this is optional. If you want it
stated as a requirement too, add it to R5 to R8 or add a small sub-requirement
such as "the agent's prompt tells it not to ask the user anything, and to put
what it cannot settle in `## Open questions`".

Verdict: R4 is fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
