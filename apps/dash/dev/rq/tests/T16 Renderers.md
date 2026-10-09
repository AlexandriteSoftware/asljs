# T16 Renderers

What each built-in renderer draws.

## Steps

### helpers

- Type: javascript
- File: ../../../src/renderers/util.test.js
- Test: el builds an element whose text is escaped by construction

### empty

- Type: javascript
- File: ../../../src/renderers/util.test.js
- Test: clear and empty replace what a card body holds

### field

- Type: javascript
- File: ../../../src/renderers/util.test.js
- Test: field reads a dotted path, and gives the value itself without a name

### numbers

- Type: javascript
- File: ../../../src/renderers/util.test.js
- Test: formatNumber keeps integers, rounds to two places, or uses the precision
  given

### value

- Type: javascript
- File: ../../../src/renderers/value.test.js
- Test: value draws

### text

- Type: javascript
- File: ../../../src/renderers/text.test.js
- Test: text

### chart

- Type: javascript
- File: ../../../src/renderers/chart.test.js
- Test: chart

### list

- Type: javascript
- File: ../../../src/renderers/list.test.js
- Test: list

### status

- Type: javascript
- File: ../../../src/renderers/status.test.js
- Test: status

### table

- Type: javascript
- File: ../../../src/renderers/table.test.js
- Test: table

### git

- Type: javascript
- File: ../../../src/renderers/git.test.js
- Test: git

### parsed value

- Type: javascript
- File: ../../../src/dash.test.js
- Test: a renderer gets the value parsed when it is JSON, and as text when it is
  not

### lookup by name

- Type: javascript
- File: ../../../src/dash.test.js
- Test: a card with a renderer that does not exist shows a placeholder, not an
  exception

## Status

- Result: PASS - 13 steps
- Execution: [E3 all][E3]

[E3]: <../.rq/E3 all.md>
