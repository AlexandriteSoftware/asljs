# The contract

## Purpose

What an object must provide to be observed. It is the reason the package exists:
`observable()` is a helper for the common case, and the query works against
anything that satisfies this, whether this package built it or not.

It is deliberately loose. No base class, no marker interface, no dependency on
`asljs-eventful`. A Node `EventEmitter` satisfies the shape.

## The shape

```
type Change =
  | { kind: 'set'; property: string; value: unknown; previous: unknown; }
  | {
    kind: 'splice';
    index: number;
    removed: readonly unknown[];
    added: readonly unknown[];
  }
  | { kind: 'reset'; };

interface Observable
{
  on(event: 'change', listener: (changes: readonly Change[]) => void): unknown;
  off(event: 'change', listener: (changes: readonly Change[]) => void): unknown;
}
```

- `on(event, listener)` subscribes. The return value is unspecified, so an
  emitter that returns `this` conforms. A function it returns is used as a
  disposer where one is offered.
- `off(event, listener)` unsubscribes, and is the canonical teardown path.
- The payload is always a list, even for a single change.

`isObservable(value)` reports whether a value conforms, and
`asObservable(value)` returns it narrowed or `undefined`. Both `on` and `off`
are required: testing for `on` alone would admit a value that then fails at
teardown, which is exactly what a Node `EventEmitter` does.

## Implementing it

A participant needs one event and two methods:

```js
import { observe } from 'asljs-observable';

function counter() {
  const listeners = new Set();

  let count = 0;

  return {
    get count() { return count; },

    increment() {
      const previous = count;

      count++;

      const changes = [
        { kind: 'set', property: 'count', value: count, previous }
      ];

      for (const listener of [ ...listeners ]) {
        listener(changes);
      }
    },

    on(event, listener) { listeners.add(listener); },
    off(event, listener) { return listeners.delete(listener); }
  };
}

const model = counter();

observe(model).at('count').subscribe(count => console.log('count', count));

model.increment();
model.increment();

// Output:
// count 0
// count 1
// count 2
```

A Node `EventEmitter` participates as soon as it emits `change`:

```js
import { EventEmitter } from 'node:events';
import { observe } from 'asljs-observable';

class Model extends EventEmitter {
  #name = 'Alice';

  get name() { return this.#name; }

  set name(value) {
    const previous = this.#name;

    this.#name = value;

    this.emit('change', [
      { kind: 'set', property: 'name', value, previous }
    ]);
  }
}

const model = new Model();

const unsubscribe =
  observe(model).at('name').subscribe(name => console.log('name', name));

model.name = 'Bob';

unsubscribe();

console.log('listeners left:', model.listenerCount('change'));

// Output:
// name Alice
// name Bob
// listeners left: 0
```

`ObservableObject` is the base class to extend when the model is a class of your
own; see [the converter][CON].

## Consuming it

```ts
import { observable, type Change } from 'asljs-observable';

const model = observable({ a: 1 });

model.on('change', (changes: readonly Change[]) => {
  for (const change of changes) {
    if (change.kind === 'set') {
      console.log(change.property, change.previous, change.value);
    } else if (change.kind === 'splice') {
      console.log(change.index, change.removed.length, change.added.length);
    } else {
      console.log('read the whole array again');
    }
  }
});
```

## Rules

These are part of the contract, not of one implementation, so a hand-written
producer and a hand-written consumer both have to apply them.

- The contract covers an object's **own** properties. A participant does not
  know its position in someone else's graph, so it never reports a path. Paths
  are composed by the query, which subscribes segment by segment.
- Array indices are ordinary string properties, so an index change is `{ kind:
  'set', property: '0' }`. There is no `index` field on a `set` and no separate
  array change type.
- Removal is a set to `undefined`. There is no delete event.
- A producer emits the most specific description it has, and never both. A
  `shift()` is one `splice` entry, not N `set` entries plus a `splice`.
- `splice` is optional. A participant that only ever emits `set` entries
  conforms fully. Only a producer that intercepts the mutating array methods is
  in a position to know a splice cheaply.
- A `reset` entry says that an array changed so much that it is better read
  again. It carries nothing else, so a consumer reads the array again.
- A `splice` entry counts as a change to every index from `splice.index`
  onwards, and to `length`. It carries no `property`, and nothing else reports
  the length change.
- Entries are in the order the changes were made, not ordered by property or
  index, so `reverse()` on a five-element array reports indices 0, 4, 1, 3.
  Applying them in order turns the previous state into the current one.
- Unchanged positions are absent. The entry list is what changed, never the
  affected range. The middle element of an odd-length reversal never appears.
- An entry kind a consumer does not understand means "something changed,
  re-read". That is what keeps the contract open to further kinds.

## Timing

Timing is not part of the contract. A participant may emit whenever it suits it,
including asynchronously or after debouncing, and it still conforms: the query
re-reads on notification, so a late notification produces a late but correct
read.

A consumer must not assume that listeners have run by the time a mutating call
returns.

What this package's own producers do is narrower than what the contract allows:
they emit synchronously, and [`batch(fn)`][BAT] is the explicit boundary that
fills the list.

## Edge cases

- **Key presence is not observable.** `{ a: undefined }` and `{}` differ in `'a'
  in o`, `Object.keys` and `JSON.stringify`, but removal is reported as a set to
  `undefined`, so a consumer cannot tell them apart. Nor can it tell `delete
  arr[1]` from `arr[1] = undefined`. The query re-reads, so it does not care; a
  consumer that tracks key presence does.
- **A change that changes nothing is not reported.** Producers in this package
  compare with `Object.is` and stay silent when the value is already there, so
  `NaN` replacing `NaN` is silent and `-0` replacing `+0` is a change.
- **A mixed model is only partly batched.** A hand-written participant cannot be
  made to join a `batch`, because it emits when it emits.

## Why one event with a list

The per-property event name (`set:<property>`) this package used before 0.6 is
the Backbone convention. Backbone emits both `change` and `change:[attribute]`;
the old implementation subscribed only the specific form, so a participant
emitting a generic event was invisible to it.

Nothing built since encodes the property in the event name. MobX passes the
property to `observe(object, 'property', listener)` and describes the change
with an object. Nanostores supplies the changed key as a callback argument.
Valtio reports operations with paths.

The deciding argument here is the cost of hand-implementation. Users are
expected to implement the contract themselves, and the alternative is that they
construct N event names and remember the convention for each. One event is one
method to get right, and `change` is the event name an arbitrary emitter is most
likely to already use.

The list is what makes it worth its cost, and the reason is measured rather than
assumed: the old implementation emitted four separate notifications for
`arr.shift()` on a three-element array, and around a hundred on a
hundred-element array. As one event they are one re-read, because the query
re-reads the path rather than reading the payload.

The cost is that every subscriber on an object wakes for any property change on
that object and filters. For models of the size this package targets that is
negligible, and it is what valtio's whole-proxy `subscribe` already does.

## Why not separate levels for arrays

An array change could carry per-index entries and structural entries in separate
buckets, letting each consumer take the granularity it wants. It does not, for
two reasons.

Both views describe the same mutation, so an `unshift` on a hundred elements
would carry a hundred index entries alongside one splice entry. The hundred are
the fan-out the list exists to remove, and keeping them adds a second
description that has to stay consistent with the first, with nothing to catch a
divergence.

No library does it. MobX emits `update` or `splice` per change, never both.
Knockout's `arrayChange` emits an edit script rather than per-index changes
alongside it.

## See also

- [The query][QUE] — reading values out of a source.
- [Batching and delivery][BAT] — what fills the list, and when it arrives.
- [The converter][CON2] — what `observable()` produces.
- [Performance][PER] — when to implement the contract by hand.

[BAT]: batching.md
[CON]: converter.md#observableobject
[CON2]: converter.md
[PER]: performance.md
[QUE]: query.md
