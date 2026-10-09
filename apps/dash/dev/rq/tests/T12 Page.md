# T12 Page

The page's styling and wake lock, which the browser decides.

## Steps

### styling and wake lock

- Type: instruction

Read src/index.html and src/dash.js. Check that the page loads Pico CSS
classless from a CDN, defines its colours as CSS custom properties on :root with
a prefers-color-scheme: dark block that redefines them, and that dash.js
requests a screen wake lock when the page is visible and again on
visibilitychange. Pass when all of these hold.

### served as written

- Type: javascript
- File: ../../../src/server.test.js
- Test: only the page and its modules are served, not the configs, the stores,
  the agents or the tests

## Status

- Result: PASS - 2 steps
- Execution: [E3 all][E3]

[E3]: <../.rq/E3 all.md>
