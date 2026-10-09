# T10 Command line

The command line, the agent and the configuration.

## Steps

### board without arguments prints help with every command

- Type: javascript
- File: ../../../build/cli.test.js
- Test: board without arguments prints help with every command

### board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote

- Type: javascript
- File: ../../../build/cli.test.js
- Test: board works in --working-dir, passes the guidance and --ai, and
  post-processes what it wrote

### board returns 1 and says why when a command fails

- Type: javascript
- File: ../../../build/cli.test.js
- Test: board returns 1 and says why when a command fails

### board --ai runs the named agent with the model

- Type: javascript
- File: ../../../build/cli.test.js
- Test: board --ai runs the named agent with the model

### detectAgent picks the first agent whose command runs, claude before copilot

- Type: javascript
- File: ../../../../../libs/mdcli/build/agent.test.js
- Test: detectAgent picks the first agent whose command runs, claude before
  copilot

### getCommand takes BOARD_AI_COMMAND, and fails without an agent

- Type: javascript
- File: ../../../build/ask.test.js
- Test: getCommand takes BOARD_AI_COMMAND, and fails without an agent

### execExec runs the detected agent with its model, allowed to edit files and run commands

- Type: javascript
- File: ../../../build/exec.test.js
- Test: execExec runs the detected agent with its model, allowed to edit files
  and run commands

## Status

- Result: PASS - 7 steps
- Execution: [E7 rq][E7]

[E7]: <../.rq/E7 rq.md>
