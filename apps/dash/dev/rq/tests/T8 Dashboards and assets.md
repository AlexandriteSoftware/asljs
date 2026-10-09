# T8 Dashboards and assets

What the page reads, and what is and is not on the wire.

## Steps

### dashboards

- Type: javascript
- File: ../../../src/server.test.js
- Test: keys lists the stored keys, and dashboards the projects, tabs and errors
  without paths or commands

### assets

- Type: javascript
- File: ../../../src/server.test.js
- Test: only the page and its modules are served, not the configs, the stores,
  the agents or the tests

### config errors

- Type: javascript
- File: ../../../src/server.test.js
- Test: dashboards reports the errors of the loaded configs

## Status

- Result: PASS - 3 steps
- Execution: [E3 all][E3]

[E3]: <../.rq/E3 all.md>
