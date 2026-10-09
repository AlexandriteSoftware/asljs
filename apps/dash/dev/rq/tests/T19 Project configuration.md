# T19 Project configuration

What one config names, and that the server and the runner read the same configs.

## Steps

### one config

- Type: javascript
- File: ../../../src/config.test.js
- Test: load reads a project, its counters and tabs, resolving db against the
  config folder

### project default policy

- Type: javascript
- File: ../../../src/config.test.js
- Test: a key no counter declares belongs to the first project, with its default
  policy

### the server reads them

- Type: javascript
- File: ../../../src/server.test.js
- Test: server.js as a program opens every configured database at startup

### the runner reads them

- Type: javascript
- File: ../../../src/runner.test.js
- Test: runner.js as a program loads its configs and puts to localhost on PORT,
  or to DASH_URL

## Status

- Result: PASS - 4 steps
- Execution: [E3 all][E3]

[E3]: <../.rq/E3 all.md>
