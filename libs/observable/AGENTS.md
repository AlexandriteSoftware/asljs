# ASLJS Observable AI Guidance

## Purpose

Use this file as AI-facing guidance for `asljs-observable`.

This package owns three things, in order of importance: a contract for
observable objects, a query over it, and a converter that makes plain
JavaScript data satisfy the contract.

## Package Scope

Exports from `src/index.ts`:

- `observable`, the converter
- `observe`, `combine`, the query
- `batch`, the change-grouping boundary
- `isObservable`, `asObservable`, the contract guards
- `ObservableObject`, a base class for a hand-written participant
- `Change`, `ChangeListener`, `Observable`, `Chain`, the converter's return
  types, path types, and options/trace types

## Preferred Usage Patterns

- Use `observable(value, options?)` to convert plain objects, arrays, or
  primitives.
- Use `observe(source).at(path)` for path-based reactive reads, and
  `combine([ ... ])` for several paths at once.
- Use `ObservableObject` when implementing a class with explicit getters and
  setters.
- Keep change notifications expressed through one `change` event carrying a
  list of discriminated entries.

## Constraints To Preserve

### The contract

- One event, `change`, whose payload is always a list, even for one change.
- `on` and `off`. The return value of `on` is unspecified, so an emitter that
  returns `this` conforms; a function it returns is used as a disposer where one
  is offered. `off` is the canonical teardown path, and that is also what makes
  a source work with RxJS `fromEvent`.
- Conformance is tested on `on` **and** `off`. Testing `on` alone admits a value
  that then fails at teardown, which is the Node `EventEmitter` bug.
- Array indices are ordinary string properties. There is no numeric `index` on a
  `set` entry and no separate array change type.
- Removal is a set to `undefined`. There is no delete event, and the lost
  distinction between a removed key and one present but undefined is accepted,
  documented cost.
- A producer emits the most specific description it has, and never both. A
  `shift()` is one `splice` entry, not N `set` entries plus a `splice`.
- `splice` is optional; a participant that only emits `set` entries conforms.
- A `splice` entry counts as a change to every index from `splice.index` onwards
  and to `length`. This rule lives in the contract, so a hand-written consumer
  applies it too.
- Entries are unordered and unchanged positions are absent. The list is what
  changed, never the affected range.
- An unrecognised entry kind means "something changed, re-read". Keep this, it is
  what allows a `delete`, `permute` or `change:<property>` kind to be added later
  without breaking a consumer.
- The contract covers own properties only and never carries a path. Paths are
  composed by the query.
- Timing is not part of the contract. This package's own producers are
  synchronous, which is narrower than what the contract allows.
- `Observable` is the contract interface, and it is the most valuable name in the
  package. Do not give it back to a converter return type.

### Batching and delivery

- `batch(fn)` delivers every modification in the order it was made and merges
  none. Do not add merging without handling arrays: an index names a different
  element once a splice has run, and a merged list no longer applies in order.
- A write that leaves the value as it was, by `Object.is`, is not a
  modification, inside a batch as outside.
- An exception inside `fn` still flushes: the writes have landed.
- Nesting is counted, not stacked. Only the outermost close emits.
- Grouping is per emitter. "One notification" always means one per source, and
  the flush order is the order the emitters were first written to.
- A write made by a listener during delivery is queued and delivered after,
  as its own `change`. It must not join the list being delivered, or one
  notification would carry different payloads to different subscribers.
- The round count is capped and the cap throws. A silently abandoned flush would
  leave the model and every view disagreeing with no indication.
- The delivery state is module-level, not per object: the inversion it fixes
  involves a listener on one object writing to another.

### The query

- A chain is an immutable description. Operators return new chains and subscribe
  nothing; a terminal executes it and returns the one disposer that owns the
  subscription tree.
- A chain is deliberately not closed under the contract: no `on`/`off` on it.
- `observe(source)` throws for a source that does not conform, and declares
  `Observable` so TypeScript rejects a plain object first.
- Intermediate path segments stay permissive. The last segment of a path is
  always non-conforming, and conversion without `deep: true` produces partial
  observation on purpose.
- Every operator deduplicates with `Object.is` against the last value it
  emitted. `combine` therefore never deduplicates, because it builds a fresh
  tuple; that is a consequence of the rule, not an exception to it.
- The first callback always happens, except where `filter` rejects the current
  value.
- `combine` recomputes once per delivery, through the module-level delivery
  counter, so a subscriber never sees the intermediate tuple.
- Nothing is injected into a target. There is no `watch` method,
  `observable.watch`, or `ObservableObject.prototype.watch`.

### The converter

`DESIGN.md` states the converter's rules one by one (D1-D19); it is the source
of truth for them. The points below are the ones a change is most likely to
undo.

- `observable` creates a new observable version of plain data and never
  extends or mutates what it is given. Do not go back to grafting the API onto
  the input.
- Repeated references and cycles are resolved per call: within one call an
  object reached twice becomes one observable, a cycle throws, and separate
  calls produce separate observables. There is no process-wide identity map.
- The top-level rules (D10) and the nested rules (D11) are ordered checks. Keep
  them as two ordered functions in `observable.ts`, in the order the design
  gives, because the order is what decides every overlapping case.
- `Date`, `RegExp`, functions and nested frozen plain data are values: kept by
  reference, never converted or traversed, and boxed at the top level. They
  are recognised by brand checks that work across realms, not by `instanceof`.
- Plain objects and arrays are recognised by prototype, across realms. Only
  plain data is converted (D16): accessors, symbol keys, read-only, hidden or
  non-configurable properties, inextensible containers, holes and extra array
  properties throw. The check counts own index keys rather than walking
  `length`, so a sparse array is refused without visiting every index.
- The reserved names are the methods the factory adds, checked as own
  properties. With a custom factory only `on` and `off` are known.
- `convert` is asked before the built-in rules, never about values. A top-level
  result must be a new observable; a nested result is used unchecked and not
  traversed.
- Values written after conversion are stored as they are (D13). The traps
  report writes and never convert them.
- Every refusal names the path of the offending value (D17). The messages are
  asserted in the tests.
- The package ships no wrappers for `Map`, `Set` or any other refused kind, and
  must not start shipping them. Callers add their own through `convert`.
- The `set` trap raises a re-entrancy flag around its `Reflect.set`, and the
  `defineProperty` trap reports nothing while it is raised. Without it a plain
  assignment is reported twice, because `[[Set]]` performs
  `[[DefineOwnProperty]]`.
- A definition is reported by whether the observed value changed, not by what the
  descriptor says. Descriptor observation is out of the contract.
- Five array methods produce a splice: `push`, `pop`, `shift`, `unshift`,
  `splice`. Their arguments are normalised rather than passed through, and the
  call goes through the proxy, which is why index `set` entries are suppressed
  while a splice is collected.
- `arr.length = 0` produces a splice too.
- `sort`, `reverse`, `fill` and `copyWithin` batch their `set` entries and emit
  no splice. Do not add a whole-range splice for a permutation: `removed` means
  removed, so a consumer releasing resources would tear down and rebuild
  everything for a reorder.
- The `get` trap exists only on array targets, does nothing but a `Map` lookup
  for anything but the wrapped methods, and steps aside for an own override.
  Do not optimise it for speed: the converter trades speed for convenience,
  and `docs/performance.md` says so and points to hand-written participants.
- Symbol keys are stored and not reported: the contract's `property` is a string.
- The return type promises only the top-level conversion: `T` plus the Eventful
  API. Members keep their declared type, with or without `deep`, because a
  member may hold either the plain value or its observable. Do not make the
  type follow `deep`.
- `ObservablePath` caps its depth. Without the cap a self-referential model
  recurses forever. It excludes the names `eventful` occupies, or the methods
  conversion adds become watchable properties, and it stops at values.

## Not Yet Built, Deliberately

Do not build these speculatively; they need evidence first.

- Async iteration as a terminal.
- `[Symbol.observable]` on a chain, so `from(chain)` works in RxJS. Sources
  already work with `fromEvent` and need nothing.
- `share()`, if fan-out over an expensive `map` ever justifies it.
- A `change:<property>` fast path a source can advertise. An optimisation, not a
  second contract.

## Documentation Layout

- `README.md` is a landing page for a first-time reader: what it does, whether it
  is for them, how to install, a few small examples, and links onward. Keep
  detail, reference and rationale out of it; the root `AGENTS.md` has the rule.
- `docs/contract.md`, `docs/query.md`, `docs/batching.md`, `docs/converter.md`,
  `docs/performance.md`, `docs/rxjs.md` and `docs/migrating-from-0.5.md` carry
  the detail. Each records
  the reasoning behind its decisions, not only the behaviour, because the
  reasoning is what stops a later change undoing a deliberate one.
- `DESIGN.md` states the converter's design rule by rule (D1-D19). Its examples
  are illustrations and are not run by the harness; `docs/converter.md` carries
  the runnable ones.
- Every ```js and ```ts block in `README.md` and `docs` is executed or compiled
  by `src/docs-examples.test.ts`. A JavaScript block must be a complete program
  and, where it ends with an `// Output:` comment block, must print exactly
  those lines; a TypeScript block must compile standalone against `dist`, or
  carry an `// error TSxxxx` comment and produce that error. Use a plain fence
  for a listing that is not meant to run.
- `dist` has to be built before the tests for that harness to resolve the
  package, which `npm run all` does.

## Validation

- `npm -w asljs-observable run test`
- `npm -w asljs-observable run typecheck`
- `npm -w asljs-observable run lint`

Update this file when AI-facing constraints, preserved payload semantics, or
validation commands change. Update `README.md` separately only when user-facing
behavior changes.
