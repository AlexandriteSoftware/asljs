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

R8 is fully covered by T6. I read the four test steps in T6 together with the
test code they point to, and each statement of R8 is checked by at least one of
them:

- **Tasks run one by one, in order.** The first step (tasks carried out in
  order, skipping done ones) runs T19-2 and then T19-3 for plan P19, and checks
  the order of the output lines.
- **The agent may read and edit files and run commands.** The fourth step
  (detected agent with its model) checks that the agent is started with the
  tools `Read,Grep,Glob,Bash,Edit,Write`. The first step also checks that the
  prompt says "You may read and edit files and run commands".
- **Each result is written as `Results/R<n>-<m> <subject>.md`.** The first step
  checks that `Results/R19-2 Add a review date.md` and `Results/R19-3 Report the
  articles.md` are reported, and checks the whole content of the R19-2 file.
- **The result holds the status: `DONE`, `FAILED` or `BLOCKED`.**
  - `DONE`: the first step checks the result file. The second step (blocked
    task) also reads it from the second run.
  - `FAILED`: the third step (failed task, plan without tasks) checks the result
    file, including the message.
  - `BLOCKED`: the second step reads the status from the result file.
- **The result holds the agent's report.** The first step checks that the
  agent's report appears in the R19-2 result file.
- **Tasks already done are skipped.** The first step checks that T19-1 is listed
  as "DONE … - earlier" and that no agent is run for it.
- **It stops at the first task that is not done.**
  - The second step checks that the output ends right after the blocked T19-2
    and that the exit code is 1.
  - The third step checks that after the failed T19-2 no result is written for
    T19-3.
- **The questions of a blocked task are added to it.** The second step checks
  that the task file now ends with an `## Open questions` section holding the
  agent's question.
- **A later run carries on from that task.** The second step runs exec again.
  The agent answers the prompt about the last attempt's result for R19-2, and
  the step checks that T19-2's result becomes `DONE`.

One small gap that does not leave any statement uncovered: the `BLOCKED` and
`FAILED` result files are not checked for the agent's report text. The `DONE`
case already covers that statement.

I did not modify any file.

## Status

- Result: PASS
- Coverage: COMPLETE
