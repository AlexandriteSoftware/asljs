# dali

> Part of [Alexandrite Software Library][#1] - a set of high-quality,
performant JavaScript libraries for everyday use.

## Overview

`asljs-dali` is a data layer for apps that store data in IndexedDB. It is for
developers who want a typed, event-aware table abstraction instead of
hand-writing low-level request and transaction plumbing. Use it to model
stores as `Table<T>`, keep CRUD operations consistent, and optionally enforce
optimistic concurrency with version strategies.

## Installation

```bash
npm install asljs-dali
```

NPM Package: [asljs-dali](https://www.npmjs.com/package/asljs-dali)

## Usage

```ts
import {
    dbOpen,
    Table,
  } from 'asljs-dali';

type Note =
  { id: string;
    title: string; };

const db =
  await dbOpen(
    'notes-db',
    [ targetDb => {
        targetDb.createObjectStore(
          'notes',
          { keyPath: 'id' });
      } ]);

const notes =
  new Table<Note>(
    'notes',
    db,
    { /* options */ });

await notes.add(
  { id: '1',
    title: 'Hello' });

const row =
  await notes.getOne('1');
```

### Cross-tab notifications with `observe()`

`Table` supports two notification paths:

| Method | Who calls the callback |
|---|---|
| `notify(receiver)` | Local writes committed by **this** Table instance only |
| `observe(receiver)` | Local writes **and** remote writes from other tabs |

Pass a `broadcastService` to the Table constructor to enable cross-tab delivery.
The service is an abstraction — you can implement it with `BroadcastChannel` or
any equivalent transport.

```ts
import {
    type TableBroadcastMessage,
    type TableBroadcastService,
  } from 'asljs-dali';

// BroadcastChannel-backed implementation
function makeBroadcastService(
    channelName: string
  ): TableBroadcastService
{
  const channel = new BroadcastChannel(channelName);

  return {
    publish(message: TableBroadcastMessage) {
      channel.postMessage(message);
    },
    subscribe(handler) {
      const listener = (ev: MessageEvent) => handler(ev.data);
      channel.addEventListener('message', listener);
      return () => channel.removeEventListener('message', listener);
    },
  };
}

const notes =
  new Table<Note>(
    'notes',
    db,
    { broadcastService: makeBroadcastService('notes-sync') });

// Local-only — fires only for writes made by this Table instance.
notes.notify(
  { add(record) { console.log('local add', record); } });

// Observed — fires for both local and remote writes.
// The `source` field tells you where the change came from.
const unobserve =
  notes.observe(event => {
    console.log(event.source, event.eventType);
    if (event.eventType === 'add')
      console.log(event.record);
  });

// When the Table is no longer needed, dispose it to stop listening.
notes.dispose();
```

**Design rules:**

- Broadcast messages are published **only after** a successful IndexedDB
  transaction; rolled-back or provisional changes are never broadcast.
- A Table instance **discards its own echoed messages** using a per-instance
  `originId` included in every broadcast message.
- Remote messages are routed only to `observe()` subscribers; local-only
  `notify()` subscribers are never called for remote events.
- A Table receiving a remote message **does not re-publish** it, preventing
  broadcast loops.

## API Reference

Core:

- `dbOpen(name, upgrades)`
- `dbDelete(name)`
- `dbRequestAsync(request)`
- `Table<T>`

Versioning:

- `TableVersionStrategy<T>`
- `TableVersionConflictError`
- `IncrementTableVersionStrategy<T>`
- `UuidTableVersionStrategy<T>`

Delete strategies:

- `TableDeleteStrategy<T>`
- `UuidSoftDeleteTableDeleteStrategy<T>`

Transactions:

- `TxMode`
- `txRead(db, storeName, tx?)`
- `txWrite(db, storeName, tx?)`
- `txDone(tx)`
- `txEnsure(tx, storeName, mode)`
- `txReuseOrCreate(tx, storeNames, mode, db)`

Broadcast / cross-tab:

- `TableBroadcastService` — interface for the publish/subscribe transport
- `TableBroadcastMessage` — message shape published on every committed change
- `TableObservedEvent<T>` — event delivered to `observe()` subscribers
- `TableObservedReceiver<T>` — callback type for `observe()`

## License

MIT License. See [LICENSE](LICENSE.md) for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
