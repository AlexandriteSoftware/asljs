# Versioning Strategy

Optimistic concurrency is implemented via `VersionStrategy<T>`.

## Interface

```ts
interface VersionStrategy<T> {
  getVersion(record: T): unknown;
  initialise(record: T): T;
  verify(record: T, expectedVersion: unknown): boolean;
  update(record: T): T;
}
```

## Table Behavior

With `versionStrategy` configured:

- `add()` calls `initialise(record)`.
- `update()` requires `expectedVersion`.
- `delete()` requires `expectedVersion`.
- On mismatch, `TableVersionConflictError` is thrown.

## Built-in Strategies

- `IncrementTableVersionStrategy(field)`
- `UuidTableVersionStrategy(field)`

## Choosing Strategy

Use increment strategy when:

- Numeric ordering matters.
- You want compact debug output.

Use UUID strategy when:

- You need opaque concurrency tokens.
- You do not need arithmetic on version.

## Practical Rules

- Pass version from fresh read into update/delete commands.
- Treat conflict errors as normal concurrent-write outcomes.
- For command retry loops, re-read and re-apply business intent.
