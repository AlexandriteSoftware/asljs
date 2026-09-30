# TODO

Known work that is not yet scheduled. Items are grouped by the package they

belong to, roughly in the order worth doing them.

## observable

### Getters run more than once per change

The `set` trap calls `Reflect.get` for `previous` and again for `current`, and

the `defineProperty` trap does the same, so an accessor property has its getter

run twice per reported change. `truncation` is a third site: it reads

`target[index]` for every element a `length` assignment drops, so clearing an

array runs the getters of the elements it removes. Documented for

`defineProperty`, where installing a getter has to run it to report a value;

undocumented for the rest.

### Cross-realm plain objects are refused

`isPlainObject` compares against this realm's `Object.prototype`, so a literal

from a `vm` context or an iframe is not convertible. Under throw-by-default that

is no longer a silent degradation but a refusal, which raises the stakes. Widen

with an `Object.prototype.toString` fallback if it bites.

### The `get` trap on arrays has not been measured

It runs on every read of a converted array, not only on the nine methods it

wraps, and does a `Map` lookup plus a `Reflect.get` identity check for a string

key. Cheap by inspection, unmeasured in practice. Measure before adding anything

else to it.

### Smaller items

- `tracer.ts` ships in `dist/`. It is a test helper, unexported from `index.ts`,
  and adds dead weight plus a `.d.ts` to the published package. Move it
  somewhere `tsconfig.dist.json` excludes.
- A refused member's type is `never`, which is right for a model that genuinely
  cannot be converted and wrong for one where the `convert` hook takes the value
  over. There is no way for the type to know; the README says to type the model
  with the wrapper instead.

## eventful

### The global emitter's own events are untyped

`eventful.on('new', ...)` gives the listener `unknown[]`, although `README.md`

documents the exact payload of `new`, `on`, `off`, `emit`, `emitAsync` and

`error`. A `GlobalEvents` map would make the documented contract checkable.

`docs/global-events.md` documents the payloads.

### `EventfulFn` is not exported

`eventful` is typed as `EventfulFn`, but `index.ts` exports only

`EventfulFactory`, so a caller cannot annotate a variable that holds `eventful`.

### Smaller items

- JavaScript examples in `docs` are not verified. `readme-examples.test.ts`
  compiles the TypeScript blocks in `README.md` and `docs/typescript.md`, which
  is every one there is, but the 17 `js` blocks across `README.md`,
  `docs/api.md`, `docs/global-events.md`, `docs/leak-detection.md` and
  `docs/opentelemetry.md` are checked by nothing. `observable` runs its
  JavaScript examples and compares their output; the blocks here would need the
  same `// Output:` convention first, and the OpenTelemetry ones need an SDK
  this workspace does not install.
