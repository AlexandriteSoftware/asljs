# Delete Strategy and Soft Deletes

Soft delete is implemented via `DeleteStrategy<T>`.

## Interface

```ts
interface DeleteStrategy<T> {
  isDeleted(record: T): boolean;
  delete(record: T): T;
  mapIndexQuery?(index: string, key: IDBValidKey):
    { index: string; key: IDBValidKey } | null;
}
```

## Table Integration

With `deleteStrategy` configured:

- Reads hide deleted rows.
- `delete()` stores a mutated row instead of physically removing it.
- Already deleted rows are treated as delete no-op.
- `clear()` remains physical clear.

## Built-in UUID Soft Delete

Use `UuidSoftDeleteTableDeleteStrategy<T>`.

Recommended field semantics:

- `deleted: ''` means active.
- `deleted: '<uuid>'` means deleted.

## Index Query Mapping

`mapIndexQuery` is optional.

- Return mapped index+key for active-aware queries.
- Return `null` to force fallback to original query plus in-memory filtering.

This makes companion indexes optional for correctness and optional for
performance.

## Mapping Patterns

Common patterns for active-only indexing:

1. Composite indexes where `deleted` is part of key:

- Original index key path: `[field, deleted]`
- Active query key: `[fieldValue, '']`

2. Dedicated active index:

- Index key path: `deleted`
- Active query key: `''`

3. Mapper best practice:

- For `IDBKeyRange`, often return `null` unless you can rewrite safely.

## Composition with Versioning

Soft delete and versioning are independent strategies.

If both are enabled:

- `delete()` verifies expected version.
- `delete()` marks row deleted.
- `delete()` bumps version before persisting.
