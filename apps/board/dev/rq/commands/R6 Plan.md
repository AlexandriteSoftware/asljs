# R6 Plan

`board plan <idea> [guidance]` writes `Plans/P<n> <subject>.md`, the plan of the
idea, from an agent: goal, approach, steps and open questions. An idea that has
a plan, or anything but an idea, is refused.

## Implementation

- [T4 Plan][T4]

[T4]: <../tests/T4 Plan.md>

## Coverage

R6 is fully covered. It has no sub-requirements, so all of its coverage comes
from its one test, T4, and both of T4's steps run real tests in
`src/plan.test.ts`.

- **`board plan <idea> [guidance]` takes an idea and optional guidance.** The
  first step of T4 calls `execPlan` with the target `I20` and the guidance "keep
  it simple". It checks that the prompt sent to the agent names the idea file
  (`Ideas/I20 Restrict kids internet access.md`) and passes the guidance on
  ("The user asks: keep it simple").
- **It writes `Plans/P<n> <subject>.md` for the idea.** The first step checks
  that `Plans/P20 Restrict kids internet access.md` is created. The number comes
  from the idea (I20 gives P20) and the subject is the idea's. It also checks
  the "Created …" output line.
- **The plan comes from an agent.** The first step uses the fake agent. It
  checks that the file's content is exactly the markdown the agent returned, and
  that the prompt says the agent must not ask the user anything.
- **The plan has a goal, an approach, steps and open questions.** The first step
  checks that the prompt asks for `## Goal`, `## Approach`, `## Steps` and `##
  Open questions`. It also checks that the agent's open question ends up in the
  written file and is counted in the output.
- **An idea that already has a plan is refused.** The second step of T4 checks
  that `I19` is rejected with "I19 already has a plan, Plans/P19 …; develop it
  with board develop P19."
- **Anything but an idea is refused.** The second step checks that the task
  `T19-1` is rejected with "T19-1 is a task; a plan is made from an idea."

There are two small gaps. Neither leaves a statement uncovered:

- **Only a task is tested as a non-idea.** Plans and results are not. If you
  want each kind covered, extend the second step of T4 to also check that a plan
  id (for example `P19`) and a result id are refused.
- **The command-line syntax is not tested directly.** T4 calls `execPlan` with
  the options already split out; it does not parse `board plan <idea>
  [guidance]`. The options match the syntax one to one, but a T4 step that runs
  the CLI would cover the parsing too.

Verdict: every statement of R6 is covered by T4.

## Status

- Result: PASS
- Coverage: COMPLETE
