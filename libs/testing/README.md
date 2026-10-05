# testing

> Part of [Alexandrite Software Library][1] – a set of high‑quality, performant
> JavaScript libraries for everyday use.

## Overview

`asljs-testing` collects the setup code that Node.js tests keep rewriting: set
environment variables or globals for one test and put them back afterwards, wait
for a condition, and get a logger for the code under test.

## Scope

- **`TmpEnv`** sets environment variables and restores them at the end of a
  `using` block, removing the ones that did not exist before.
- **`TmpGlobals`** does the same for properties of `globalThis`, such as the
  `window` and `document` of a JSDOM instance.
- **`waitFor`** and **`flushMicrotasks`** wait for a condition, or for queued
  promise callbacks.
- **`createTestLoggerProvider`** gives a test file a logger whose level, target
  and format come from environment variables.

It works with any test runner, and has no browser dependency: bring your own
JSDOM, or any other window, to `TmpGlobals`.

## Installation

```bash
npm install --save-dev asljs-testing
```

NPM Package: [asljs-testing][21]

## Usage

```ts
import { TmpEnv }
  from 'asljs-testing';

test(
  'reads the port from the environment',
  () =>
  {
    using env =
      new TmpEnv({ PORT: '8080', SERVICE_PORT: undefined });

    assert.equal(
      readConfig().port,
      8080);
  });
```

```ts
import { JSDOM }
  from 'jsdom';
import { TmpGlobals }
  from 'asljs-testing';

const dom =
  new JSDOM('<!doctype html><html><body></body></html>');

using globals =
  new TmpGlobals(
    { window: dom.window,
      document: dom.window.document,
      HTMLElement: dom.window.HTMLElement });
```

```ts
import { createTestLoggerProvider }
  from 'asljs-testing';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  () => loggerProvider.dispose());
```

## Further reading

- [Testing][2] - every helper, its edge cases, and the test logger's environment
  variables.

Questions and bugs: [asljs/issues][3].

## Related packages

- `asljs-logging` provides the logger behind `createTestLoggerProvider`.
- `asljs-tmpdir` provides a temporary directory for a test.

## License

MIT License. See [LICENSE][LIC] for details.

[1]: https://github.com/AlexandriteSoftware/asljs
[2]: docs/Testing.md
[21]: https://www.npmjs.com/package/asljs-testing
[3]: https://github.com/AlexandriteSoftware/asljs/issues
[LIC]: LICENSE.md
