import {
    test
  } from 'node:test';
import assert
  from 'node:assert/strict';
import 'fake-indexeddb/auto';
import {
    dbOpen,
    IncrementTableVersionStrategy,
    Table,
    TableVersionConflictError,
    type TableEventsReceiver,
    txDone,
    TxMode,
    UuidTableVersionStrategy,
  } from './index.js';

const TEST_SUITE =
  'table';

type TestRecordFields =
  { id: string;
    value: string; };

async function openTestDb(
  ): Promise<IDBDatabase>
{
  return dbOpen(
    `table-test-${crypto.randomUUID()}`,
    [ db => {
        const store =
          db.createObjectStore(
          'items',
          { keyPath: 'id' });

        store.createIndex(
          'by_value',
          'value',
          { unique: false });
      } ]);
}

async function seed(
    db: IDBDatabase,
    rows: TestRecordFields[]
  ): Promise<void>
{
  const tx =
    db.transaction(
      [ 'items' ],
      TxMode.readWrite);

  const store =
    tx.objectStore('items');

  for (const row of rows) {
    store.add(row);
  }

  await txDone(tx);
}

async function waitFor(
    predicate: () => boolean,
    timeoutMs: number = 250
  ): Promise<void>
{
  const started =
    Date.now();

  while (!predicate()) {
    if (Date.now() - started > timeoutMs) {
      throw new Error('Timed out waiting for condition');
    }

    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

test(
  `${TEST_SUITE}: getAll returns all rows`,
  async () => {
    const db =
      await openTestDb();

    await seed(
      db,
      [
        { id: 'a', value: '10' },
        { id: 'b', value: '20' }
      ]);

    const table =
      new Table<TestRecordFields>(
        'items',
        db);

    const rows =
      await table.getAll();

    assert.equal(rows.length, 2);

    const ids =
      rows
        .map(row => row.id)
        .sort();

    assert.deepEqual(ids, [ 'a', 'b' ]);
  });

test(
  `${TEST_SUITE}: notify receiver receives events and supports unsubscribe`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecordFields>(
        'items',
        db);

    const events: string[] = [];

    const receiver: TableEventsReceiver<TestRecordFields> =
      {
        add(record) {
          events.push(`add:${record.id}`);
        },
        update(record) {
          events.push(`update:${record.id}:${record.value}`);
        },
        delete(record) {
          events.push(`delete:${record.id}`);
        },
        clear(records) {
          events.push(`clear:${records.length}`);
        }
      };

    const unsubscribe =
      table.notify(
        receiver);

    await table.add(
      { id: 'a', value: '10' });

    await table.update(
      { id: 'a', value: '20' });

    await table.delete('a');

    await table.add(
      { id: 'b', value: '30' });

    await table.add(
      { id: 'c', value: '40' });

    await table.clear();

    await waitFor(
      () => events.length === 6);

    assert.deepEqual(
      events,
      [ 'add:a',
        'update:a:20',
        'delete:a',
        'add:b',
        'add:c',
        'clear:2' ]);

    assert.equal(
      unsubscribe(),
      true);

    await table.add(
      { id: 'd', value: '50' });

    assert.deepEqual(
      events,
      [ 'add:a',
        'update:a:20',
        'delete:a',
        'add:b',
        'add:c',
        'clear:2' ]);

    assert.equal(
      unsubscribe(),
      false);
  });

type VersionedRecordFields =
  { id: string;
    value: string;
    version: number; };

type UuidVersionedRecordFields =
  { id: string;
    value: string;
    version: string; };

async function openVersionedTestDb(
  ): Promise<IDBDatabase>
{
  return dbOpen(
    `table-test-${crypto.randomUUID()}`,
    [ db => {
        db.createObjectStore(
          'items',
          { keyPath: 'id' });
      } ]);
}

test(
  `${TEST_SUITE}: increment strategy add assigns initial version`,
  async () => {
    const db =
      await openVersionedTestDb();

    const table =
      new Table<VersionedRecordFields>(
        'items',
        db,
        new IncrementTableVersionStrategy('version'));

    const result =
      await table.add(
        { id: 'a', value: '10', version: Number.NaN });

    assert.equal(result.version, 1);

    const stored =
      await table.getOne('a');

    assert.equal(stored?.version, 1);
  });

test(
  `${TEST_SUITE}: increment strategy add preserves valid existing version`,
  async () => {
    const db =
      await openVersionedTestDb();

    const table =
      new Table<VersionedRecordFields>(
        'items',
        db,
        new IncrementTableVersionStrategy('version'));

    const result =
      await table.add(
        { id: 'a', value: '10', version: 5 });

    assert.equal(result.version, 5);
  });

test(
  `${TEST_SUITE}: increment strategy update requires expectedVersion`,
  async () => {
    const db =
      await openVersionedTestDb();

    const table =
      new Table<VersionedRecordFields>(
        'items',
        db,
        new IncrementTableVersionStrategy('version'));

    await table.add(
      { id: 'a', value: '10', version: 1 });

    await assert.rejects(
      () => table.update(
        { id: 'a', value: '20', version: 1 }),
      /expectedVersion is required/);
  });

test(
  `${TEST_SUITE}: increment strategy update throws conflict on version mismatch`,
  async () => {
    const db =
      await openVersionedTestDb();

    const table =
      new Table<VersionedRecordFields>(
        'items',
        db,
        new IncrementTableVersionStrategy('version'));

    await table.add(
      { id: 'a', value: '10', version: 1 });

    await assert.rejects(
      () => table.update(
        { id: 'a', value: '20', version: 1 },
        999),
      (error: unknown) => {
        assert.ok(error instanceof TableVersionConflictError);

        if (error instanceof TableVersionConflictError) {
          assert.equal(error.expectedVersion, 999);
          assert.equal(error.actualVersion, 1);
        }

        return true;
      });
  });

test(
  `${TEST_SUITE}: increment strategy update increments version`,
  async () => {
    const db =
      await openVersionedTestDb();

    const table =
      new Table<VersionedRecordFields>(
        'items',
        db,
        new IncrementTableVersionStrategy('version'));

    await table.add(
      { id: 'a', value: '10', version: 1 });

    const result =
      await table.update(
        { id: 'a', value: '20', version: 1 },
        1);

    assert.equal(result.version, 2);
    assert.equal(result.value, '20');

    const stored =
      await table.getOne('a');

    assert.equal(stored?.version, 2);
  });

test(
  `${TEST_SUITE}: increment strategy delete requires expectedVersion`,
  async () => {
    const db =
      await openVersionedTestDb();

    const table =
      new Table<VersionedRecordFields>(
        'items',
        db,
        new IncrementTableVersionStrategy('version'));

    await table.add(
      { id: 'a', value: '10', version: 1 });

    await assert.rejects(
      () => table.delete('a'),
      /expectedVersion is required/);
  });

test(
  `${TEST_SUITE}: increment strategy delete throws conflict on version mismatch`,
  async () => {
    const db =
      await openVersionedTestDb();

    const table =
      new Table<VersionedRecordFields>(
        'items',
        db,
        new IncrementTableVersionStrategy('version'));

    await table.add(
      { id: 'a', value: '10', version: 1 });

    await assert.rejects(
      () => table.delete('a', 999),
      (error: unknown) => {
        assert.ok(error instanceof TableVersionConflictError);
        return true;
      });
  });

test(
  `${TEST_SUITE}: increment strategy delete succeeds with correct version`,
  async () => {
    const db =
      await openVersionedTestDb();

    const table =
      new Table<VersionedRecordFields>(
        'items',
        db,
        new IncrementTableVersionStrategy('version'));

    await table.add(
      { id: 'a', value: '10', version: 1 });

    await table.delete('a', 1);

    const stored =
      await table.getOne('a');

    assert.equal(stored, null);
  });

test(
  `${TEST_SUITE}: uuid strategy add assigns initial uuid version`,
  async () => {
    const db =
      await openVersionedTestDb();

    const table =
      new Table<UuidVersionedRecordFields>(
        'items',
        db,
        new UuidTableVersionStrategy('version'));

    const result =
      await table.add(
        { id: 'a', value: '10', version: '' });

    assert.match(
      result.version,
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

test(
  `${TEST_SUITE}: uuid strategy update replaces version`,
  async () => {
    const db =
      await openVersionedTestDb();

    const table =
      new Table<UuidVersionedRecordFields>(
        'items',
        db,
        new UuidTableVersionStrategy('version'));

    const added =
      await table.add(
        { id: 'a', value: '10', version: '' });

    const updated =
      await table.update(
        { id: 'a', value: '20', version: added.version },
        added.version);

    assert.notEqual(updated.version, added.version);
    assert.match(
      updated.version,
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

test(
  `${TEST_SUITE}: no strategy update and delete work without expectedVersion`,
  async () => {
    const db =
      await openVersionedTestDb();

    const table =
      new Table<VersionedRecordFields>(
        'items',
        db);

    await table.add(
      { id: 'a', value: '10', version: 1 });

    await table.update(
      { id: 'a', value: '20', version: 1 });

    await table.delete('a');

    const stored =
      await table.getOne('a');

    assert.equal(stored, null);
  });
