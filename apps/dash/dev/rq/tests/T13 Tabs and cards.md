# T13 Tabs and cards

The bar, the cards and their countdowns, and the page's errors.

## Steps

### tabs and grid

- Type: javascript
- File: ../../../src/dash.test.js
- Test: the page shows the tabs of every project, the first active, and places
  its cards on the grid

### fragment

- Type: javascript
- File: ../../../src/dash.test.js
- Test: the tab in the fragment is shown, and a change of fragment switches tabs

### countdowns

- Type: javascript
- File: ../../../src/dash.test.js
- Test: the page reads the values and the countdowns of the active tab, each key
  once

### missing renderer

- Type: javascript
- File: ../../../src/dash.test.js
- Test: a card with a renderer that does not exist shows a placeholder, not an
  exception

### no dashboards

- Type: javascript
- File: ../../../src/dash.test.js
- Test: the page says when it cannot read the dashboards

### no tabs

- Type: javascript
- File: ../../../src/dash.test.js
- Test: the page says when no config has a tab

### due and units

- Type: javascript
- File: ../../../src/dash.test.js
- Test: the page polls the values every five seconds and repaints a card whose
  value changed

## Status

- Result: PASS - 7 steps
- Execution: [E3 all][E3]

[E3]: <../.rq/E3 all.md>
