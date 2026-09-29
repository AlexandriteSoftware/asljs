# TODO

Known work that is not yet scheduled. Items are grouped by the package they
belong to, roughly in the order worth doing them.

## observable

### Some opaque values are opaque at runtime but not in the types

`ObservableOpaque` lists the built-ins, but two runtime conditions are invisible
to TypeScript:

- a class instance cannot be told apart from a structurally identical plain
  object;
- extensibility is not a type-level property, so a frozen or sealed value still
  types as a plain object.

Both type as `ObservableObject<T>` while the runtime boxes them. Document the
limitation, or ask callers to annotate.

### Cross-realm plain objects are treated as opaque

`isPlainObject` compares against this realm's `Object.prototype`, so a literal
from a `vm` context or an iframe is opaque. Acceptable for now; widen with a
`Object.prototype.toString` fallback if it ever bites.

### `ObservableObject` names two different things

`types.ts` declares a type alias `ObservableObject<T>` and
`observable-object.ts` declares a class of the same name. Only the class is
exported, so `Observable<T>` publicly resolves to an unexported alias. Rename
the alias.

### Smaller items

- `watch` fires once per property change, not once per batch: watching
  `[ 'a', 'b' ]` and setting both runs the callback twice. Defensible, but the
  `watch(...values)` signature implies a coherent snapshot, so say so in
  `README.md`.
- Getters run twice per set: the `set` trap calls `Reflect.get` for `previous`
  and again for `current`, doubling side effects on accessor properties.
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
