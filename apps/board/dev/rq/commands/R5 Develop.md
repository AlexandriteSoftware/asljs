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

The requirement R5 is fully covered by its test T3. I checked each statement
against the test steps and the test code they run (`develop.test.ts`,
`cli.test.ts`).

The command `board develop <item> [guidance]` takes the item and the guidance
from the command line. The step "board develop takes the item and the guidance"
in T3 covers it: it runs the command with `T19-2` and a guidance text, and
checks that it succeeds and reports the developed task.

"has an agent rewrite an idea, plan or task" is covered by three steps of T3,
one for each kind:

- "execDevelop rewrites an idea from the agent, with the guidance and the
  related documents" rewrites idea I20 and checks the file written from the
  agent's answer. It also develops task T19-2.
- "execDevelop rewrites a plan with its idea for context" rewrites plan P19 and
  checks the file written.
- "board develop takes the item and the guidance" develops task T19-2.

"from it, the documents it belongs with, the user's guidance and answers" is
covered by two steps:

- The idea step checks that the prompt names the item's own document. That
  document holds its questions and their answers. When there is guidance, the
  prompt contains "The user asks: …". When there is none, it does not.
- For task T19-2, the prompt names its idea and its plan. The plan step checks
  that plan P19's prompt names its idea and no plan.

"more complete, with the answered questions folded in and the open ones kept" is
covered by the idea step. It checks that the prompt tells the agent to fold
every answered question into the text and to keep the questions that are still
open. It also checks that the written document keeps its `## Open questions`,
and that the output counts them ("2 open questions"). This is the agent's job,
so the test checks what the agent is told rather than how well it rewrites,
which is the right level for a fake agent.

"under the same heading" is covered by two steps. The idea step checks that the
prompt gives the agent the item's heading (`# I20 Restrict kids internet
access`). The step "toDocument takes the answer, unwrapping a fence, and checks
its heading" checks how the answer is turned into the document, including the
heading check.

"A result is not developed" is covered by the step "execDevelop refuses a
result, a document with another heading, and a failed agent": developing R19-1
is rejected with "R19-1 is a result; develop its task instead".

"an answer that does not start with the item's heading is refused" is covered by
the same step: an answer headed `# I21` for I20 is rejected with "does not start
with "# I20"", and the idea file stays unchanged. The `toDocument` step covers
the same heading check directly.

Every statement of R5 is covered by T3.

## Status

- Result: PASS
- Coverage: COMPLETE
