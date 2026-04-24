# ASLJS Dali AI Guidance

## Purpose

Use this file as AI-facing guidance for `asljs-dali`.

`asljs-dali` is an IndexedDB data layer centered on typed `Table<T>` access,
cross-tab observation, live views, transaction helpers, event-source helpers,
and saga helpers.

## Package Scope

Package exports from `src/index.ts` include:

- DB helpers: `dbOpen`, `dbDelete`, `dbRequestAsync`
- Tables and live views: `Table`, `LiveRecord`, `LiveRecordSet`
- Observation and broadcast types
- Version and delete strategies
- Transaction helpers: `txRead`, `txWrite`, `txDone`, `txEnsure`,
  `txReuseOrCreate`, `TxMode`
- Event-source helpers and managers
- Saga helpers and managers

## Preferred Usage Patterns

- Model stores through `Table<T>` instead of ad hoc request plumbing.
- Use `notify(...)` for local-only subscribers.
- Use `observe(...)` only when cross-tab or remote-origin events are needed.
- Use `record(key)` and `recordset(predicate)` for live-first consumers.
- Use snapshot methods like `getOne(...)` and `scan(...)` when reactivity is
  not needed.
- Keep broadcast delivery post-commit only.

## Constraints To Preserve

- `notify(...)` must remain local-only.
- `observe(...)` must continue to receive local and remote committed changes.
- Remote messages must not be re-published by receiving table instances.
- Broadcast loop prevention through per-instance origin handling is part of the
  current contract.
- `record(key)` is key-based only; do not imply join/query semantics.
- `recordset(predicate)` is client-side predicate filtering; do not imply DB
  query composition, ordering, or joins.
- Keep optimistic concurrency behavior aligned with the exported version
  strategies and conflict error type.

## Validation

- `npm -w asljs-dali run test`
- `npm -w asljs-dali run typecheck`
- `npm -w asljs-dali run lint`

When changing exported behavior, update `README.md` alongside this file.
