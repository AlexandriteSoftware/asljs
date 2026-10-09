# T10 Counters

The fields of a counter, and the cron expression of its schedule.

## Steps

### counter fields

- Type: javascript
- File: ../../../src/config.test.js
- Test: load reports a malformed entry and skips it, and the rest of the file
  still loads

### cron syntax

- Type: javascript
- File: ../../../src/cron.test.js
- Test: parse expands *, lists, ranges and steps per field

### cron errors

- Type: javascript
- File: ../../../src/cron.test.js
- Test: parse rejects a wrong field count, a bad step and an out-of-range value

### cron match

- Type: javascript
- File: ../../../src/cron.test.js
- Test: matches checks the minute, the hour and the day, with 0 and 7 both
  Sunday

### next minute

- Type: javascript
- File: ../../../src/cron.test.js
- Test: next is the first matching minute strictly after the given time

### sparse schedules

- Type: javascript
- File: ../../../src/cron.test.js
- Test: next skips the days and hours that cannot match, across months and years

### never

- Type: javascript
- File: ../../../src/cron.test.js
- Test: next and previous are null for a schedule that never matches

### previous minute

- Type: javascript
- File: ../../../src/cron.test.js
- Test: previous is the last matching minute at or before the given time

### a valid counter

- Type: javascript
- File: ../../../src/config.test.js
- Test: load reads a project, its counters and tabs, resolving db against the
  config folder

## Status

- Result: PASS - 9 steps
- Execution: [E3 all][E3]

[E3]: <../.rq/E3 all.md>
