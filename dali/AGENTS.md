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

## AI Quick Reference

Choose this API when:

- you need a one-time single-row read -> `getOne(key)`
- you need a one-time filtered scan -> `scan(predicate)`
- you need live single-row tracking -> `record(key)`
- you need live filtered tracking -> `recordset(predicate)`
- you need local-only mutation notifications -> `notify(...)`
- you need local plus remote committed notifications -> `observe(...)`

Public contracts:

- `notify(...)` is local-only
- `observe(...)` includes remote committed changes
- broadcasts happen only after successful commit
- remote messages are not re-published
- `record(key)` is key-based only
- `recordset(predicate)` is client-side predicate filtering only

What not to assume:

- joins are available
- server-style query planners are available
- `recordset(predicate)` performs DB-level query composition
- live sets imply automatic ordering semantics
- remote messages are echoed back out again

## Preferred Usage Patterns

- Model stores through `Table<T>` instead of ad hoc request plumbing.
- Use `notify(...)` for local-only subscribers.
- Use `observe(...)` only when cross-tab or remote-origin events are needed.
- Use `record(key)` and `recordset(predicate)` for live-first consumers.
- Use snapshot methods like `getOne(...)` and `scan(...)` when reactivity is
  not needed.
- Keep broadcast delivery post-commit only.

## Common Wrong Assumptions

- `recordset(predicate)` is a database query planner
- `notify(...)` includes remote tab changes
- `observe(...)` re-broadcasts remote changes
- live views imply joins or rich query composition
- broadcast delivery happens during tentative mutations instead of after
  commit

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

## Safe Usage Rules

- use `Table<T>` before dropping to raw transaction helpers
- prefer snapshot reads unless reactivity is actually needed
- use `observe(...)` only when remote-origin changes matter
- dispose live views when they are no longer needed
- do not describe `recordset(predicate)` as a full query engine

## Change Safety Checklist

- If touching observation, then re-check `notify(...)` vs `observe(...)`.
- If touching live views, then re-check snapshot alternatives and stated
  limits.
- If touching broadcast handling, then re-check post-commit-only behavior and
  echo suppression.
- If touching version strategies, then re-check documented conflict behavior.
- If touching live containers, then re-check their eventful and observable
  surfaces.

## Related Packages

- If the task is really about event primitives, move to `asljs-eventful`.
- If the task is really about path watching and reactive property access, move
  to `asljs-observable`.
- If the task is really about DOM binding on observable models, move to
  `asljs-data-binding`.

## Validation

- `npm -w asljs-dali run test`
- `npm -w asljs-dali run typecheck`
- `npm -w asljs-dali run lint`

Update this file when AI-facing constraints, exported surface expectations, or
validation commands change. Update `README.md` separately only when
user-facing behavior changes.
