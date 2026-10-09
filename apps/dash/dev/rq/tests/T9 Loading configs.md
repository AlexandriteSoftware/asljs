# T9 Loading configs

The command line, the fallbacks, the error reports and the reload.

## Steps

### command line

- Type: javascript
- File: ../../../src/config.test.js
- Test: parseArgs takes every --config, -c and --config=, and reports one
  without a path

### fallbacks

- Type: javascript
- File: ../../../src/config.test.js
- Test: parseArgs falls back to DASH_CONFIG, then to the package
  dash.config.json

### bad command line

- Type: javascript
- File: ../../../src/config.test.js
- Test: load reports a --config without a path along with the config errors

### a project

- Type: javascript
- File: ../../../src/config.test.js
- Test: load reads a project, its counters and tabs, resolving db against the
  config folder

### malformed entries

- Type: javascript
- File: ../../../src/config.test.js
- Test: load reports a malformed entry and skips it, and the rest of the file
  still loads

### malformed files

- Type: javascript
- File: ../../../src/config.test.js
- Test: a file that does not parse, or has no project or an invalid one, is
  reported and the other configs still load

### duplicates

- Type: javascript
- File: ../../../src/config.test.js
- Test: a project, a key or a tab claimed twice is reported, and the first
  config keeps it

### reload

- Type: javascript
- File: ../../../src/config.test.js
- Test: watch reloads the configs when one changes on disk

### server as a program

- Type: javascript
- File: ../../../src/server.test.js
- Test: server.js as a program opens every configured database at startup

### runner as a program

- Type: javascript
- File: ../../../src/runner.test.js
- Test: runner.js as a program loads its configs and puts to localhost on PORT,
  or to DASH_URL

### reload in the server

- Type: javascript
- File: ../../../src/server.test.js
- Test: reloads a config that changes

## Status

- Result: PASS - 11 steps
- Execution: [E3 all][E3]

[E3]: <../.rq/E3 all.md>
