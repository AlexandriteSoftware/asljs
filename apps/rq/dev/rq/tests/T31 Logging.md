# T31 Logging

The logging options and variables of rq and rq-mcp, what they log, and that a
view serves until it is stopped.

## Steps

### rq --loglevel and --logfile log the command, each test and the commands of its steps

- Type: javascript
- File: ../../../build/cli.test.js
- Test: rq --loglevel and --logfile log the command, each test and the commands
  of its steps

### createLoggerProvider is silent by default

- Type: javascript
- File: ../../../../../libs/logging/build/create-logger-provider.test.js
- Test: createLoggerProvider is silent by default

### createLoggerProvider lets overrides win over the environment

- Type: javascript
- File: ../../../../../libs/logging/build/create-logger-provider.test.js
- Test: createLoggerProvider lets overrides win over the environment

### rq reads RQ_LOG_LEVEL, RQ_LOG_FILE and RQ_LOG_FORMAT, and an option overrides its variable

- Type: javascript
- File: ../../../build/cli.test.js
- Test: rq reads RQ_LOG_LEVEL, RQ_LOG_FILE and RQ_LOG_FORMAT, and an option
  overrides its variable

### main refuses a log level that would log to stdout, and logs the requests to a log file

- Type: javascript
- File: ../../../build/mcp.test.js
- Test: main refuses a log level that would log to stdout, and logs the requests
  to a log file

### askAgent logs the command and the exit code at debug, the prompt and the output at trace

- Type: javascript
- File: ../../../../../libs/mdcli/build/agent.test.js
- Test: askAgent logs the command and the exit code at debug, the prompt and the
  output at trace

### postProcess runs the command with the written files that still exist

- Type: javascript
- File: ../../../../../libs/mdcli/build/post-process.test.js
- Test: postProcess runs the command with the written files that still exist

### serveLines answers line-delimited requests and logs requests and invalid lines

- Type: javascript
- File: ../../../../../libs/mdcli/build/mcp.test.js
- Test: serveLines answers line-delimited requests and logs requests and invalid
  lines

### untilStopped closes the server on a signal and stops listening for it

- Type: javascript
- File: ../../../../../libs/mdcli/build/server.test.js
- Test: untilStopped closes the server on a signal and stops listening for it

## Status

- Result: PASS - 9 steps
- Execution: [E21 T31][E21]

[E21]: <../.rq/E21 T31.md>
