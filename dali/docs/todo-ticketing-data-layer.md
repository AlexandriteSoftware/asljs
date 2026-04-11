# Todo Ticketing Data Layer Guide

This guide is conceptual and maps a robust application data layer to DALI
features.

For implementation details, use:

- [Table Guide](./table.md)
- [Delete Strategy and Soft Deletes](./delete-strategy-soft-deletes.md)
- [Versioning Strategy](./versioning-strategy.md)
- [Saga Guide](./saga.md)
- [Event Source Guide](./event-source.md)

## Target Architecture

Use five layers:

1. Command tables (IndexedDB stores managed by `Table<T>`)
2. Strategies (delete + version)
3. Saga orchestration (`SagaManager`)
4. Event log (`EventSourceManager` with local + remote linked stores)
5. Projections/read models (`EventSourceProjectionManager`)

## Ticket Entity Shape

Typical command-side ticket record:

- `id: string`
- `version: string`
- `deleted: string` (`''` active, UUID deleted)
- business fields (`title`, `status`, `assigneeId`, ...)

## Write Path (Commands)

1. Start saga.
2. Execute all table writes inside saga action.
3. Saga persists undo/forward entries.
4. Saga completion requires event source append success (if linked).
5. Return command result.

If anything fails:

- saga rollback replays compensating operations
- incomplete saga remains recoverable on next startup

## Read Path (Queries)

Queries should use projection/read-model tables populated from event source
transactions.

Benefits:

- decoupled query shape
- deterministic replay
- startup catch-up from checkpoint

## Startup Sequence

Recommended startup order:

1. Open DB and run setup for tables, saga stores, event source stores, and
   projection checkpoint store.
2. Call `saga.recoverPending()`.
3. Call `eventSourceManager.synchronize()` to pull remote-ahead transactions.
4. Call projection `applyPending()` for each read model.

## Sync Strategy (Local + Remote)

Use linked event stores:

- local IndexedDB adapter
- remote endpoint adapter

Append requirements:

- remote head id must equal new transaction previous id
- all linked stores must accept append
- only then local commit is finalized

When remote is ahead:

- pull remote transactions to local first
- apply pending projections
- continue normal writes

## Failure Handling Rules

- Treat head mismatch as normal conflict, not fatal corruption.
- Retry append after synchronize.
- Keep adapter append idempotent by transaction id.
- Do not mark saga complete before event transaction is committed.

## Minimal Implementation Roadmap

1. Define entity stores and indexes.
2. Attach delete/version strategies to tables.
3. Add saga and event source setup in DB upgrade.
4. Build command handlers around `SagaManager.execute`.
5. Build read model projectors with persisted checkpoints.
6. Add sync loop that runs pull + projection catch-up.
7. Add integration tests for:
   - rollback of pending saga
   - linked append barrier
   - remote ahead synchronization
   - projection checkpoint replay
