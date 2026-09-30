# The query

## Purpose

Read a value out of a source and re-read it when it changes. `observe(source)`
starts a chain, operators refine it, and a terminal executes it.

Nothing is injected into the source. A query is a description over a source
rather than a method on it, which is why there is no `watch` method and no
`observable.watch`.

## Usage

```js
import { observable, observe } from 'asljs-observable';

const state = observable({ user: { name: 'Alice' }, active: false });

observe(state)
  .at('user.name')
  .subscribe(name => console.log('name', name));

state.user.name = 'Bob';

state.user = observable({ name: 'Carol' });

state.user.name = 'Dan';

// Output:
// name Alice
// name Bob
// name Carol
// name Dan
```

`at` descends a dotted path and resubscribes at each segment, so replacing an
intermediate value rebinds the rest of the path. That is the one thing a `map`
cannot do, and the reason RxJS deprecated `pluck` does not apply here.

## Operators

Each returns a **new** chain. Nothing is subscribed until a terminal executes
it, so holding a chain, passing it around and branching off it are all free.

- `at(path)` descends a dotted path. Array indices are ordinary segments, so
  `at('items.0.name')` works.
- `map(fn)` projects.
- `filter(fn)` keeps the values the predicate accepts.
- `distinct(compare)` replaces the default comparison for one step.
- `combine([ chainA, chainB ])` reports several chains together, as a tuple.

```js
import { observable, observe } from 'asljs-observable';

const state = observable({ user: { name: 'ada' } });

const shouted = observe(state)
  .at('user.name')
  .map(name => name.toUpperCase());

shouted.subscribe(name => console.log('shouted', name));

observe(state)
  .at('user.name')
  .filter(name => name.length > 3)
  .subscribe(name => console.log('long', name));

state.user.name = 'grace';

console.log('read once:', shouted.value);

// Output:
// shouted ADA
// shouted GRACE
// long grace
// read once: GRACE
```

## Terminals

- `subscribe(fn)` builds the subscriptions, calls back with the current value,
  and returns one disposer that tears them down. The disposer is idempotent: the
  first call returns `true`, later calls `false`.
- `.value` evaluates the chain on demand, without subscribing.

## Combining paths

```js
import { batch, combine, observable, observe } from 'asljs-observable';

const state = observable({ name: 'Alice', active: false });

const unsubscribe = combine([
  observe(state).at('name'),
  observe(state).at('active')
]).subscribe(([ name, active ]) => console.log(name, active));

batch(() => {
  state.name = 'Bob';
  state.active = true;
});

unsubscribe();

// Output:
// Alice false
// Bob true
```

`combine` recomputes once per notification it receives, not once per input that
reaches it. Two of its inputs reading from the same source are both notified by
one `change`, and without that rule a subscriber would see the intermediate
tuple before the settled one. The mechanism is a module-level counter
incremented once per delivery; it works because delivery is synchronous, so
nothing else can be running.

Grouping is per emitter, so a batch touching two objects still produces one
notification each and `combine` recomputes twice. See
[batching](batching.md#grouping-is-per-emitter).

## Equality and deduplication

Every operator compares its result with the last value it emitted, using
`Object.is`, and stays silent when they match. That is the same comparison the
converter's `set` trap makes, so one rule holds from the source to the terminal.

The case it exists for: given `observe(model).at('user').map(u => u.role)`,
replacing `model.user` with a different object of the same role is a real change
at `at` and no change at `map`. Without deduplication the subscriber would run
for a change it cannot see, and the more a chain projects away the more often
that happens — backwards, since projecting away detail is what `map` is for.

It also makes the unrecognised-kind rule affordable: a re-read provoked by a
change the chain does not care about produces the same value and goes no
further.

Consequences:

- The first callback always happens, except where `filter` rejects the current
  value. A chain that starts rejected is silent, and its `.value` is
  `undefined`.
- A projection that rebuilds a value is never deduplicated.
  `map(u => ({ name: u.name }))` returns a new object every time, `Object.is`
  says different, and it fires on every upstream notification. `distinct` is the
  way out, and keeping it separate is why `map` needs no comparison argument.
- `combine` is never deduplicated, because it builds a fresh tuple. That is a
  consequence of the rule rather than an exception to it.
- Executing a chain is stateful even though the chain is not. Each operator in
  an execution holds its last emitted value; the recipe stays an immutable
  description.

```js
import { observable, observe } from 'asljs-observable';

const state = observable({ user: { name: 'Alice' } });

const projected = observe(state)
  .at('user')
  .map(user => ({ name: user.name }));

projected.subscribe(() => console.log('plain fired'));

projected
  .distinct((a, b) => a.name === b.name)
  .subscribe(() => console.log('distinct fired'));

state.user = observable({ name: 'Alice' });

// Output:
// plain fired
// distinct fired
// plain fired
```

## Typed paths

Paths are checked at compile time against the model. The names `eventful`
occupies are excluded, so the methods conversion adds are not offered as
properties to observe.

```ts
import { observable, observe } from 'asljs-observable';

const state = observable({ user: { name: 'Alice' }, active: false });

observe(state).at('user.name').subscribe(name => console.log(name.length));

// error TS2345
observe(state).at('user.nmae');
```

Descent is capped at five levels. Without the cap a self-referential model
expands forever, so it can be tuned but not removed.

## Constraints

- **The root must conform.** `observe(source)` throws when it does not, and
  declares `Observable`, so TypeScript rejects a plain object before the runtime
  does. The message names the fix: wrap it with `observable()`. Before 0.6 the
  query degraded silently instead, calling back once with a snapshot and
  returning a disposer that disposed nothing.
- **Intermediate segments are not checked.** The last segment of a path is
  always non-conforming — `at('user.name')` ends at a string — so "every segment
  must conform" cannot be the rule. `shallow: true` produces partial observation
  on purpose: the root is heard, and what it holds is not.
- **A chain is not a source.** It has `subscribe` and `.value`, and no
  `on`/`off` at all. That is what makes disposal answer itself: one `subscribe`
  builds one subscription tree and returns the one disposer that owns it, with
  no node lifetime to manage and nothing attached by a chain that is built and
  never subscribed.
- **Fan-out duplicates work.** Two subscriptions off one chain put two listeners
  on the source and walk the path twice per change. RxJS calls this cold, and it
  is why `share()` exists there. At the scale this package targets it is noise.

## Edge cases

- A path segment that is missing reads as `undefined` rather than throwing, and
  the chain binds as soon as the segment appears.
- A path is validated when the chain is built, not when it runs. An empty path,
  a leading or trailing dot, and an empty segment all throw a `TypeError`.
- Teardown prefers a disposer the source returns from `on`, and falls back to
  `off`. A source whose `on` returns `this`, such as a Node `EventEmitter`, uses
  `off`.
- A cyclic model can bind two segments to the same object, which notifies twice;
  deduplication absorbs the second.

## Vocabulary

These are Array and RxJS words, not LINQ ones, and that is deliberate. RxJS 5
deprecated `select` in favour of `map` and `where` in favour of `filter`, on the
grounds that `map` works the same way as the Array method of the same name.
Rx.NET kept the LINQ names; the JavaScript port moved away from them.

`subscribe` is the terminal in RxJS, Svelte stores, valtio and nanostores. An
`exec` would read as run-once, when what it establishes has a lifetime.

`at` is the one name with no consensus behind it. It is short, echoes
`Array.prototype.at`, and leaves `pluck` free if it turns out to read better.

The operator set stays small on purpose: `at` is the operator RxJS has no
equivalent for, and everything else RxJS already does better. See
[RxJS interop](rxjs.md).

## See also

- [The contract](contract.md) — what a source has to provide.
- [Batching and delivery](batching.md) — when a notification arrives.
