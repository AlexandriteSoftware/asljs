import {
    test
  } from 'node:test';
import assert
  from 'node:assert/strict';
import 'fake-indexeddb/auto';
import {
    dbRequestAsync,
    dbOpen,
    IncrementTableVersionStrategy,
    Table,
    type TableBroadcastMessage,
    type TableBroadcastService,
    type TableDeleteStrategy,
    TableVersionConflictError,
    type TableEventsReceiver,
    type TableObservedEvent,
    type TableObservedReceiver,
    txDone,
    TxMode,
    UuidSoftDeleteTableDeleteStrategy,
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
        { versionStrategy:
            new IncrementTableVersionStrategy('version') });

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
        { versionStrategy:
            new IncrementTableVersionStrategy('version') });

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
        { versionStrategy:
            new IncrementTableVersionStrategy('version') });

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
        { versionStrategy:
            new IncrementTableVersionStrategy('version') });

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
        { versionStrategy:
            new IncrementTableVersionStrategy('version') });

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
        { versionStrategy:
            new IncrementTableVersionStrategy('version') });

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
        { versionStrategy:
            new IncrementTableVersionStrategy('version') });

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
        { versionStrategy:
            new IncrementTableVersionStrategy('version') });

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
        { versionStrategy:
            new UuidTableVersionStrategy('version') });

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
        { versionStrategy:
            new UuidTableVersionStrategy('version') });

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

type SoftDeleteRecordFields =
  { id: string;
    customerId: string;
    value: string;
    deleted: string;
    version: number; };

async function openSoftDeleteTestDb(
    includeDeletedAwareIndex: boolean = true
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
          'by_customer',
          'customerId',
          { unique: false });

        if (includeDeletedAwareIndex) {
          store.createIndex(
            'deleted:by_customer',
            [ 'deleted', 'customerId' ],
            { unique: false });
        }
      } ]);
}

async function getRawRecord(
    db: IDBDatabase,
    key: string
  ): Promise<SoftDeleteRecordFields | undefined>
{
  const tx =
    db.transaction(
      [ 'items' ],
      TxMode.read);

  const store =
    tx.objectStore('items');

  const record =
    await dbRequestAsync<SoftDeleteRecordFields | undefined>(
      store.get(key));

  await txDone(tx);

  return record;
}

test(
  `${TEST_SUITE}: soft delete getOne/getAll hide deleted records`,
  async () => {
    const db =
      await openSoftDeleteTestDb();

    const table =
      new Table<SoftDeleteRecordFields>(
        'items',
        db,
        { deleteStrategy:
            new UuidSoftDeleteTableDeleteStrategy('deleted') });

    await table.add(
      { id: 'a', customerId: 'c1', value: 'A', deleted: '', version: 1 });

    await table.add(
      { id: 'b', customerId: 'c1', value: 'B', deleted: '', version: 1 });

    await table.delete('b');

    const active =
      await table.getOne('a');

    const deleted =
      await table.getOne('b');

    const all =
      await table.getAll();

    assert.equal(active?.id, 'a');
    assert.equal(deleted, null);
    assert.deepEqual(
      all.map(record => record.id),
      [ 'a' ]);
  });

test(
  `${TEST_SUITE}: soft delete scan only evaluates active records`,
  async () => {
    const db =
      await openSoftDeleteTestDb();

    const table =
      new Table<SoftDeleteRecordFields>(
        'items',
        db,
        { deleteStrategy:
            new UuidSoftDeleteTableDeleteStrategy('deleted') });

    await table.add(
      { id: 'a', customerId: 'c1', value: 'A', deleted: '', version: 1 });

    await table.add(
      { id: 'b', customerId: 'c1', value: 'B', deleted: '', version: 1 });

    await table.delete('b');

    const records =
      await table.scan(
        record => {
          assert.notEqual(record.id, 'b');
          return true;
        });

    assert.deepEqual(
      records.map(record => record.id),
      [ 'a' ]);
  });

test(
  `${TEST_SUITE}: soft delete get uses rewritten active index when available`,
  async () => {
    const db =
      await openSoftDeleteTestDb(true);

    const table =
      new Table<SoftDeleteRecordFields>(
        'items',
        db,
        { deleteStrategy:
            new UuidSoftDeleteTableDeleteStrategy(
              'deleted',
              (
                  index: string,
                  key: IDBValidKey
                ) => {
                const mappedKey =
                  Array.isArray(key)
                    ? [ '', ...key ]
                    : [ '', key ];

                return {
                  index: `deleted:${index}`,
                  key: mappedKey as unknown as IDBValidKey
                };
              }) });

    await table.add(
      { id: 'a', customerId: 'c1', value: 'A', deleted: '', version: 1 });

    await table.add(
      { id: 'b', customerId: 'c1', value: 'B', deleted: '', version: 1 });

    await table.delete('b');

    const records =
      await table.get(
        'by_customer',
        'c1');

    assert.deepEqual(
      records.map(record => record.id),
      [ 'a' ]);
  });

test(
  `${TEST_SUITE}: soft delete get falls back when rewritten index is missing`,
  async () => {
    const db =
      await openSoftDeleteTestDb(false);

    const table =
      new Table<SoftDeleteRecordFields>(
        'items',
        db,
        { deleteStrategy:
            new UuidSoftDeleteTableDeleteStrategy(
              'deleted',
              (
                  index: string,
                  key: IDBValidKey
                ) => {
                const mappedKey =
                  Array.isArray(key)
                    ? [ '', ...key ]
                    : [ '', key ];

                return {
                  index: `deleted:${index}`,
                  key: mappedKey as unknown as IDBValidKey
                };
              }) });

    await table.add(
      { id: 'a', customerId: 'c1', value: 'A', deleted: '', version: 1 });

    await table.add(
      { id: 'b', customerId: 'c1', value: 'B', deleted: '', version: 1 });

    await table.delete('b');

    const records =
      await table.get(
        'by_customer',
        'c1');

    assert.deepEqual(
      records.map(record => record.id),
      [ 'a' ]);
  });

test(
  `${TEST_SUITE}: soft delete get filters when delete strategy has no index mapping`,
  async () => {
    const db =
      await openSoftDeleteTestDb(false);

    const strategy: TableDeleteStrategy<SoftDeleteRecordFields> =
      { isDeleted(record) {
          return record.deleted.length > 0;
        },
        delete(record) {
          if (record.deleted.length > 0)
            return record;

          return {
            ...record,
            deleted: crypto.randomUUID()
          };
        } };

    const table =
      new Table<SoftDeleteRecordFields>(
        'items',
        db,
        { deleteStrategy: strategy });

    await table.add(
      { id: 'a', customerId: 'c1', value: 'A', deleted: '', version: 1 });

    await table.add(
      { id: 'b', customerId: 'c1', value: 'B', deleted: '', version: 1 });

    await table.delete('b');

    const records =
      await table.get(
        'by_customer',
        'c1');

    assert.deepEqual(
      records.map(record => record.id),
      [ 'a' ]);
  });

test(
  `${TEST_SUITE}: uuid soft delete strategy without mapper returns null mapping`,
  () => {
    const strategy =
      new UuidSoftDeleteTableDeleteStrategy<SoftDeleteRecordFields>('deleted');

    const mapped =
      strategy.mapIndexQuery(
        'by_customer',
        'c1');

    assert.equal(mapped, null);
  });

test(
  `${TEST_SUITE}: soft delete with version strategy verifies and bumps version`,
  async () => {
    const db =
      await openSoftDeleteTestDb();

    const table =
      new Table<SoftDeleteRecordFields>(
        'items',
        db,
        { versionStrategy:
            new IncrementTableVersionStrategy('version'),
          deleteStrategy:
            new UuidSoftDeleteTableDeleteStrategy('deleted') });

    const events: SoftDeleteRecordFields[] = [];

    table.notify(
      { delete(record) {
          events.push(record);
        } });

    await table.add(
      { id: 'a', customerId: 'c1', value: 'A', deleted: '', version: 1 });

    await assert.rejects(
      () => table.delete('a'),
      /expectedVersion is required/);

    await table.delete('a', 1);

    const hidden =
      await table.getOne('a');

    const stored =
      await getRawRecord(db, 'a');

    assert.equal(hidden, null);
    assert.equal(stored?.version, 2);
    assert.equal(typeof stored?.deleted, 'string');
    assert.equal(events.length, 1);
    assert.equal(events[0]?.version, 2);
    assert.equal(typeof events[0]?.deleted, 'string');
  });

test(
  `${TEST_SUITE}: soft delete already deleted record is a no-op`,
  async () => {
    const db =
      await openSoftDeleteTestDb();

    const table =
      new Table<SoftDeleteRecordFields>(
        'items',
        db,
        { versionStrategy:
            new IncrementTableVersionStrategy('version'),
          deleteStrategy:
            new UuidSoftDeleteTableDeleteStrategy('deleted') });

    await table.add(
      { id: 'a', customerId: 'c1', value: 'A', deleted: '', version: 1 });

    await table.delete('a', 1);

    const firstDelete =
      await getRawRecord(db, 'a');

    await table.delete('a');

    const secondDelete =
      await getRawRecord(db, 'a');

    assert.equal(firstDelete?.version, 2);
    assert.equal(secondDelete?.version, 2);
    assert.equal(firstDelete?.deleted, secondDelete?.deleted);
  });

test(
  `${TEST_SUITE}: clear remains a hard clear with soft delete strategy`,
  async () => {
    const db =
      await openSoftDeleteTestDb();

    const table =
      new Table<SoftDeleteRecordFields>(
        'items',
        db,
        { deleteStrategy:
            new UuidSoftDeleteTableDeleteStrategy('deleted') });

    await table.add(
      { id: 'a', customerId: 'c1', value: 'A', deleted: '', version: 1 });

    await table.delete('a');
    await table.clear();

    const tx =
      db.transaction(
        [ 'items' ],
        TxMode.read);

    const records =
      await dbRequestAsync<SoftDeleteRecordFields[]>(
        tx.objectStore('items').getAll());

    await txDone(tx);

    assert.equal(records.length, 0);
  });

// ---------------------------------------------------------------------------
// Broadcast / observe tests
// ---------------------------------------------------------------------------

/**
 * A minimal in-process TableBroadcastService for testing.
 * Subscribers registered on the same instance share the same bus, so one
 * Table's publish call triggers another Table's handler — simulating two
 * browser tabs backed by the same channel.
 */
function createTestBroadcastService(
  ): TableBroadcastService
{
  const handlers: Array<(m: TableBroadcastMessage) => void> = [];

  return {
    publish(message) {
      for (const h of handlers) {
        try {
          h(message);
        } catch { /* swallow */ }
      }
    },
    subscribe(handler) {
      handlers.push(handler);
      return () => {
        const idx = handlers.indexOf(handler);
        if (idx >= 0)
          handlers.splice(idx, 1);
      };
    },
  };
}

test(
  `${TEST_SUITE}: notify (local) subscribers do not receive remote broadcast messages`,
  async () => {
    const db =
      await openTestDb();

    const broadcast =
      createTestBroadcastService();

    // "Remote" table — simulates another tab writing a record.
    const remoteTable =
      new Table<TestRecordFields>(
        'items',
        db,
        { broadcastService: broadcast });

    // "Local" table — the one under test.
    const localTable =
      new Table<TestRecordFields>(
        'items',
        db,
        { broadcastService: broadcast });

    const localEvents: string[] = [];

    localTable.notify(
      { add(record) {
          localEvents.push(`add:${record.id}`);
        } });

    // Remote tab adds a record; its broadcast reaches localTable.
    await remoteTable.add(
      { id: 'r1', value: 'remote' });

    await waitFor(() => localEvents.length > 0, 50)
      .catch(() => { /* expected timeout */ });

    // The local-only subscriber must NOT have been called.
    assert.deepEqual(localEvents, []);

    remoteTable.dispose();
    localTable.dispose();
  });

test(
  `${TEST_SUITE}: observe subscribers receive both local and remote events`,
  async () => {
    const db =
      await openTestDb();

    const broadcast =
      createTestBroadcastService();

    const remoteTable =
      new Table<TestRecordFields>(
        'items',
        db,
        { broadcastService: broadcast });

    const localTable =
      new Table<TestRecordFields>(
        'items',
        db,
        { broadcastService: broadcast });

    const observed: Array<{ source: string; id: string; event: string }> = [];

    localTable.observe(
      event => {
        if (event.eventType === 'add') {
          observed.push(
            { source: event.source,
              event: 'add',
              id: event.record.id });
        }
      });

    // Local write — observed as 'local'.
    await localTable.add(
      { id: 'l1', value: 'local' });

    // Remote write — observed as 'remote'.
    await remoteTable.add(
      { id: 'r1', value: 'remote' });

    await waitFor(() => observed.length === 2);

    assert.deepEqual(
      observed,
      [ { source: 'local', event: 'add', id: 'l1' },
        { source: 'remote', event: 'add', id: 'r1' } ]);

    remoteTable.dispose();
    localTable.dispose();
  });

test(
  `${TEST_SUITE}: observe unsubscribe stops delivery`,
  async () => {
    const db =
      await openTestDb();

    const broadcast =
      createTestBroadcastService();

    const table =
      new Table<TestRecordFields>(
        'items',
        db,
        { broadcastService: broadcast });

    const events: string[] = [];

    const unsubscribe =
      table.observe(
        event => {
          if (event.eventType === 'add')
            events.push(event.record.id);
        });

    await table.add(
      { id: 'a', value: '1' });

    await waitFor(() => events.length === 1);

    assert.equal(unsubscribe(), true);
    assert.equal(unsubscribe(), false);

    await table.add(
      { id: 'b', value: '2' });

    await waitFor(() => events.length > 1, 50)
      .catch(() => { /* expected timeout */ });

    assert.deepEqual(events, [ 'a' ]);

    table.dispose();
  });

test(
  `${TEST_SUITE}: remote messages are not re-broadcast`,
  async () => {
    const db =
      await openTestDb();

    const broadcast =
      createTestBroadcastService();

    const published: TableBroadcastMessage[] = [];

    // Wrap the service to capture publish calls.
    const spied: TableBroadcastService =
      { publish(msg) {
          published.push(msg);
          broadcast.publish(msg);
        },
        subscribe(handler) {
          return broadcast.subscribe(handler);
        } };

    const remoteTable =
      new Table<TestRecordFields>(
        'items',
        db,
        { broadcastService: spied });

    const localTable =
      new Table<TestRecordFields>(
        'items',
        db,
        { broadcastService: spied });

    const observed: TableObservedEvent<TestRecordFields>[] = [];

    localTable.observe(event => observed.push(event));

    // Remote publishes one message.
    await remoteTable.add(
      { id: 'r1', value: 'x' });

    await waitFor(() => observed.length === 1);

    // Only one publish should have occurred (from remoteTable).
    // localTable must NOT re-publish on receiving the remote message.
    assert.equal(published.length, 1);
    assert.equal(published[0]?.originId !== undefined, true);

    remoteTable.dispose();
    localTable.dispose();
  });

test(
  `${TEST_SUITE}: echo suppression — a table ignores its own broadcast messages`,
  async () => {
    const db =
      await openTestDb();

    const broadcast =
      createTestBroadcastService();

    const table =
      new Table<TestRecordFields>(
        'items',
        db,
        { broadcastService: broadcast });

    const observed: TableObservedEvent<TestRecordFields>[] = [];

    table.observe(event => observed.push(event));

    await table.add(
      { id: 'a', value: '1' });

    await waitFor(() => observed.length === 1);

    // Exactly one observed event: the local one.  The table's own broadcast
    // echo must not produce a second 'remote' event.
    assert.equal(observed.length, 1);
    assert.equal(observed[0]?.source, 'local');

    table.dispose();
  });

test(
  `${TEST_SUITE}: no broadcast published when broadcastService is absent`,
  async () => {
    const db =
      await openTestDb();

    // Table without a broadcast service.
    const table =
      new Table<TestRecordFields>(
        'items',
        db);

    const events: string[] = [];

    table.notify(
      { add(record) {
          events.push(record.id);
        } });

    await table.add(
      { id: 'a', value: '1' });

    await waitFor(() => events.length === 1);

    assert.deepEqual(events, [ 'a' ]);
    // No errors thrown; no broadcast machinery involved.
  });

test(
  `${TEST_SUITE}: observe receives all four event types from a remote table`,
  async () => {
    const db =
      await openTestDb();

    const broadcast =
      createTestBroadcastService();

    const remoteTable =
      new Table<TestRecordFields>(
        'items',
        db,
        { broadcastService: broadcast });

    const localTable =
      new Table<TestRecordFields>(
        'items',
        db,
        { broadcastService: broadcast });

    const observed: string[] = [];

    localTable.observe(
      event => {
        if (event.eventType === 'add')
          observed.push(`add:${event.record.id}`);
        else if (event.eventType === 'update')
          observed.push(`update:${event.record.id}:${event.record.value}`);
        else if (event.eventType === 'delete')
          observed.push(`delete:${event.record.id}`);
        else if (event.eventType === 'clear')
          observed.push(`clear:${event.records.length}`);
      });

    await remoteTable.add(
      { id: 'a', value: '10' });

    await remoteTable.update(
      { id: 'a', value: '20' });

    await remoteTable.delete('a');

    await remoteTable.add(
      { id: 'b', value: '30' });

    await remoteTable.clear();

    await waitFor(() => observed.length === 5);

    assert.deepEqual(
      observed,
      [ 'add:a',
        'update:a:20',
        'delete:a',
        'add:b',
        'clear:1' ]);

    remoteTable.dispose();
    localTable.dispose();
  });

test(
  `${TEST_SUITE}: backward compatibility — existing local notify still works without broadcastService`,
  async () => {
    const db =
      await openTestDb();

    // Plain Table without any new options.
    const table =
      new Table<TestRecordFields>(
        'items',
        db);

    const events: string[] = [];

    const unsubscribe =
      table.notify(
        { add(record) {
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
          } });

    await table.add(
      { id: 'a', value: '10' });

    await table.update(
      { id: 'a', value: '20' });

    await table.delete('a');

    await table.add(
      { id: 'b', value: '30' });

    await table.clear();

    await waitFor(() => events.length === 5);

    assert.deepEqual(
      events,
      [ 'add:a',
        'update:a:20',
        'delete:a',
        'add:b',
        'clear:1' ]);

    assert.equal(unsubscribe(), true);
    assert.equal(unsubscribe(), false);
  });
