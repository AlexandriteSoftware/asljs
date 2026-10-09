# R7 Tasks

`board tasks <plan>` writes the tasks of a plan, `Tasks/T<n>-<m> <subject>.md`
from 1 in the order an agent gives them, one per level 2 heading of its answer.
A plan with tasks, anything but a plan, and an answer without tasks are refused.

## Implementation

- [T5 Tasks][T5]

[T5]: <../tests/T5 Tasks.md>

## Coverage

R7 makes four statements, and T5's three steps cover all of them. I checked each
step against the test it runs in `src/tasks.test.ts`.

- **`board tasks <plan>` writes the tasks of a plan as `Tasks/T<n>-<m>
  <subject>.md`.** Covered by T5, step "execTasks writes the tasks of a plan
  from the agent, in order". For plan P20 it checks that the output is `Created
  Tasks/T20-1 Set a schedule tablets.md` and `Created Tasks/T20-2 Check it.md`.
  It also reads back the first file, `# T20-1 Set a schedule: tablets` with its
  body. So the folder, the `T<n>-<m>` id taken from the plan's number, and the
  subject in the file name are all checked.
- **Numbered from 1, in the order the agent gives them.** Covered by the same
  step: the agent's two tasks become `T20-1` and `T20-2`, in the order they
  appear in its answer.
- **One task per level 2 heading of the answer.** Covered by T5, step "readTasks
  reads a task per level 2 heading, with its headings a level up". It checks
  that each level 2 heading starts a task, that deeper headings move up a level
  inside the task body, that an empty level 2 heading and the text around the
  headings are ignored, and that only two tasks come out. The execTasks step
  confirms this end to end: two headings in the answer give two files.
- **A plan with tasks, anything but a plan, and an answer without tasks are
  refused.** Covered by T5, step "execTasks refuses a plan with tasks, anything
  but a plan, and an answer without tasks". It checks three rejections: P19
  "already has 2 tasks"; I20 "is an idea; tasks are made from a plan."; and P20,
  whose agent answer has no level 2 heading, "The agent wrote no task".

One small point: T5 calls `execTasks` directly rather than going through the
`board tasks` command line. That doesn't leave a gap, because `execTasks` is the
command's implementation. Checking how the command line connects to it belongs
to the command-line test, T10.

R7 is fully covered by T5.

## Status

- Result: PASS
- Coverage: COMPLETE
