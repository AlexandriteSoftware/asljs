# dali

> Part of [Alexandrite Software Library][#1] - a set of high-quality, performant
> JavaScript libraries and tools for everyday use.

## Overview

`asljs-dali` is a data layer for apps that store data in IndexedDB. It models
each object store as a typed, event-aware `Table<T>`, so CRUD operations stay
consistent without hand-written request and transaction plumbing.

## Scope

- **Typed tables.** `Table<T>` reads, scans and writes one object store, and
  raises `add`, `update`, `delete` and `clear` events after each commit.
- **Optimistic concurrency and soft deletes**, as pluggable version and delete
  strategies.
- **Cross-tab notifications.** With a broadcast service, a table reports writes
  committed in other tabs as well as its own.
- **Live views.** `record(key)` and `recordset(predicate)` return containers
  that follow committed changes and conform to the `asljs-observable` contract.
- **Sagas and event sourcing.** Sagas roll back a group of table operations when
  one fails; an event source stores chained transactions for synchronization.
- **Transaction helpers** for the cases where `Table<T>` is not the right layer.

Live views filter on the client: joins, ordering and database-level query
composition are out of scope.

## Installation

```bash
npm install asljs-dali
```

NPM Package: [asljs-dali][NPM]

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

Follow a record as it changes:

```ts
const live = notes.record('1');

live.on('changed', record => console.log('now', record));
live.on('deleted', () => console.log('deleted'));

// release it when no longer needed
live.dispose();
```

Which read to use:

- If you need a one-time single-row read, then use `getOne(key)`.
- If you need a one-time filtered scan, then use `scan(predicate)`.
- If you need live single-row tracking, then use `record(key)`.
- If you need live filtered tracking, then use `recordset(predicate)`.

## Further reading

- [API][API] - every export, grouped by layer.
- [Table Guide][TAB] - constructor options, operations and event semantics.
- [Notifications][NOT] - `notify`, `observe` and cross-tab delivery.
- [Live Views][LIV] - `record`, `recordset` and querying them.
- [Guides][GDS] - versioning, soft deletes, event sourcing, sagas, and an
  application walkthrough.

Questions and bugs: [asljs/issues][ISS].

## Related packages

- `asljs-eventful` provides the events live views raise.
- `asljs-observable` provides the path queries live views support.
- `asljs-data-binding` binds observable models to the DOM.

## License

MIT License. See [LICENSE][LIC] for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
[API]: docs/API.md
[GDS]: docs/README.md
[ISS]: https://github.com/AlexandriteSoftware/asljs/issues
[LIC]: LICENSE.md
[LIV]: <docs/Live Views.md>
[NOT]: docs/Notifications.md
[NPM]: https://www.npmjs.com/package/asljs-dali
[TAB]: <docs/Table Guide.md>
