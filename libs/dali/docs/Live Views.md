# Live Views

## Purpose

`Table.record(key)` and `Table.recordset(predicate)`: containers that follow
committed table changes, their events, and how to query them with
`asljs-observable`.

## Usage

`Table` provides live-first APIs that return reactive containers tracking
committed table changes automatically. Both containers are built on ASLJS
eventful (for domain events) and conform to the ASLJS observable contract: they
report their property as a `change` event, so the `observe` query from
`asljs-observable` follows paths into them. That `observe` is the package
import, not `Table.observe()`.

## `Table.record(key)` → `LiveRecord<T>`

Returns a live single-record view for a specific primary key.

```ts
import { observe } from 'asljs-observable';

const live = notes.record('1');

// Stable property — null until the initial load settles.
console.log(live.record); // { id: '1', title: 'Hello' } | null

// Domain events via ASLJS eventful.
live.on('changed', (record, previous) => {
  console.log('record changed to', record, 'was', previous);
});

live.on('deleted', previous => {
  console.log('record deleted, was', previous);
});

// Property-path query via ASLJS observable.
const unsubscribe = observe(live)
  .at('record.title')
  .subscribe(title => console.log('title is now', title));

// Release the query and the live view when no longer needed.
unsubscribe();
live.dispose();
```

Behaviour:

- `record` is `null` until the initial database read settles.
- On `add` / `update` for the tracked key — `record` is updated and `changed`
  fires.
- On `delete` or `clear` — `record` becomes `null` and `deleted` fires.
- Unrelated changes on the same table do not affect this view.
- `observe(live).at(path).subscribe(cb)` calls back immediately with the current
  value and again whenever the value at the path changes. The query is anchored
  to the stable container, so a replaced record is followed.
- `record` changes are reported as a `change` event carrying one entry: `{ kind:
  'set', property: 'record', value, previous }`.

For a one-time read, use `table.getOne(key)` instead. `record(key)` tracks a
single primary key.

## `Table.recordset(predicate)` → `LiveRecordSet<T>`

Returns a live filtered set view for records matching a client-side predicate.

```ts
import { observe } from 'asljs-observable';

const live = notes.recordset(note => note.title.startsWith('A'));

// Stable property — a readonly array snapshot.
console.log(live.records); // readonly Note[]

// Domain events via ASLJS eventful.
live.on('added',   record          => console.log('added',   record));
live.on('removed', record          => console.log('removed', record));
live.on('updated', (record, prev)  => console.log('updated', record, prev));
live.on('cleared', ()              => console.log('cleared'));
live.on('changed', records         => console.log('set now has', records.length));

// Property-path query via ASLJS observable.
const unsubscribe = observe(live)
  .at('records.length')
  .subscribe(count => console.log('count:', count));

unsubscribe();
live.dispose();
```

Behaviour:

- On initial creation the table is scanned and all matching records are loaded.
- On `add` — the record is included if the predicate returns `true`; `added`
  fires.
- On `update` — membership is re-evaluated; `added`, `updated`, or `removed`
  fires accordingly.
- On `delete` — the record is removed if it was present; `removed` fires.
- On `clear` — the set is emptied and `cleared` fires.
- `changed` fires after every mutation, together with a `change` event carrying
  `{ kind: 'set', property: 'records', value, previous }`.
- `records` returns a new array on every read, so a query on `records` reports
  every mutation; `records.length` reports only a change of size.

For a one-time read, use `table.scan(predicate)` instead. `recordset(predicate)`
filters on the client with a predicate; joins, ordering, and database-level
query composition are out of its scope.
