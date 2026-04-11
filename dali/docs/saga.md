# Saga Guide

`SagaManager` implements application-level transactions across multiple table
operations.

## What Saga Guarantees

- Every captured table event is persisted as a saga entry.
- If action fails, compensating operations roll back captured changes.
- On app restart, unfinished sagas can be detected and rolled back.

## What Saga Does Not Guarantee

- Distributed atomic commit with external services.

Use saga with event source for durable command logs and sync workflows.

## Setup

Create saga stores in DB upgrade:

```ts
sagaSetup(db)
```

## Execution

```ts
await saga.execute('name', [tableA, tableB], async () => {
  // perform table writes
})
```

`execute` subscribes to table events during action execution and stores forward
and undo operations.

## Recovery

On startup:

```ts
await saga.recoverPending()
```

This rolls back sagas that remained in `started` state (for example due to
browser interruption).

## Saga + Event Source Completion Rule

When an `EventSourceManager` is linked into `SagaManager`, saga status becomes
`completed` only after event source transaction append succeeds.

If event append fails, saga stays incomplete and can be recovered.

## Rollback Mechanics

Rollback replays undo entries in reverse order:

- undo `delete` => delete by key
- undo `put` => put previous record
- undo `clear` => clear and re-add previous records

This gives compensating-transaction behavior, not DB snapshot restore.
