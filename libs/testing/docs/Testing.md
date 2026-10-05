# Testing

## Purpose

The helpers `asljs-testing` exports, what each one restores and when, and how
the repository's tests use them.

## TmpEnv

Sets environment variables for the duration of a test:

```ts
using env =
  new TmpEnv({ PORT: '8080', SERVICE_PORT: undefined });

env.set(
  'LOG_LEVEL',
  'debug');
```

- `new TmpEnv(updates)` applies `updates` to `process.env`.
- `set(name, value)` changes one more variable after construction. A variable
  set twice is restored to the value it had before the first change.
- `restore()` puts every touched variable back and returns `true`; called again,
  it does nothing and returns `false`. The end of a `using` block calls it.
- `set` after `restore` throws.

Edge cases:

- `undefined` removes the variable instead of setting it to the string
  `'undefined'`, which is what `process.env.NAME = undefined` does.
- A variable that did not exist before is removed on restore.
- Restoring puts back the value from before the `TmpEnv` changed it, even when
  the test changed the variable directly in between.

## TmpGlobals

Replaces properties of `globalThis` for the duration of a test, typically to
give code that expects a browser a JSDOM window:

```ts
const dom =
  new JSDOM('<!doctype html><html><body></body></html>');

using globals =
  new TmpGlobals(
    { window: dom.window,
      document: dom.window.document,
      customElements: dom.window.customElements,
      HTMLElement: dom.window.HTMLElement });
```

- `new TmpGlobals(values)` defines each entry on `globalThis` as a writable,
  configurable data property.
- `set(name, value)` replaces one more property, restored with the others.
- `restore()` puts each property back with the descriptor it had, so a getter
  stays a getter, and removes the properties that did not exist before. It
  returns `true` the first time and `false` after that. The end of a `using`
  block calls it.
- `set` after `restore` throws.

When a test file shares one window across its tests, create the `TmpGlobals`
once, at module level or in a `before` hook, and call `restore()` in
`test.after`.

`asljs-testing` has no dependency on `jsdom`; the test brings the window.

## flushMicrotasks

`await flushMicrotasks()` runs two turns of the microtask queue, enough for a
promise callback that queues one more. It does not run timers.

## waitFor

`await waitFor(predicate, timeoutMs = 1000)` resolves as soon as `predicate()`
returns `true`. Between checks it waits for a timer turn, so pending microtasks
and timers run, and it rejects with `Timed out after <timeoutMs> ms waiting for
the condition` when the time runs out.

## createTestLoggerProvider

`createTestLoggerProvider(prefix = 'ASLJS_TEST_LOG_')` creates the logger
provider of a test file, built on [asljs-logging][LOG]:

- The level is `debug` unless `<prefix>LEVEL` says otherwise; `silent` returns a
  `NullLoggerProvider`.
- `<prefix>FILE` takes a file path, `stdout` (the default) or `stderr`.
- The format is `pretty` on stdout and stderr, because a person reads test
  output even though the test runner pipes it, and `json` in a file.
  `<prefix>FORMAT` overrides it.

The repository's [logging rules][RUL] describe how tests use it:

```ts
const loggerProvider =
  createTestLoggerProvider();

test.after(
  () => loggerProvider.dispose());
```

## Copies in asljs-logging

`asljs-testing` depends on `asljs-logging`, so the tests of `asljs-logging`
cannot use it. That package keeps unexported copies of two helpers under
`src/testing`, which its published build leaves out:

- `tmp-env.ts` and `tmp-env.test.ts` - byte-for-byte copies.
- `create-test-logger-provider.ts` and its test - identical below the imports,
  which differ only because one side imports from `asljs-logging` and the other
  from the package's own files.

A comment at the top of each file names both copies. Change them together.

[LOG]: ../../logging/docs/Logging.md
[RUL]: ../../../docs/Logging.md#tests
