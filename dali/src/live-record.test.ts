import { test }
  from 'node:test';
import assert
  from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { dbOpen,
         LiveRecord,
         Table }
  from './index.js';

const TEST_SUITE =
  'LiveRecord';

type TestRecord =
  { id: string;
    value: string; };

async function openTestDb(
  ): Promise<IDBDatabase>
{
  return dbOpen(
    `live-record-test-${crypto.randomUUID()}`,
    [ db => {
        db.createObjectStore(
          'items',
          { keyPath: 'id' });
      } ]);
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
  `${TEST_SUITE}: initial load returns matching record`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: '10' });

    const live =
      table.record('a');

    await waitFor(() => live.record !== null);

    assert.deepEqual(
      live.record,
      { id: 'a', value: '10' });

    live.dispose();
  });

test(
  `${TEST_SUITE}: initial load returns null when missing`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    const live =
      table.record('missing');

    // Give the initial load time to settle; record should remain null.
    await new Promise(resolve => setTimeout(resolve, 20));

    assert.equal(live.record, null);

    live.dispose();
  });

test(
  `${TEST_SUITE}: updating tracked key updates record property`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: '10' });

    const live =
      table.record('a');

    await waitFor(() => live.record !== null);

    await table.update({ id: 'a', value: '20' });

    await waitFor(() => live.record?.value === '20');

    assert.deepEqual(
      live.record,
      { id: 'a', value: '20' });

    live.dispose();
  });

test(
  `${TEST_SUITE}: deleting tracked key sets record to null`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: '10' });

    const live =
      table.record('a');

    await waitFor(() => live.record !== null);

    await table.delete('a');

    await waitFor(() => live.record === null);

    assert.equal(live.record, null);

    live.dispose();
  });

test(
  `${TEST_SUITE}: unrelated changes do not corrupt the live record`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: '10' });
    await table.add({ id: 'b', value: '20' });

    const live =
      table.record('a');

    await waitFor(() => live.record !== null);

    // Update an unrelated key
    await table.update({ id: 'b', value: '99' });

    // Give time for any spurious update to land
    await new Promise(resolve => setTimeout(resolve, 20));

    assert.deepEqual(
      live.record,
      { id: 'a', value: '10' });

    live.dispose();
  });

test(
  `${TEST_SUITE}: clear resets the live record to null`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: '10' });

    const live =
      table.record('a');

    await waitFor(() => live.record !== null);

    await table.clear();

    await waitFor(() => live.record === null);

    assert.equal(live.record, null);

    live.dispose();
  });

test(
  `${TEST_SUITE}: "changed" event fires when record changes`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    const live =
      table.record('a');

    const changedArgs: Array<[ TestRecord, TestRecord | null ]> = [];

    live.on('changed', (record, previous) => {
      changedArgs.push([ record, previous ]);
    });

    // Adding triggers 'changed' (null → record)
    await table.add({ id: 'a', value: '10' });

    await waitFor(() => changedArgs.length >= 1);

    assert.equal(changedArgs.length, 1);
    assert.deepEqual(changedArgs[0]![0], { id: 'a', value: '10' });
    assert.equal(changedArgs[0]![1], null);

    // Updating triggers 'changed' (record → different record)
    await table.update({ id: 'a', value: '20' });

    await waitFor(() => changedArgs.length >= 2);

    assert.equal(changedArgs.length, 2);
    assert.deepEqual(changedArgs[1]![0], { id: 'a', value: '20' });
    assert.deepEqual(changedArgs[1]![1], { id: 'a', value: '10' });

    live.dispose();
  });

test(
  `${TEST_SUITE}: "deleted" event fires when tracked record is deleted`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: '10' });

    const live =
      table.record('a');

    await waitFor(() => live.record !== null);

    const deletedPrevious: TestRecord[] = [];

    live.on('deleted', previous => {
      deletedPrevious.push(previous);
    });

    await table.delete('a');

    await waitFor(() => deletedPrevious.length >= 1);

    assert.equal(deletedPrevious.length, 1);
    assert.deepEqual(deletedPrevious[0], { id: 'a', value: '10' });
    assert.equal(live.record, null);

    live.dispose();
  });

test(
  `${TEST_SUITE}: "deleted" event fires on clear`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: '10' });

    const live =
      table.record('a');

    await waitFor(() => live.record !== null);

    const deletedPrevious: TestRecord[] = [];

    live.on('deleted', previous => {
      deletedPrevious.push(previous);
    });

    await table.clear();

    await waitFor(() => deletedPrevious.length >= 1);

    assert.equal(deletedPrevious.length, 1);
    assert.deepEqual(deletedPrevious[0], { id: 'a', value: '10' });

    live.dispose();
  });

test(
  `${TEST_SUITE}: watch on "record" path fires when record changes`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: '10' });

    const live =
      table.record('a');

    // record.value starts undefined; collect values after watcher is set
    const seen: Array<string | undefined> = [];

    // watch is called immediately with current value, then on each change
    live.watch('record.value', v => {
      seen.push(v as string | undefined);
    });

    // Initial call (record is null at watch-time; value is undefined)
    assert.equal(seen.length, 1);
    assert.equal(seen[0], undefined);

    // Wait for load to settle
    await waitFor(() => live.record !== null);

    // Should have fired again with '10'
    await waitFor(() => seen.length >= 2);
    assert.equal(seen[seen.length - 1], '10');

    await table.update({ id: 'a', value: '20' });

    await waitFor(() => seen[seen.length - 1] === '20');
    assert.equal(seen[seen.length - 1], '20');

    live.dispose();
  });

test(
  `${TEST_SUITE}: watch on "record" path fires when whole record changes`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: '10' });

    const live =
      table.record('a');

    await waitFor(() => live.record !== null);

    const seen: Array<TestRecord | null> = [];

    live.watch('record', r => {
      seen.push(r as TestRecord | null);
    });

    // Immediately called with current value
    assert.equal(seen.length, 1);
    assert.deepEqual(seen[0], { id: 'a', value: '10' });

    await table.update({ id: 'a', value: '20' });

    await waitFor(() => (seen[seen.length - 1] as TestRecord | null)?.value === '20');
    assert.deepEqual(seen[seen.length - 1], { id: 'a', value: '20' });

    live.dispose();
  });

test(
  `${TEST_SUITE}: disposing stops further "changed" events`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: '10' });

    const live =
      table.record('a');

    await waitFor(() => live.record !== null);

    const fired: TestRecord[] = [];

    live.on('changed', record => {
      fired.push(record);
    });

    live.dispose();

    await table.update({ id: 'a', value: '20' });

    await new Promise(resolve => setTimeout(resolve, 20));

    assert.equal(fired.length, 0);
  });

test(
  `${TEST_SUITE}: LiveRecord is exported directly from index`,
  () => {
    assert.equal(typeof LiveRecord, 'function');
  });
