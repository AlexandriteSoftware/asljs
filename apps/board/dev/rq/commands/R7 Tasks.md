# R7 Tasks

`board tasks <plan>` writes the tasks of a plan, `Tasks/T<n>-<m> <subject>.md`
from 1 in the order an agent gives them, one per level 2 heading of its answer.
A plan with tasks, anything but a plan, and an answer without tasks are refused.

## Implementation

- [T5 Tasks][T5]

[T5]: <../tests/T5 Tasks.md>

## Coverage

R7 has three statements, and its only link, T5, covers all of them.

The first statement says `board tasks <plan>` writes a plan's tasks as
`Tasks/T<n>-<m> <subject>.md`, numbered from 1 in the order the agent gives
them. T5's step "execTasks writes the tasks of a plan from the agent, in order"
covers it. The test checks that plan P20 produces `Tasks/T20-1 Set a schedule
tablets.md` and then `Tasks/T20-2 Check it.md`, with the expected content. That
confirms the file name pattern, numbering from 1, and the agent's order.

The second statement says each task comes from one level 2 heading of the
agent's answer. T5's step "readTasks reads a task per level 2 heading, with its
headings a level up" covers it, and the step that writes the tasks also
exercises it end to end.

The third statement says a plan that already has tasks, anything that is not a
plan, and an answer without tasks are all refused. T5's step "execTasks refuses
a plan with tasks, anything but a plan, and an answer without tasks" covers it,
with one rejection assertion for each case.

The test calls `execTasks`, the code behind the `board tasks` command, rather
than running the command line. That is enough to cover the command's behaviour.

Verdict: R7 is fully covered by T5.

## Status

- Result: PASS
- Coverage: COMPLETE
