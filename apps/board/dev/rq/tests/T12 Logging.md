# T12 Logging

The logging options of board and board-mcp, what they log, and that a view
serves until it is stopped.

## Steps

### board --loglevel and --logfile log the command and the agent

- Type: javascript
- File: ../../../build/cli.test.js
- Test: board --loglevel and --logfile log the command and the agent

### board reads BOARD_LOG_LEVEL, BOARD_LOG_FILE and BOARD_LOG_FORMAT, and an option overrides its variable

- Type: javascript
- File: ../../../build/cli.test.js
- Test: board reads BOARD_LOG_LEVEL, BOARD_LOG_FILE and BOARD_LOG_FORMAT, and an
  option overrides its variable

### board view serves until SIGINT or SIGTERM, and logs until it stops

- Type: javascript
- File: ../../../build/cli.test.js
- Test: board view serves until SIGINT or SIGTERM, and logs until it stops

### createLoggerProvider is silent by default

- Type: javascript
- File: ../../../../../libs/logging/build/create-logger-provider.test.js
- Test: createLoggerProvider is silent by default

### createLoggerProvider lets overrides win over the environment

- Type: javascript
- File: ../../../../../libs/logging/build/create-logger-provider.test.js
- Test: createLoggerProvider lets overrides win over the environment

### createLoggerProvider logs when the environment sets a level

- Type: javascript
- File: ../../../../../libs/logging/build/create-logger-provider.test.js
- Test: createLoggerProvider logs when the environment sets a level

### main refuses a log level that would log to stdout, and logs to the file BOARD_LOG_ variables and options name

- Type: javascript
- File: ../../../build/mcp.test.js
- Test: main refuses a log level that would log to stdout, and logs to the file
  BOARD_LOG_ variables and options name

### askAgent logs the command and the exit code at debug, the prompt and the output at trace

- Type: javascript
- File: ../../../../../libs/mdcli/build/agent.test.js
- Test: askAgent logs the command and the exit code at debug, the prompt and the
  output at trace

### untilStopped closes the server on a signal and stops listening for it

- Type: javascript
- File: ../../../../../libs/mdcli/build/server.test.js
- Test: untilStopped closes the server on a signal and stops listening for it

## Status

- Result: PASS - 9 steps
- Execution: [E12 T12][E12]

[E12]: <../.rq/E12 T12.md>
