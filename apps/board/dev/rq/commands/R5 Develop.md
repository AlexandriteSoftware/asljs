# R5 Develop

`board develop <item> [guidance]` has an agent rewrite an idea, plan or task
from it, the documents it belongs with, the user's guidance and answers: more
complete, with the answered questions folded in and the open ones kept, under
the same heading. A result is not developed, and an answer that does not start
with the item's heading is refused.

## Implementation

- [T3 Develop][T3]

[T3]: <../tests/T3 Develop.md>

## Coverage

R5 is fully covered by its one linked test, T3. I checked each statement against
the five steps of T3 and the tests they run.

- **`board develop <item> [guidance]` is the command form.** T3's step "board
  develop takes the item and the guidance" runs `develop T19-2 "say where the
  date goes"` through the CLI. It checks the task is reported as developed and
  that the guidance reaches the agent's prompt.
- **An agent rewrites an idea, a plan or a task.**
  - Idea: the step "execDevelop rewrites an idea from the agent…" covers I20 and
    checks the rewritten file.
  - Plan: the step "execDevelop rewrites a plan with its idea for context"
    covers P19 and checks the rewritten file.
  - Task: T19-2 is developed both in the first step and in the CLI step.
- **It works from the item itself, its documents and the user's guidance.** The
  first step checks four things in the prompt:
  - it names the document itself;
  - it carries the guidance, as "The user asks: …";
  - with no guidance, there is no "The user asks" line;
  - the task's prompt names its idea and its plan. The plan step checks the
    plan's prompt names its idea but no plan.
- **It uses the user's answers.** The answers are nested items inside the item's
  own document, which the prompt names. The first step also checks the prompt
  tells the agent to "fold every answered question into the text".
- **The result is more complete, answered questions are folded in, open ones are
  kept.** The first step checks the prompt contains the folding instruction and
  "keep the questions that are still open, and add the questions you cannot
  settle". It also checks the written idea keeps an `## Open questions` section,
  and that the output counts its two open questions. The agent's actual
  rewriting can't be tested deterministically, so the tests check that the
  prompt asks for it and that the answer is written back.
- **The heading stays the same.** The first step checks the prompt carries the
  exact first line (`# I20 Restrict kids internet access`). The ask.test step
  "toDocument takes the answer, unwrapping a fence, and checks its heading"
  covers the heading check.
- **A result is not developed.** The step "execDevelop refuses a result, a
  document with another heading, and a failed agent" checks R19-1 is refused
  with "R19-1 is a result; develop its task instead".
- **An answer that does not start with the item's heading is refused.** The same
  step has the agent answer `# I21 Something else` for I20. It checks the error
  says the answer "does not start with "# I20"" and that the idea file is
  unchanged. The ask.test step covers the heading check on its own.

Every statement of R5 is covered by T3.

## Status

- Result: PASS
- Coverage: COMPLETE
