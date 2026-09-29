# TODO

Known work that is not yet scheduled. Items are grouped by the package they
belong to, roughly in the order worth doing them.

## eventful

- The `E` event map cannot be named without also naming `T`. The factory is
  `<T extends object | Function | undefined, E extends EventMap = EventMap>`,
  and TypeScript takes explicit type arguments all or nothing, so a typed map
  reads `eventful<typeof obj, Events>(obj)`. The README advertises typed
  listener signatures as a headline feature, so this is the gap with real design
  in it. A curried overload (`eventful<Events>()(obj)`) is the likely shape.
- A listener on the package-level `emit` event can still recurse. It emits on an
  enhanced object, that emit traces back to the global emitter, and the cycle
  repeats until the stack ends. `reportListenerError` guards the same cycle for
  `error`; the trace path has no equivalent. Gating traces on an observer
  narrowed this to objects someone is actually tracing, so it is no longer
  reachable by accident, but it is still reachable.
- Tests do not cover symbol event names, re-enhancing an object that is already
  eventful, or the ordering guarantees of `emitAsync`.

## Repository

- The `coverage` script is broken in six packages: it runs a `build:test` script
  that does not exist, over `dist/*.test.js` which the dist build does not emit,
  behind a `NODE_V8_COVERAGE=...` prefix that PowerShell does not parse.
  `eventful` carries the fixed version to copy.
- `machine/package.json` declares `directories.doc` pointing at a `docs`
  directory it does not have. The field steers nothing in npm, and the packages
  that do ship docs declare no such field.
