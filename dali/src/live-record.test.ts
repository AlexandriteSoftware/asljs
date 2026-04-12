import {
    test
  } from 'node:test';
import assert
  from 'node:assert/strict';
import 'fake-indexeddb/auto';
import {
    dbOpen,
    LiveRecord,
    Table,
  } from './index.js';

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

    await waitFor(() => live.current() !== null);

    assert.deepEqual(
      live.current(),
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

    // Give the initial load time to settle; current() should remain null.
    await new Promise(resolve => setTimeout(resolve, 20));

    assert.equal(live.current(), null);

    live.dispose();
  });

test(
  `${TEST_SUITE}: updating tracked key updates current value`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: '10' });

    const live =
      table.record('a');

    await waitFor(() => live.current() !== null);

    await table.update({ id: 'a', value: '20' });

    await waitFor(() => live.current()?.value === '20');

    assert.deepEqual(
      live.current(),
      { id: 'a', value: '20' });

    live.dispose();
  });

test(
  `${TEST_SUITE}: deleting tracked key sets value to null`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: '10' });

    const live =
      table.record('a');

    await waitFor(() => live.current() !== null);

    await table.delete('a');

    await waitFor(() => live.current() === null);

    assert.equal(live.current(), null);

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

    await waitFor(() => live.current() !== null);

    // Update an unrelated key
    await table.update({ id: 'b', value: '99' });

    // Give time for any spurious update to land
    await new Promise(resolve => setTimeout(resolve, 20));

    assert.deepEqual(
      live.current(),
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

    await waitFor(() => live.current() !== null);

    await table.clear();

    await waitFor(() => live.current() === null);

    assert.equal(live.current(), null);

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
      table.record('a');

    const received: Array<TestRecord | null> = [];

    const unsubscribe =
      live.subscribe(value => {
        received.push(value);
      });

    await table.add({ id: 'a', value: '10' });

    await waitFor(() => received.length >= 1);

    assert.equal(received.length, 1);
    assert.deepEqual(received[0], { id: 'a', value: '10' });

    unsubscribe();

    // Changes after unsubscribe must not reach the listener
    await table.update({ id: 'a', value: '20' });

    await new Promise(resolve => setTimeout(resolve, 20));

    assert.equal(received.length, 1);

    live.dispose();
  });

test(
  `${TEST_SUITE}: disposing stops notifications`,
  async () => {
    const db =
      await openTestDb();

    const table =
      new Table<TestRecord>('items', db);

    await table.add({ id: 'a', value: '10' });

    const live =
      table.record('a');

    await waitFor(() => live.current() !== null);

    const received: Array<TestRecord | null> = [];

    live.subscribe(value => {
      received.push(value);
    });

    live.dispose();

    await table.update({ id: 'a', value: '20' });

    await new Promise(resolve => setTimeout(resolve, 20));

    assert.equal(received.length, 0);
  });

test(
  `${TEST_SUITE}: LiveRecord is exported directly from index`,
  () => {
    assert.equal(typeof LiveRecord, 'function');
  });
