# R19 AI agents

Commands that need an AI agent use the one `--ai` names, with an optional model
(`--ai`, `--ai=claude:fable`, `--ai=copilot`), or the first of `claude` and
`copilot` that is installed. `RQ_AI_COMMAND` replaces the command line.

## Implementation

- [T15 AI agents][T15]

[T15]: <../tests/T15 AI agents.md>

## Coverage

Every statement in R19 is covered by T15's steps. The tests are in
`src/agent.test.ts`, built to `build/agent.test.js`.

- **"Use the one `--ai` names, with an optional model (`--ai`,
  `--ai=claude:fable`, `--ai=copilot`)"**
  - Step _parseAgentSpec reads an optional agent and model_ covers all three
    forms the requirement names:
    - bare `--ai` (`true`) gives `{}`;
    - `claude:fable` gives agent `claude` with model `fable`;
    - `copilot` gives agent `copilot`.
  - It also checks a model-only spec and rejects an unknown agent.
  - Step _getAgentCommand prefers the override, then the named agent, then the
    detected one_ checks that a named agent and model become the command line:
    `claude -p … --model fable`.
- **"Or the first of `claude` and `copilot` that is installed"**
  - Step _detectAgent picks the first agent whose command runs, claude before
    copilot_ checks:
    - with both installed, `claude` is chosen;
    - with only `copilot`, `copilot` is chosen;
    - with neither, the result is `null`;
    - the probe order is `claude --version` then `copilot --version`.
  - Step _getAgentCommand prefers …_ checks the other half: with no agent named,
    the detected agent (`copilot`) is used, and with nothing detected there is
    no command (`null`).
- **"`RQ_AI_COMMAND` replaces the command line"**
  - Step _getAgentCommand prefers …_ sets `RQ_AI_COMMAND=my-agent` together with
    `{ agent: 'claude' }`, and the result is `my-agent`. So the override wins
    even over a named agent.

Two observations, neither of which leaves a statement uncovered:

- **Untested file:** `agent.test.ts` also has a test that T15 does not list,
  _getAgentCommand lets an agent read and run commands, but not edit files, in
  run mode_. It isn't needed for R19, but it could be added as a step to T15 or
  to whichever requirement owns the read/run tool permissions.
- **Unit level only:** T15 checks agent selection in the functions, not end to
  end. "Commands that need an AI agent" passing their `--ai` option down is not
  exercised from the CLI here. If that wiring needs its own check, it belongs to
  the requirements of `rq test` and `rq coverage`, not to R19.

## Status

- Result: PASS
- Coverage: COMPLETE
