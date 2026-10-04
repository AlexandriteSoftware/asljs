# Event Source Guide

DALI event source stores chained transactions and supports linked stores for
synchronization.

## Core Types

- `EventSourceTransaction`
- `EventSourceEvent`
- `EventSourceAdapter`
- `EventSourceManager`

Each transaction has:

- `id`
- `previousTransactionId`
- `sequence`
- `sagaId`
- `events[]`

This forms an append-only chain.

## Setup

```ts
eventSourceSetup(db)
eventSourceProjectionSetup(db)
```

## Local Adapter

Use `IndexedDbEventSourceAdapter` for local event storage.

## Linked Stores and Commit Barrier

`EventSourceManager(local, linked[])` supports additional stores (for example,
remote API-backed adapters).

Append flow:

1. synchronize local by pulling from linked stores
2. read local head
3. verify each linked head equals expected previous id
4. append to each linked store
5. append to local

If any linked append fails, append is not completed in local.

## Compare-and-Set Rule

Adapters enforce:

- append succeeds only when `expectedPreviousTransactionId` equals current head

This is equivalent to optimistic CAS on event stream head.

## Remote Ahead Flow

If remote is ahead:

- manager pulls remote transactions to local
- then appends next transaction using updated head

## Projection Checkpoints

Use `EventSourceProjectionManager` with persisted checkpoint.

Checkpoint stores `appliedTransactionId`. `applyPending()` reads all
transactions after checkpoint and applies them in order.

This supports table sets that may lag behind event source.

## Practical Consistency Model

This design is eventually consistent and conflict-aware.

It avoids pretending cross-system atomicity while still guaranteeing ordered,
CAS-protected stream updates and deterministic replay.
