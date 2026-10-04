# API

## Purpose

The public surface of `asljs-dali`, grouped by layer, and which API to pick for
a task.

## Concept map

- `dbOpen(...)`, `dbDelete(...)`, and `dbRequestAsync(...)` manage database
  setup and low-level request handling.
- `Table<T>` is the main high-level abstraction for typed IndexedDB work.
- `notify(...)` and `observe(...)` handle committed change notifications.
- `record(...)` and `recordset(...)` provide live-first containers.
- Transaction helpers support lower-level control when `Table<T>` is not the
  right layer.
- Version and delete strategies customize concurrency and deletion behavior.

## Choosing an API

- If you need a one-time single-row read, then use `getOne(key)`.
- If you need a one-time filtered scan, then use `scan(predicate)`.
- If you need live single-row tracking, then use `record(key)`.
- If you need live filtered tracking, then use `recordset(predicate)`.
- If you need local-only mutation notifications, then use `notify(...)`.
- If you need local-plus-remote committed notifications, then use
  `observe(...)`.

## Exports

Core:

- `dbOpen(name, upgrades)`
- `dbDelete(name)`
- `dbRequestAsync(request)`
- `Table<T>`

Live views:

- `LiveRecord<T>` — live single-record container returned by `Table.record(key)`
  - Events (ASLJS eventful): `changed`, `deleted`
  - Observable contract: `change`; query paths such as `record.someField`
- `LiveRecordSet<T>` — live filtered set container returned by
  `Table.recordset(predicate)`
  - Events (ASLJS eventful): `added`, `removed`, `updated`, `cleared`, `changed`
  - Observable contract: `change`; query paths such as `records.length`
- `LiveRecordEvents<T>` — event map type for `LiveRecord`
- `LiveRecordSetEvents<T>` — event map type for `LiveRecordSet`

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
- `TableObservedReceiver<T>` — callback type for `observe()` Event-source and
  saga helpers:

- `EventSourceManager`
- `IndexedDbEventSourceAdapter`
- `EventSourceProjectionManager`
- `SagaManager`
- setup and store helper exports from the event-source and saga modules,
  described in [Event Source Guide][EVE] and [Saga Guide][SAG]

## Safe usage rules

- Use `Table<T>` before dropping to raw transaction helpers.
- Prefer snapshot reads unless reactivity is actually needed.
- Use `observe(...)` only when remote-origin changes matter.
- Dispose live views when they are no longer needed.
- Treat `recordset(predicate)` as client-side filtering, not as a query engine.

[EVE]: event-source.md
[SAG]: saga.md
