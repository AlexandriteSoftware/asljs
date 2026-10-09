# T7 Countdown

The states of /api/next, and the minutes they are measured from.

## Steps

### next states

- Type: javascript
- File: ../../../src/server.test.js
- Test: next is wait until the next run, due just after a run that did not
  report, then stale, and null without a schedule

### next and last run

- Type: javascript
- File: ../../../src/config.test.js
- Test: nextRun and lastRun are the next and the last minute a key is due, and
  null without a schedule

### due and stale

- Type: javascript
- File: ../../../src/server.test.js
- Test: next is due up to five seconds after a missed run and stale after that

## Status

- Result: PASS - 3 steps
- Execution: [E3 all][E3]

[E3]: <../.rq/E3 all.md>
