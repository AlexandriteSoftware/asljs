# R12 Instruction steps

An instruction step is free-form text an AI agent carries out: it may read files
and run commands, and is told and configured not to edit files; its verdict
passes or fails the step. Without an agent the step fails.

## Implementation

- [T9 Instruction steps][T9]
- [T15 AI agents][T15]

[T9]: <../tests/T9 Instruction steps.md>
[T15]: <../tests/T15 AI agents.md>

## Coverage

R12 is fully covered: every statement is implemented by T9 or T15.

- **"An instruction step is free-form text an AI agent carries out"**: T9, step
  _runTest asks the agent to carry out an instruction step_
  (`src/run-test.test.ts:198`). A test whose step is plain prose with no `Type:`
  is run by a fake agent. The agent's prompt contains the test path, the title,
  the description, the step heading and the step text.
- **"it may read files and run commands"**: T9, step _getAgentCommand lets an
  agent read and run commands, but not edit files, in run mode_
  (`src/agent.test.ts:198`). In run mode the claude command line allows
  `Read,Grep,Glob,Bash`.
- **"is told … not to edit files"**: T9, the runTest step. It checks that the
  prompt contains `do not change any file`.
- **"… and configured not to edit files"**: T9, the getAgentCommand step. It
  checks `--disallowedTools Edit,Write,NotebookEdit` in run mode.
- **"its verdict passes or fails the step"**: T9, the runTest step, checks both
  outcomes:
  - `{"result":"OK"}` gives `PASS`.
  - `{"result":"Fail","message":"No report."}` gives `step 1 (Pages) failed: No
    report.`.

  T15, step _askAgent reads the verdict from the last JSON line_
  (`src/agent.test.ts:83`), covers the verdict parsing underneath. That includes
  an agent that gives no verdict and an agent that exits with a non-zero code.
- **"Without an agent the step fails"**: T9, the runTest step. With `NO_AGENT`
  the note is `step 1 (Pages) needs an AI agent; install claude or copilot, or
  set RQ_AI_COMMAND`.
- **Which agent is used**: T15. Its other steps cover `--ai` parsing, the order
  of override, named agent and detected agent, and detection trying claude
  before copilot.

One small point, not a gap: the run-mode command line is only checked for
claude. Copilot is only checked in read mode. The requirement doesn't name
agents, so the statement is still covered. If the maintainers want both agents
pinned, they can add a copilot run-mode assertion to the getAgentCommand test.

## Status

- Result: PASS
- Coverage: COMPLETE
