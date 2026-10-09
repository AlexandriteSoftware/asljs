# T14 Layout

Placing cards on the grid.

## Steps

### defaults

- Type: javascript
- File: ../../../src/layout.test.js
- Test: layout gives a card without geometry the default size and flows cards in
  list order

### anchored

- Type: javascript
- File: ../../../src/layout.test.js
- Test: layout places anchored cards first and flows the others around them

### order

- Type: javascript
- File: ../../../src/layout.test.js
- Test: layout keeps the cards in the order given, with the card each placement
  is for

### partial anchors

- Type: javascript
- File: ../../../src/layout.test.js
- Test: layout pins the column of a card with left only, and starts the scan at
  the row of a card with top only

### clamping

- Type: javascript
- File: ../../../src/layout.test.js
- Test: layout clamps a card wider than the screen, and an anchored card that
  would overflow

### rows

- Type: javascript
- File: ../../../src/layout.test.js
- Test: layoutRows is the number of rows the placed cards use

### on the page

- Type: javascript
- File: ../../../src/dash.test.js
- Test: the page shows the tabs of every project, the first active, and places
  its cards on the grid

## Status

- Result: PASS - 7 steps
- Execution: [E3 all][E3]

[E3]: <../.rq/E3 all.md>
