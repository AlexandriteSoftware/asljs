# Using it with RxJS

## Purpose

The [contract](contract.md) was chosen for hand-implementation and for Node
`EventEmitter` interop. It happens to also make a source directly consumable by
RxJS, which is worth not spoiling by accident.

`rxjs` is not a dependency of this package. The claims here come from its
documentation and issue tracker rather than from a test in this repository, so
verify them against your own version before relying on them.

## A source is an RxJS event target already

`fromEvent` supports three kinds of target: DOM `addEventListener` /
`removeEventListener`, Node `addListener` / `removeListener`, and jQuery-style
`on` / `off`. The contract is the third, so a conforming object works with no
adapter and no dependency on either side:

```
fromEvent(model, 'change')
  .pipe(mergeMap(changes => changes))
  .subscribe(change => ...);
```

Each emission is a `Change[]`, so an RxJS consumer flattens it if it wants
individual entries. The batch is visible rather than hidden, which is the right
default.

This is another payoff of using `off` rather than a disposer returned by `on`.
With the disposer form, `fromEvent` would still recognise the target and would
have no correct way to unsubscribe.

## Two routes for two kinds of thing

- `fromEvent(source, 'change')` for a source.
- `from(chain)` for a query — not implemented; see below.

Do not confuse them. A source conforms to the contract; a query is an immutable
chain with `subscribe` and `.value` and no `on`/`off` at all.

## Semantic mismatches

- A chain is cold like an RxJS `Observable`, but it replays: executing it calls
  back with the current value before any change arrives. The closest analogue is
  a `defer` producing a replaying stream, and an adapter that does not emit the
  current value synchronously on subscribe changes the semantics silently.
- A chain never completes. `lastValueFrom`, `toArray`, `reduce` and `last()`
  hang; `firstValueFrom` and `take(n)` are fine.
- The contract has no error channel, so `catchError` on a stream built from a
  source catches nothing the source raises. That is not because errors vanish.
  `asljs-eventful` has an error path, but it is out of band rather than a
  per-stream channel: a throwing listener reaches the per-instance `error` hook
  and the package-level `eventful.on('error')`, and an error neither consumes is
  rethrown from a microtask into the platform's unhandled-error channel.
  Bridging that into an RxJS stream means subscribing to `eventful.on('error')`
  separately and filtering on the `object` its payload carries.
- With `strict: true`, listener errors are not isolated at all: `emit` rethrows,
  so the error propagates out of the mutation that caused it. RxJS normally
  contains an error raised inside its own pipeline and routes it to the
  subscriber, so this mostly affects listeners attached directly rather than
  through `fromEvent`. Both are reachable through
  [the `eventful` factory seam](converter.md#eventfuls-own-options).
- Unsubscribe returns `boolean` where RxJS expects `void`. An adapter ignores
  it.

Synchronous emission is the one thing that lines up without comment: RxJS
dispatches synchronously unless given a scheduler, and so does this.

## RxJS as a source is a non-goal

An RxJS `Observable` cannot be passed to `observe()`. It has `subscribe`, not
`on`/`off`, and no current value. A `BehaviorSubject` is adaptable because it
has `getValue()`, but that is a shim a caller writes.

Recorded as a non-goal deliberately: "integrates with RxJS" otherwise invites
the assumption that it goes both ways.

## What this means for scope

`at(path)` is the operator with no RxJS equivalent — descent that resubscribes
at each segment, which is why `pluck` was deprecated in favour of a `map` that
cannot. Everything else this package might add, RxJS already has and does
better.

So the operator set stays small: `observe`, `at`, `subscribe`, and a minimal
`map`, `filter`, `distinct` and `combine` for callers who do not have RxJS. A
reader moving between the two libraries meets the same words meaning the same
things.

## Not implemented

`[Symbol.observable]` on a chain, so that `from(chain)` works, is not built.

When it is, it should implement exactly one protocol. RxJS's `innerFrom`
dispatches in the order interop observable, array-like, promise, async iterable,
iterable, readable stream. A chain carrying both `[Symbol.observable]` and
`[Symbol.asyncIterator]` takes the interop branch only if its
`Symbol.observable` is the one RxJS resolves; where it is not — the known case
being a polyfill imported after RxJS, so it never reaches the prototype — RxJS
silently takes the async-iterable branch instead, where error handling is
terminal rather than per-notification. Same code, different semantics, no
warning.

## See also

- [The contract](contract.md) — what makes a source an event target.
- [The query](query.md) — what a chain is, and is not.
