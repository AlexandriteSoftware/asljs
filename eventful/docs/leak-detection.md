# Detecting leaked subscriptions

A leaked subscription is invisible from both ends. The subscriber is gone, but
the emitter still holds its listener, so the subscriber's state stays reachable
through the emitter's listener map. Nothing fails. Memory grows, every emit does
a little more work, and something unrelated falls over later.

It only happens on shared, long lived emitters, where the subscriber detaches
and the emitter does not. On an object you own, `removeAllListeners` ends the
question. On an object you were handed, you have to notice.

Both recipes below are consumer code. They use only the public API, and
`eventful` carries no policy about thresholds or reporting.

## What the package gives you to build on

- Every enhanced object reports its actions to `eventful` itself, so
  `eventful.on('new' | 'on' | 'off' | 'emit', ...)` is a stream of everything
  happening across every instance.
- The stream is gated. Reporting costs nothing until something subscribes, so a
  guard that is not installed is not paid for.
- `getListeners()` answers what is subscribed to one object right now.
- `instanceId` names an instance in a report, as `Cart#3`.

One limit applies to both recipes, and it is inherent: an object enhanced before
you subscribe is never reported, and never gets an identity. Install at startup,
before the application builds anything. Neither recipe can be attached to a
running system to investigate a leak already under way.

## Recipe 1: an in-flight guard

Checks the listener count as subscriptions happen, and warns the first time an
object crosses a threshold on one event.

```js
import {
  eventful
} from 'asljs-eventful';

export function installLeakGuard(
  { maxListeners = 10, warn = console.warn } = {}
)
{
  const warned = new WeakMap();

  return eventful.on('on', ({ object, id, event }) =>
  {
    const count = object.getListeners().get(event)?.length ?? 0;

    if (count <= maxListeners) {
      return;
    }

    let events = warned.get(object);

    if (events === undefined) {
      events = new Set();
      warned.set(object, events);
    }

    if (events.has(event)) {
      return;
    }

    events.add(event);

    warn(`${id} has ${count} listeners for "${String(event)}". Possible leak.`);
  });
}
```

With `maxListeners: 3`:

```
6 subscribers that never detach   Object#1 has 4 listeners for
                                  "change". Possible leak.
50 subscribe and unsubscribe      silent
50 once listeners that fire       silent
after uninstall()                 silent
```

Notes:

- It returns the unsubscribe closure. Calling it stops the guard and, because
  reporting is gated, switches the global notifications back off.
- `WeakMap` holds the warned-once bookkeeping, so the guard neither grows nor
  retains the objects it watched.
- Reading `getListeners()` on every subscription allocates a map and arrays. On
  a hot path, count with a cheap counter and call `getListeners()` only to
  confirm before warning.
- It speaks without being asked, which is the point: a leak is what nobody
  thought to look for.

## Recipe 2: a snapshot inspector

Records every object as it is enhanced, holding it weakly, and reports on
demand.

```js
import {
  eventful
} from 'asljs-eventful';

export function createEmitterRegistry()
{
  let entries = [];

  const stop = eventful.on('new', ({ object, id }) =>
  {
    entries.push({ id, ref: new WeakRef(object) });
  });

  function sweep({ minListeners = 1 } = {})
  {
    const live = [];
    const report = [];

    for (const entry of entries) {
      const object = entry.ref.deref();

      if (object === undefined) {
        continue;
      }

      live.push(entry);

      for (const [event, listeners] of object.getListeners()) {
        if (listeners.length >= minListeners) {
          report.push(
            { id: entry.id, event: String(event), count: listeners.length }
          );
        }
      }
    }

    entries = live;
    report.sort((left, right) => right.count - left.count);

    return { tracked: entries.length, report };
  }

  return { sweep, stop };
}
```

`WeakRef` means the registry never keeps an emitter alive, and a sweep drops the
references that have been collected. Creating 102 emitters, of which 100 are
discarded:

```
tracked before gc:       102
tracked after gc+sweep:  3
report: [{"id":"Store#1","event":"change","count":12}]
```

### Compare two sweeps, do not pick a threshold

A count is a poor signal on its own. Thirty subscribers is a leak in one
application and a busy list in another: in this repository, each `asljs-list`
element subscribes to `set`, `delete` and `define` on the collection it renders,
so a page with thirty of them has thirty legitimate listeners per event.

Growth between sweeps is the better signal, because a leak is not many
listeners, it is listeners that keep arriving:

```js
const before = new Map(
  registry.sweep().report.map(r => [`${r.id} ${r.event}`, r.count])
);

// ... exercise the application ...

const growing = registry.sweep().report.filter(
  r => r.count > (before.get(`${r.id} ${r.event}`) ?? 0)
);
```

Against one store with thirty stable subscribers and one that grew from five to
twelve:

```
static threshold of 10 flags:   Store#1=30, Store#2=12
growth between sweeps flags:    Store#2: 5 -> 12
```

The busy store is not a leak, and only the second report says so.

Notes:

- Nothing happens per subscription. The cost is the `new` notification and the
  sweep you ask for, so this suits a devtools button, a test teardown, or an
  interval.
- A ranked report names the instance, the event and the count, which is enough
  to find the subscriber. The same handler appearing many times on one object is
  one subscriber that re-subscribed without detaching.
- `WeakRef` is ES2021. Both recipes are development tools, so this is usually
  fine, but it is a real constraint in an old runtime.
- Instance numbers are assigned when an object is first reported, so `Store#1`
  means the first one this registry saw, not the first one created.

## Choosing between them

- Use the guard when you want to be told, during development, that something
  crossed a line you did not expect to cross. It is the only one that speaks on
  its own.
- Use the inspector when you are investigating, or when you want a check with no
  per-subscription cost: a sweep at the end of a test, or two sweeps around a
  scenario to see what grew.
- Use both, from the same startup path. They observe different things, the guard
  catching a sudden crossing and the inspector catching slow growth, and neither
  needs the other.
