# R6 Plan

`board plan <idea> [guidance]` writes `Plans/P<n> <subject>.md`, the plan of the
idea, from an agent: goal, approach, steps and open questions. An idea that has
a plan, or anything but an idea, is refused.

## Implementation

- [T4 Plan][T4]

[T4]: <../tests/T4 Plan.md>

## Coverage

R6 is fully covered by T4.

R6 makes these statements, each covered by T4:

- `board plan <idea> [guidance]` takes an idea and optional guidance. The step
  "execPlan writes the plan of an idea from the agent" calls `execPlan` with
  target `I20` and guidance `keep it simple`. It checks that the prompt names
  the idea file (`The idea: Ideas/I20 Restrict kids internet access.md`) and
  passes the guidance on (`The user asks: keep it simple`). The test calls
  `execPlan` directly, not through the command line. Wiring the `plan` command
  to `execPlan` is the general job of the command-line requirement and T10, so
  it isn't counted as a gap here.
- It writes `Plans/P<n> <subject>.md`. The same step checks that
  `board/Plans/P20 Restrict kids internet access.md` is created, has the agent's
  text, and is reported as `Created Plans/P20 Restrict kids internet access.md`.
- The plan comes from an agent and has a goal, an approach, steps and open
  questions. The same step uses the fake agent and checks that the written file
  is the agent's markdown. It also checks that the prompt asks for the heading
  `# P20 Restrict kids internet access` and for the sections `## Goal`, `##
  Approach`, `## Steps` and `## Open questions`. The fake agent's answer has no
  `## Approach` section. That is acceptable: the requirement says the plan comes
  from the agent, and the test checks that the agent is asked for all four
  parts.
- An idea that already has a plan is refused. The step "execPlan refuses an idea
  with a plan, and anything but an idea" checks that `I19` is rejected with the
  message pointing to `Plans/P19 Track how fresh articles are.md` and `board
  develop P19`.
- Anything but an idea is refused. The same step checks that `T19-1` is rejected
  with "T19-1 is a task; a plan is made from an idea." Only a task is tried, not
  a plan or a result. The code (`plan.ts`) refuses every kind other than an idea
  in one check, so this is enough. If maintainers want it tested explicitly, a
  `P<n>` or `R<n>-<m>` target could be added to the refusal step, but it isn't
  required.

Nothing in R6 is left uncovered.

## Status

- Result: PASS
- Coverage: COMPLETE
