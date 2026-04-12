import {
    test
  } from 'node:test';
import assert
  from 'node:assert/strict';
import 'fake-indexeddb/auto';
import {
    dbOpen,
    LiveRecordSet,
    Table,
  } from './index.js';

const TEST_SUITE =
  'LiveRecordSet';

type TestRecord =
  { id: string;
    value: string; };

async function openTestDb(
  ): Promise<IDBDatabase>
{
  return dbOpen(
    `live-recordset-test-${crypto.randomUUID()}`,
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

function sortedIds(
    records: readonly TestRecord[]
  ): string[]
{
  return records
    .map(r => r.id)
    .sort();
}

test(
  `${TEST_SUITE}: initial load includes matching records only`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: '10' });
    await table.add({ id: 'b', value: '20' });
    await table.add({ id: 'c', value: '30' });

    const live =
      table.recordset(record => record.value !== '20');

    await waitFor(() => live.current().length >= 2);

    assert.deepEqual(
      sortedIds(live.current()),
      [ 'a', 'c' ]);

    live.dispose();
  });

test(
  `${TEST_SUITE}: initial load returns empty set when nothing matches`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: '10' });

    const live =
      table.recordset(record => record.value === 'NOPE');

    // Give the scan time to settle.
    await new Promise(resolve => setTimeout(resolve, 20));

    assert.deepEqual(live.current(), []);

    live.dispose();
  });

test(
  `${TEST_SUITE}: add inserts newly matching record`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    const live =
      table.recordset(record => record.value.startsWith('v'));

    // Wait for initial scan to settle (no records yet)
    await new Promise(resolve => setTimeout(resolve, 20));

    assert.deepEqual(live.current(), []);

    await table.add({ id: 'a', value: 'v1' });

    await waitFor(() => live.current().length === 1);

    assert.deepEqual(
      live.current()[0],
      { id: 'a', value: 'v1' });

    live.dispose();
  });

test(
  `${TEST_SUITE}: add ignores non-matching record`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    const live =
      table.recordset(record => record.value.startsWith('v'));

    await new Promise(resolve => setTimeout(resolve, 20));

    await table.add({ id: 'a', value: 'other' });

    await new Promise(resolve => setTimeout(resolve, 20));

    assert.deepEqual(live.current(), []);

    live.dispose();
  });

test(
  `${TEST_SUITE}: update keeps matching record updated`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: 'v1' });

    const live =
      table.recordset(record => record.value.startsWith('v'));

    await waitFor(() => live.current().length === 1);

    await table.update({ id: 'a', value: 'v2' });

    await waitFor(() => live.current()[0]?.value === 'v2');

    assert.deepEqual(
      live.current()[0],
      { id: 'a', value: 'v2' });

    live.dispose();
  });

test(
  `${TEST_SUITE}: update removes record that stops matching`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: 'v1' });

    const live =
      table.recordset(record => record.value.startsWith('v'));

    await waitFor(() => live.current().length === 1);

    await table.update({ id: 'a', value: 'other' });

    await waitFor(() => live.current().length === 0);

    assert.deepEqual(live.current(), []);

    live.dispose();
  });

test(
  `${TEST_SUITE}: update adds record that becomes matching`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: 'other' });

    const live =
      table.recordset(record => record.value.startsWith('v'));

    await new Promise(resolve => setTimeout(resolve, 20));

    assert.deepEqual(live.current(), []);

    await table.update({ id: 'a', value: 'v1' });

    await waitFor(() => live.current().length === 1);

    assert.deepEqual(
      live.current()[0],
      { id: 'a', value: 'v1' });

    live.dispose();
  });

test(
  `${TEST_SUITE}: delete removes matching record`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: 'v1' });
    await table.add({ id: 'b', value: 'v2' });

    const live =
      table.recordset(record => record.value.startsWith('v'));

    await waitFor(() => live.current().length === 2);

    await table.delete('a');

    await waitFor(() => live.current().length === 1);

    assert.deepEqual(
      live.current()[0],
      { id: 'b', value: 'v2' });

    live.dispose();
  });

test(
  `${TEST_SUITE}: clear empties the set`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: 'v1' });
    await table.add({ id: 'b', value: 'v2' });

    const live =
      table.recordset(record => record.value.startsWith('v'));

    await waitFor(() => live.current().length === 2);

    await table.clear();

    await waitFor(() => live.current().length === 0);

    assert.deepEqual(live.current(), []);

    live.dispose();
  });

test(
  `${TEST_SUITE}: subscribe listener is called on changes`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    const live =
      table.recordset(record => record.value.startsWith('v'));

    const snapshots: number[] = [];

    const unsubscribe =
      live.subscribe(value => {
        snapshots.push(value.length);
      });

    // Wait for initial scan notification
    await waitFor(() => snapshots.length >= 1);

    await table.add({ id: 'a', value: 'v1' });

    await waitFor(() => snapshots.length >= 2);

    assert.equal(snapshots[snapshots.length - 1], 1);

    unsubscribe();

    // Changes after unsubscribe must not reach the listener
    await table.add({ id: 'b', value: 'v2' });

    await new Promise(resolve => setTimeout(resolve, 20));

    assert.equal(snapshots[snapshots.length - 1], 1);

    live.dispose();
  });

test(
  `${TEST_SUITE}: disposing stops notifications`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: 'v1' });

    const live =
      table.recordset(record => record.value.startsWith('v'));

    await waitFor(() => live.current().length === 1);

    const received: number[] = [];

    live.subscribe(value => {
      received.push(value.length);
    });

    live.dispose();

    await table.add({ id: 'b', value: 'v2' });

    await new Promise(resolve => setTimeout(resolve, 20));

    assert.equal(received.length, 0);
  });

test(
  `${TEST_SUITE}: LiveRecordSet is exported directly from index`,
  () => {
    assert.equal(typeof LiveRecordSet, 'function');
  });
