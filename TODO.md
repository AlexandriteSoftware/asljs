# TODO

Known work that is not yet scheduled. Items are grouped by the package they
belong to, roughly in the order worth doing them.

## observable

### An own `watch` property is silently swallowed

`ensureWatchMethod` returns early when `'watch' in target`, so
`observable({ watch: 42 })` succeeds and hands back an object whose `watch` is
`42`. `eventful` throws `Method "on" already exists.` for the same collision.
Throw `Method "watch" already exists.` and keep the pair aligned.

### The docs still say an opaque top-level target is boxed

`README.md` and `AGENTS.md` each still carry the sentence about boxing an opaque
top-level value into `{ value }`, one paragraph from the text that says it
throws. Left over from the change that replaced boxing with a refusal.

### There is no README example test

`eventful` has `readme-examples.test.ts`; `observable` has nothing equivalent,
which is why the stale boxing sentence survived. The observable README now
carries a lot of behavioural claims, so this is the item with the most leverage
on the list.

### Two different tests for "already eventful"

`isEventfulObject` requires both `on` and `emit`; `makeProxy` checks only
`target?.emit`. An object with `emit` and no `on` takes the already-wired
branch, gets no wiring, and every trap emit disappears into its own `emit`. Use
`isEventfulObject` in both places.

### Eventful's options are unreachable through observable

`makeProxy` calls `eventfulFn(proxiedTarget)` with no second argument, so
`strict` and the `error` hook cannot be set on an observable. Either forward
them from `ObservableOptions` or say in `README.md` that they are not available.

### `types.ts` duplicates eventful's `EventfulFactory`

The local interface is eventful's minus the `options` parameter, and
`ObservableOptions.eventful` unions both. Nothing needs the narrower one; drop
it and keep eventful's.

### `Observable<T>` resolves to unexported aliases

`types.ts` declares `ObservableObject<T>`, `ObservableArray<T>` and
`ObservablePrimitive<T>`; none of the three is exported, and the name
`ObservableObject` is additionally taken by the class in `observable-object.ts`.
So every branch of `Observable<T>` resolves to a name outside the public
surface. Export all three, or inline them, and rename the alias that clashes
with the class.

### Cross-realm plain objects are treated as opaque

`isPlainObject` compares against this realm's `Object.prototype`, so a literal
from a `vm` context or an iframe is opaque. Acceptable for now; widen with a
`Object.prototype.toString` fallback if it ever bites.

### Smaller items

- `watch` fires once per property change, not once per batch: watching
  `[ 'a', 'b' ]` and setting both runs the callback twice. Defensible, but the
  `watch(...values)` signature implies a coherent snapshot, so say so in
  `README.md`.
- Getters run twice per set: the `set` trap calls `Reflect.get` for `previous`
  and again for `current`, doubling side effects on accessor properties.
  `collectTruncatedElements` is a second site: it reads `target[index]`, so
  truncating an array runs the getters of the elements it drops.
- Symbol keys emit stringified event names (`set:Symbol(s)`) and are absent from
  the event map types. Skip symbols or document the coercion.
- `tracer.ts` ships in `dist/`. It is a test helper, unexported from `index.ts`,
  and adds dead weight plus a `.d.ts` to the published package. Move it
  somewhere `tsconfig.dist.json` excludes.
- `REFERENCE.md` is a one-line stub and is not listed in `files`. Fill it or
  delete it.
- npm keywords are `events`, `javascript`, `js` — none of `observable`,
  `reactive`, `proxy`, `state`.
- `WatchedValues` is still exported but no longer used by anything: `watch` now
  types its values through `WatchPathValues`. Keep it as a compatibility alias
  or drop it at the next breaking release.

## eventful

### The global emitter's own events are untyped

`eventful.on('new', ...)` gives the listener `unknown[]`, although `README.md`
documents the exact payload of `new`, `on`, `off`, `emit`, `emitAsync` and
`error`. A `GlobalEvents` map would make the documented contract checkable.

### `EventfulFn` is not exported

`eventful` is typed as `EventfulFn`, but `index.ts` exports only
`EventfulFactory`, so a caller cannot annotate a variable that holds `eventful`.

### Smaller items

- The "Stable Behavior" list in `README.md` still names six methods.
  `removeAllListeners` and `getListeners` were added later and are documented in
  full further down the same file.
