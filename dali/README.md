# dali

> Part of [Alexandrite Software Library][#1] - a set of high-quality,
performant JavaScript libraries for everyday use.

## Overview

`asljs-dali` is a data layer for apps that store data in IndexedDB. It is for
developers who want a typed, event-aware table abstraction instead of
hand-writing low-level request and transaction plumbing. Use it to model
stores as `Table<T>`, keep CRUD operations consistent, and optionally enforce
optimistic concurrency with version strategies.

## Installation

```bash
npm install asljs-dali
```

NPM Package: [asljs-dali](https://www.npmjs.com/package/asljs-dali)

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
    db);

await notes.add(
  { id: '1',
    title: 'Hello' });

const row =
  await notes.getOne('1');
```

## API Reference

Core:

- `dbOpen(name, upgrades)`
- `dbDelete(name)`
- `dbRequestAsync(request)`
- `Table<T>`

Versioning:

- `TableVersionStrategy<T>`
- `TableVersionConflictError`
- `IncrementTableVersionStrategy<T>`
- `UuidTableVersionStrategy<T>`

Transactions:

- `TxMode`
- `txRead(db, storeName, tx?)`
- `txWrite(db, storeName, tx?)`
- `txDone(tx)`
- `txEnsure(tx, storeName, mode)`
- `txReuseOrCreate(tx, storeNames, mode, db)`

## License

MIT License. See [LICENSE](LICENSE.md) for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
