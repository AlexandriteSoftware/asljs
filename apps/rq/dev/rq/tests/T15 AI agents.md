# T15 AI agents

The agent is chosen by --ai, detection or RQ_AI_COMMAND.

## Steps

### parseAgentSpec reads an optional agent and model

- Type: javascript
- File: ../../../../../libs/mdcli/build/agent.test.js
- Test: parseAgentSpec reads an optional agent and model

### getAgentCommand prefers the override, then the named agent, then the detected one

- Type: javascript
- File: ../../../../../libs/mdcli/build/agent.test.js
- Test: getAgentCommand prefers the override, then the named agent, then the
  detected one

### askAgent reads the verdict from the last JSON line

- Type: javascript
- File: ../../../../../libs/mdcli/build/agent.test.js
- Test: askAgent reads the verdict from the last JSON line

### detectAgent picks the first agent whose command runs, claude before copilot

- Type: javascript
- File: ../../../../../libs/mdcli/build/agent.test.js
- Test: detectAgent picks the first agent whose command runs, claude before
  copilot

## Status

- Result: PASS - 4 steps
- Execution: [E16 rq][E16]

[E16]: <../.rq/E16 rq.md>
