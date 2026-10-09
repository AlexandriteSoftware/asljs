# R8 Exec

`board exec <plan>` carries out the plan's tasks one by one, in order, with an
agent that may read and edit files and run commands, and writes each result,
`Results/R<n>-<m> <subject>.md`, with its status - `DONE`, `FAILED` or
`BLOCKED` - and the agent's report. It skips tasks already done, and stops at
the first that is not; the questions of a blocked task are added to it, and a
later run carries on from that task.

## Implementation

- [T6 Exec][T6]

[T6]: <../tests/T6 Exec.md>

## Coverage

I checked R8 against T6 and the tests in `apps/board/src/exec.test.ts` that T6's
four steps point to. Every statement of R8 is covered by at least one of them:

- **The command carries out the plan's tasks one by one, in order.** Covered by
  the T6 step "carries out the tasks in order, skipping done ones, and writes
  their results". T19-2 runs before T19-3, the output lists them in that order,
  and the prompt for T19-3 lists R19-1 and R19-2 as done earlier.
- **The agent may read and edit files and run commands.** Covered by the T6 step
  "runs the detected agent with its model, allowed to edit files and run
  commands". It checks that the agent gets `--allowedTools
  Read,Grep,Glob,Bash,Edit,Write`. The first T6 step also checks that the prompt
  says "You may read and edit files and run commands".
- **Each result is written as `Results/R<n>-<m> <subject>.md`, with its status
  and the agent's report.**
  - DONE is covered by the first T6 step. It checks the full content of
    `Results/R19-2 Add a review date.md`: status DONE, the link to the task, and
    the agent's report.
  - FAILED is covered by the step "stops at a failed task, and refuses a plan
    without tasks". It checks the full content of R19-2 with status FAILED and
    the agent's message.
  - BLOCKED is covered by the step "stops at a blocked task, asks its questions,
    and runs it again later". It checks that the result file is written with
    status BLOCKED.
- **Tasks already done are skipped.** Covered by the first T6 step: T19-1, which
  already has a result, is reported as "DONE … - earlier" and is not run again.
- **The run stops at the first task that is not done.** Covered by the
  failed-task step: after T19-2 fails, the exit code is 1 and R19-3 is never
  written. The blocked-task step also ends with exit code 1.
- **A blocked task's questions are added to it.** Covered by the blocked-task
  step. The task file gets an `## Open questions` section containing "Which
  folder holds the articles?".
- **A later run carries on from that task.** Covered by the blocked-task step. A
  second run gives the agent R19-2 as "the result of the last attempt", the exit
  code is 0, and R19-2 is rewritten with status DONE.

Fully covered: no test, sub-requirement or link needs to be added.

## Status

- Result: PASS
- Coverage: COMPLETE
