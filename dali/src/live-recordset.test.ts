import assert
  from 'node:assert/strict';
import { test }
  from 'node:test';
import 'fake-indexeddb/auto';
import { dbOpen,
         LiveRecordSet,
         Table }
  from './index.js';

const TEST_SUITE =
  'LiveRecordSet';

type TestRecord = { id: string; value: string; };

async function openTestDb(
  ): Promise<IDBDatabase>
{
  return dbOpen(
    `live-recordset-test-${crypto.randomUUID()}`,
    [db =>
    {
      db.createObjectStore(
        'items',
        { keyPath: 'id' });
    }]);
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

    await new Promise(resolve =>
      setTimeout(
        resolve,
        0)
    );
  }
}

function sortedIds(
    records: readonly TestRecord[]
  ): string[]
{
  return records
    .map(
      r => r.id)
    .sort();
}

test(
  `${TEST_SUITE}: initial load includes matching records only`,
  async () =>
  {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add(
      { id: 'a', value: '10' });

    await table.add(
      { id: 'b', value: '20' });

    await table.add(
      { id: 'c', value: '30' });

    const live =
      table.recordset(
        record => record.value !== '20');

    await waitFor(
      () => live.records.length >= 2);

    assert.deepEqual(
      sortedIds(
        live.records),
      ['a', 'c']);

    live.dispose();
  });

test(
  `${TEST_SUITE}: initial load returns empty set when nothing matches`,
  async () =>
  {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add(
      { id: 'a', value: '10' });

    const live =
      table.recordset(
        record => record.value === 'NOPE');

    // Give the scan time to settle.
    await new Promise(resolve =>
      setTimeout(
        resolve,
        20)
    );

    assert.deepEqual(
      live.records,
      []);

    live.dispose();
  });

test(
  `${TEST_SUITE}: add inserts newly matching record`,
  async () =>
  {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    const live =
      table.recordset(
        record => record.value.startsWith('v'));

    // Wait for initial scan to settle (no records yet)
    await new Promise(resolve =>
      setTimeout(
        resolve,
        20)
    );

    assert.deepEqual(
      live.records,
      []);

    await table.add(
      { id: 'a', value: 'v1' });

    await waitFor(
      () => live.records.length === 1);

    assert.deepEqual(
      live.records[0],
      { id: 'a', value: 'v1' });

    live.dispose();
  });

test(
  `${TEST_SUITE}: add ignores non-matching record`,
  async () =>
  {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    const live =
      table.recordset(
        record => record.value.startsWith('v'));

    await new Promise(resolve =>
      setTimeout(
        resolve,
        20)
    );

    await table.add(
      { id: 'a', value: 'other' });

    await new Promise(resolve =>
      setTimeout(
        resolve,
        20)
    );

    assert.deepEqual(
      live.records,
      []);

    live.dispose();
  });

test(
  `${TEST_SUITE}: update keeps matching record updated`,
  async () =>
  {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add(
      { id: 'a', value: 'v1' });

    const live =
      table.recordset(
        record => record.value.startsWith('v'));

    await waitFor(
      () => live.records.length === 1);

    await table.update(
      { id: 'a', value: 'v2' });

    await waitFor(
      () => live.records[0]?.value === 'v2');

    assert.deepEqual(
      live.records[0],
      { id: 'a', value: 'v2' });

    live.dispose();
  });

test(
  `${TEST_SUITE}: update removes record that stops matching`,
  async () =>
  {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add(
      { id: 'a', value: 'v1' });

    const live =
      table.recordset(
        record => record.value.startsWith('v'));

    await waitFor(
      () => live.records.length === 1);

    await table.update(
      { id: 'a', value: 'other' });

    await waitFor(
      () => live.records.length === 0);

    assert.deepEqual(
      live.records,
      []);

    live.dispose();
  });

test(
  `${TEST_SUITE}: update adds record that becomes matching`,
  async () =>
  {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add(
      { id: 'a', value: 'other' });

    const live =
      table.recordset(
        record => record.value.startsWith('v'));

    await new Promise(resolve =>
      setTimeout(
        resolve,
        20)
    );

    assert.deepEqual(
      live.records,
      []);

    await table.update(
      { id: 'a', value: 'v1' });

    await waitFor(
      () => live.records.length === 1);

    assert.deepEqual(
      live.records[0],
      { id: 'a', value: 'v1' });

    live.dispose();
  });

test(
  `${TEST_SUITE}: delete removes matching record`,
  async () =>
  {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add(
      { id: 'a', value: 'v1' });

    await table.add(
      { id: 'b', value: 'v2' });

    const live =
      table.recordset(
        record => record.value.startsWith('v'));

    await waitFor(
      () => live.records.length === 2);

    await table.delete('a');

    await waitFor(
      () => live.records.length === 1);

    assert.deepEqual(
      live.records[0],
      { id: 'b', value: 'v2' });

    live.dispose();
  });

test(
  `${TEST_SUITE}: clear empties the set`,
  async () =>
  {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add(
      { id: 'a', value: 'v1' });

    await table.add(
      { id: 'b', value: 'v2' });

    const live =
      table.recordset(
        record => record.value.startsWith('v'));

    await waitFor(
      () => live.records.length === 2);

    await table.clear();

    await waitFor(
      () => live.records.length === 0);

    assert.deepEqual(
      live.records,
      []);

    live.dispose();
  });

test(
  `${TEST_SUITE}: "added" event fires when a record enters the set`,
  async () =>
  {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    const live =
      table.recordset(
        record => record.value.startsWith('v'));

    await new Promise(resolve =>
      setTimeout(
        resolve,
        20)
    );

    const added: TestRecord[] = [];

    live.on(
      'added',
      record =>
      {
        added.push(record);
      });

    await table.add(
      { id: 'a', value: 'v1' });

    await waitFor(
      () => added.length >= 1);

    assert.equal(
      added.length,
      1);

    assert.deepEqual(
      added[0],
      { id: 'a', value: 'v1' });

    // Non-matching add must not fire 'added'
    await table.add(
      { id: 'b', value: 'other' });

    await new Promise(resolve =>
      setTimeout(
        resolve,
        20)
    );

    assert.equal(
      added.length,
      1);

    live.dispose();
  });

test(
  `${TEST_SUITE}: "removed" event fires when a record leaves the set`,
  async () =>
  {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add(
      { id: 'a', value: 'v1' });

    const live =
      table.recordset(
        record => record.value.startsWith('v'));

    await waitFor(
      () => live.records.length === 1);

    const removed: TestRecord[] = [];

    live.on(
      'removed',
      record =>
      {
        removed.push(record);
      });

    await table.delete('a');

    await waitFor(
      () => removed.length >= 1);

    assert.equal(
      removed.length,
      1);

    assert.deepEqual(
      removed[0],
      { id: 'a', value: 'v1' });

    live.dispose();
  });

test(
  `${TEST_SUITE}: "updated" event fires when a matching record is updated in place`,
  async () =>
  {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add(
      { id: 'a', value: 'v1' });

    const live =
      table.recordset(
        record => record.value.startsWith('v'));

    await waitFor(
      () => live.records.length === 1);

    const updated: Array<[TestRecord, TestRecord]> = [];

    live.on(
      'updated',
      (record, previous) =>
      {
        updated.push(
          [record, previous]);
      });

    await table.update(
      { id: 'a', value: 'v2' });

    await waitFor(
      () => updated.length >= 1);

    assert.equal(
      updated.length,
      1);

    assert.deepEqual(
      updated[0]![0],
      { id: 'a', value: 'v2' });

    assert.deepEqual(
      updated[0]![1],
      { id: 'a', value: 'v1' });

    live.dispose();
  });

test(
  `${TEST_SUITE}: "cleared" event fires on table clear`,
  async () =>
  {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add(
      { id: 'a', value: 'v1' });

    const live =
      table.recordset(
        record => record.value.startsWith('v'));

    await waitFor(
      () => live.records.length === 1);

    let clearedCount = 0;

    live.on(
      'cleared',
      () =>
      {
        clearedCount++;
      });

    await table.clear();

    await waitFor(
      () => clearedCount >= 1);

    assert.equal(
      clearedCount,
      1);

    assert.deepEqual(
      live.records,
      []);

    live.dispose();
  });

test(
  `${TEST_SUITE}: "changed" event fires after any mutation`,
  async () =>
  {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    const live =
      table.recordset(
        record => record.value.startsWith('v'));

    const lengths: number[] = [];

    // Fires once after initial scan
    live.on(
      'changed',
      records =>
      {
        lengths.push(
          records.length);
      });

    await waitFor(
      () => lengths.length >= 1);

    await table.add(
      { id: 'a', value: 'v1' });

    await waitFor(
      () => lengths.length >= 2);

    assert.equal(
      lengths[lengths.length - 1],
      1);

    live.dispose();
  });

test(
  `${TEST_SUITE}: watch on "records.length" path fires when set changes`,
  async () =>
  {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    const live =
      table.recordset(
        record => record.value.startsWith('v'));

    const lengths: number[] = [];

    // Immediately called with current value (0 before scan settles)
    live.watch(
      'records',
      r =>
      {
        lengths.push(
          (r as readonly TestRecord[] ?? []).length);
      });

    assert.equal(
      lengths.length,
      1);

    await waitFor(
      () => lengths.length >= 1);

    await table.add(
      { id: 'a', value: 'v1' });

    await waitFor(
      () => lengths[lengths.length - 1] === 1);

    assert.equal(
      lengths[lengths.length - 1],
      1);

    live.dispose();
  });

test(
  `${TEST_SUITE}: disposing stops further events`,
  async () =>
  {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add(
      { id: 'a', value: 'v1' });

    const live =
      table.recordset(
        record => record.value.startsWith('v'));

    await waitFor(
      () => live.records.length === 1);

    const fired: number[] = [];

    live.on(
      'changed',
      records =>
      {
        fired.push(
          records.length);
      });

    live.dispose();

    await table.add(
      { id: 'b', value: 'v2' });

    await new Promise(resolve =>
      setTimeout(
        resolve,
        20)
    );

    assert.equal(
      fired.length,
      0);
  });

test(
  `${TEST_SUITE}: LiveRecordSet is exported directly from index`,
  () =>
  {
    assert.equal(
      typeof LiveRecordSet,
      'function');
  });
