# Batching and delivery

## Purpose

`batch(fn)` groups everything that changes during `fn` into one notification per
emitter. It is the boundary that fills the entry list the
[contract](contract.md) carries, and it is what turns an array operation from N
notifications into one.

Delivery is synchronous. A list only pays off if something fills it, and the
proxy traps fire one at a time and cannot tell that `shift()` is a single
operation, so the boundary has to be explicit.

## Usage

```js
import { batch, observable } from 'asljs-observable';

const model = observable({ first: 'Ada', last: 'Lovelace' });

model.on('change', changes =>
  console.log('one notification, entries:', changes.length));

batch(() => {
  model.first = 'Grace';
  model.last = 'Hopper';
});

// Output:
// one notification, entries: 2
```

## What a batch does, exactly

### Repeated writes coalesce

Two entries for one property in one list would force every consumer to fold
them, and the fold has only one sensible result: the first `previous` and the
last `value`.

```js
import { batch, observable } from 'asljs-observable';

const model = observable({ n: 1 });

model.on('change', changes => console.log(JSON.stringify(changes)));

batch(() => {
  model.n = 2;
  model.n = 3;
});

// Output:
// [{"kind":"set","property":"n","value":3,"previous":1}]
```

A coalesced entry whose net effect is nothing is dropped, because the entry list
is what changed. A batch in which nothing changed reports nothing at all.

### An exception still flushes

The writes have already landed. Discarding their notifications would leave
listeners describing a model that no longer exists, so the collected entries are
delivered and the exception propagates after the flush.

```js
import { batch, observable } from 'asljs-observable';

const model = observable({ n: 1 });

model.on('change', changes => console.log('delivered:', changes.length));

try {
  batch(() => {
    model.n = 2;

    throw new Error('boom');
  });
} catch (error) {
  console.log('propagated:', error.message);
}

// Output:
// delivered: 1
// propagated: boom
```

### Nesting is counted, not stacked

An inner `batch` joins the outer one, and only the outermost close emits.

### Grouping is per emitter

"One notification" always means one per source. A batch touching `model.user`
and `model.items` produces one `change` on each of the two objects, because each
is its own emitter, and their relative order is the order the writes happened.

```js
import { batch, observable } from 'asljs-observable';

const model = observable(
  { user: { name: 'Ada' }, items: { count: 0 } },
  { deep: true });

model.items.on('change', () => console.log('items notified'));
model.user.on('change', () => console.log('user notified'));

batch(() => {
  model.user.name = 'Grace';
  model.items.count = 1;
});

// Output:
// user notified
// items notified
```

A hand-written participant cannot be made to join a batch — it emits when it
emits — so a mixed model gets batching only across the parts this package's
producers own. `ObservableObject` does join, because it reports through the same
path the converter does.

## Writes made during delivery

A write made by a listener while it is being notified is queued and delivered
after the current notification finishes, as its own `change`. It does not join
the list being delivered.

This fixes an inversion. Given a listener that derives one property from another
and a second listener that renders, the renderer would otherwise be told about
the effect before the cause, and which order it saw would depend on subscription
order:

```js
import { observable } from 'asljs-observable';

const model = observable({ celsius: 0, fahrenheit: 32 });

model.on('change', changes => {
  for (const change of changes) {
    if (change.property === 'celsius') {
      model.fahrenheit = change.value * 9 / 5 + 32;
    }
  }
});

model.on('change', changes => {
  for (const change of changes) {
    console.log('render', change.property, '=', change.value);
  }
});

model.celsius = 100;

// Output:
// render celsius = 100
// render fahrenheit = 212
```

The alternative of appending to the list being delivered is worse than either:
listeners that already ran would have seen a shorter list than those still to
run, so one notification would carry different payloads to different
subscribers.

Two precedents. Valtio v3 queues writes made by callbacks for the next round.
And `eventful` already answers the analogous question this way: `emit` copies
the listener set before dispatching, so a listener that subscribes or
unsubscribes affects the next emit rather than the one in progress.

### Four things it does not do

- **The write itself lands immediately; only its notification is queued.** A
  consumer that re-reads rather than reading the payload — which is what the
  query does — can therefore observe the new value before it is told about it.
  Queueing makes the entries every subscriber receives consistent and ordered;
  it does not make the model stand still.
- **It needs module-level state.** The inversion it fixes involves a listener on
  one object writing to another, so the delivery state is shared across the
  package rather than held per object.
- **It covers this package's producers only.** A hand-written participant that
  emits from inside a delivery dispatches nested, exactly as it would otherwise.
  The contract does not constrain timing, so this is consistent — but "the same
  for every subscriber" is a promise about converted models and
  `ObservableObject`, not about every model.
- **The cap throws after the queued writes have landed.** See below.

### The round cap

Queueing converts recursion into iteration, which does not by itself stop a
cycle: two listeners writing to each other would loop forever in rounds instead
of overflowing the stack, which is worse, because there is no stack trace to
show what happened.

So the round count is capped at 100 and the cap throws, naming the properties
still changing. Vue caps the same way, though it warns and abandons the flush
rather than throwing; throwing is the choice here, because a silently abandoned
flush leaves the model and every view disagreeing with no indication.

The queued writes have already landed and are never delivered, so this is a
broken state to recover from rather than a rejected operation, and the message
says so.

The common case terminates without the cap, and it is deduplication that makes
it do so: a two-way binding settles because the write back is equal to what is
already there and `Object.is` suppresses it.

```js
import { observable } from 'asljs-observable';

const model = observable({ left: 0, right: 0 });

let deliveries = 0;

model.on('change', changes => {
  deliveries++;

  for (const change of changes) {
    if (change.property === 'left') {
      model.right = change.value;
    } else {
      model.left = change.value;
    }
  }
});

model.left = 5;

console.log('right:', model.right, 'deliveries:', deliveries);

// Output:
// right: 5 deliveries: 2
```

## Why synchronous, with an explicit batch

Three ways to get a batch boundary: flush on a microtask, which batches
everything automatically but makes emission asynchronous; an explicit
`batch(fn)`; or wrapping the mutating array methods so each closes its own
batch.

Valtio has already run this experiment. Version 2 batched on a microtask by
default with a `notifyInSync` opt-out; version 3 removed `notifyInSync`, made
notifications synchronous, and added `batch()`, keeping the microtask scheduler
only for an opt-in asynchronous subscribe. The library furthest down this road
reversed the asynchronous default after living with it.

So: synchronous delivery, an explicit `batch(fn)`, and the converter wrapping
its own mutating array methods in a batch. A hand-written participant emits a
one-element list and never thinks about batching.

Synchronous delivery also pays for itself elsewhere: it is what lets `combine`
recompute once per delivery with a counter rather than a scheduler. See
[the query](query.md#combining-paths).

## See also

- [The contract](contract.md) — what the list carries.
- [The converter](converter.md#arrays) — which array methods batch.
- [Performance](performance.md) — grouping writes in a model that has to be
  fast.
