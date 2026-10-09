# board-tasks

Use when: carrying out the tasks of a plan, reading their results, unblocking a
task, or archiving an idea that is done.

The documents and their ids are in [Board][BD]; the commands in [Commands][CM].

## Carry them out

Run `board exec P<n>`. It carries out the tasks in order, writes
`Results/R<n>-<m> <subject>.md` for each, and stops at the first that is not
done. The agent may read and edit files and run commands in the board folder, so
read each task first, and run it on a board you trust.

## Read the results

For each result, check its report against the task: the changes it lists exist,
and the task's check holds. Then:

- `DONE` - nothing to do; `board exec` skips the task next time;
- `FAILED` - read why, fix the cause or the task, and run `board exec P<n>`
  again;
- `BLOCKED` - the agent needs you: answer the questions it added to the task's
  `## Open questions`, `  - Answer: <answer>`, or do the part only you can do
  and say so in the answer, then run `board exec P<n>` again. It carries on from
  that task, with the last attempt's result for context.

A result you do not trust is not `DONE`: change its status line to `- Status:
FAILED - <why>` so that the task runs again.

## Archive

When every task is `DONE` and the plan's goal holds, run `board archive I<n>`:
the idea, the plan, the tasks and the results move to `Archive/I<n> <subject>/`.
An idea dropped before it is done is archived the same way.

[BD]: ../docs/Board.md
[CM]: ../docs/Commands.md
