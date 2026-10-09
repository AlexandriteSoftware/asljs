# T15 Refresh

Polling the values and the countdowns.

## Steps

### values once

- Type: javascript
- File: ../../../src/dash.test.js
- Test: the page reads the values and the countdowns of the active tab, each key
  once

### polling

- Type: javascript
- File: ../../../src/dash.test.js
- Test: the page polls the values every five seconds and repaints a card whose
  value changed

### unchanged

- Type: javascript
- File: ../../../src/dash.test.js
- Test: a card whose value did not change is not drawn again

### charts

- Type: javascript
- File: ../../../src/dash.test.js
- Test: a chart card reads its history when the tab is built and again every
  minute

## Status

- Result: PASS - 4 steps
- Execution: [E3 all][E3]

[E3]: <../.rq/E3 all.md>
