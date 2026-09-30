# Table Guide

`Table<T>` is the central persistence abstraction in DALI.

## Responsibilities

- Typed CRUD over one IndexedDB object store.
- Event emission for `add`, `update`, `delete`, and `clear`.
- Optional optimistic concurrency via `versionStrategy`.
- Optional soft delete behavior via `deleteStrategy`.

## Constructor

```ts
new Table<T>(
  storeName,
  db,
  {
    versionStrategy,
    deleteStrategy,
  }
)
```

Both options are optional.

## Behavior Summary

- `getOne(key)`: returns one active record or `null`.
- `get(index, key)`: returns active records for index query.
- `getAll()`: returns all active records.
- `scan(predicate)`: runs predicate only for active records.
- `add(record)`: inserts record, initializes version when strategy is enabled.
- `update(record, expectedVersion)`: verifies and bumps version when enabled.
- `delete(key, expectedVersion)`: hard delete by default, soft delete when
  delete strategy is enabled.
- `clear()`: always hard clears the object store.

## Event Semantics

Events are raised after transaction completion.

- `add(record)`
- `update(record, previousRecord)`
- `delete(record)`
- `clear(records)`

When soft delete is enabled, `delete` still emits, but `record` is the stored
soft-deleted row.

## Key Validation

For index reads, key shape is validated against index keyPath for normal
queries. For rewritten soft-delete index queries, validation may be skipped to
allow custom mapping logic.

## Recommended Usage

- Always use a stable key path (`id` for app entities).
- Prefer wrapping multiple writes in one external transaction when operations
  must be atomic at IndexedDB level.
- Use strategies rather than ad hoc caller logic for delete/version concerns.
