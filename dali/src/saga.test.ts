import assert
  from 'node:assert/strict';
import { test }
  from 'node:test';
import 'fake-indexeddb/auto';
import { dbOpen,
         EventSourceAdapter,
         EventSourceConflictError,
         eventSourceGetAll,
         EventSourceManager,
         eventSourceProjectionGet,
         EventSourceProjectionManager,
         eventSourceProjectionSet,
         eventSourceProjectionSetup,
         eventSourceSetup,
         EventSourceTransaction,
         IndexedDbEventSourceAdapter,
         sagaEntriesGetAll,
         sagaGetAll,
         SagaManager,
         sagaSetup,
         Table }
  from './index.js';

type Item = { id: string; value: string; deleted: string; };

class MemoryEventSourceAdapter implements EventSourceAdapter
{
  readonly #items: EventSourceTransaction[] = [];

  constructor(
    public readonly name: string
  )
  {
  }

  async peek(): Promise<EventSourceTransaction | null>
  {
    if (this.#items.length === 0) {
      return null;
    }

    return this.#items[this.#items.length - 1] ?? null;
  }

  async append(
    transaction: EventSourceTransaction,
    expectedPreviousTransactionId: string | null
  ): Promise<void>
  {
    const head =
      await this.peek();

    const actualPrevious =
      head?.id
      ?? null;

    if (actualPrevious !== expectedPreviousTransactionId) {
      throw new EventSourceConflictError(
        `${this.name}: expected previous ${
          String(
            expectedPreviousTransactionId)
        }, actual ${String(actualPrevious)}.`
      );
    }

    const existing =
      this.#items.find(
        item => item.id === transaction.id);

    if (existing) {
      if (JSON.stringify(existing) !== JSON.stringify(transaction)) {
        throw new EventSourceConflictError(
          `${this.name}: duplicate id with different payload.`
        );
      }

      return;
    }

    this.#items.push(transaction);
  }

  async readAfter(
    transactionId: string | null
  ): Promise<EventSourceTransaction[]>
  {
    if (transactionId === null) {
      return [...this.#items];
    }

    const index =
      this.#items.findIndex(
        item => item.id === transactionId);

    if (index < 0) {
      throw new EventSourceConflictError(
        `${this.name}: transaction ${transactionId} not found.`
      );
    }

    return this.#items.slice(
      index + 1);
  }
}

class RejectingAppendAdapter extends MemoryEventSourceAdapter
{
  async append(
    transaction: EventSourceTransaction,
    expectedPreviousTransactionId: string | null
  ): Promise<void>
  {
    await super.append(
      transaction,
      expectedPreviousTransactionId);

    throw new Error('remote write failed');
  }
}

async function openSagaDb(
  ): Promise<IDBDatabase>
{
  return dbOpen(
    `saga-test-${crypto.randomUUID()}`,
    [db =>
    {
      db.createObjectStore(
        'items',
        { keyPath: 'id' });

      sagaSetup(db);
      eventSourceSetup(db);
      eventSourceProjectionSetup(db);
    }]);
}

test(
  'saga: completes only after event source transaction is persisted',
  async () =>
  {
    const db =
      await openSagaDb();

    const table =
      new Table<Item>(
      'items',
      db
    );

    const localAdapter =
      new IndexedDbEventSourceAdapter(db);

    const failingRemote =
      new RejectingAppendAdapter('remote-fail');

    const source =
      new EventSourceManager(
      localAdapter,
      [failingRemote]
    );

    const saga =
      new SagaManager(
      db,
      { eventSource: source }
    );

    await assert.rejects(
      () =>
        saga.execute(
          'write-and-fail-eventsource',
          [table as unknown as Table<Record<string, any>>],
          async () =>
          {
            await table.add(
              { id: 'a', value: '1', deleted: '' });
          }),
      /remote write failed/);

    const sagas =
      await sagaGetAll(db);

    const sagaRecord =
      sagas[0];

    assert.equal(
      sagaRecord?.status,
      'started');

    const events =
      await eventSourceGetAll(db);

    assert.equal(
      events.length,
      0);
  });

test(
  'event source: append succeeds only when all linked stores persist',
  async () =>
  {
    const db =
      await openSagaDb();

    const local =
      new IndexedDbEventSourceAdapter(db);

    const remote =
      new MemoryEventSourceAdapter('remote-ok');

    const source =
      new EventSourceManager(
      local,
      [remote]
    );

    const tx =
      await source.appendTransaction(
        {
        sagaId: 's1',
        events: [{
          tableName: 'items',
          eventName: 'add',
          forward: { id: 'a' },
          undo: { id: 'a' }
        }]
      });

    const localHead =
      await local.peek();

    const remoteHead =
      await remote.peek();

    assert.equal(
      localHead?.id,
      tx.id);

    assert.equal(
      remoteHead?.id,
      tx.id);
  });

test(
  'event source: pull remote ahead and append next transaction',
  async () =>
  {
    const db =
      await openSagaDb();

    const local =
      new IndexedDbEventSourceAdapter(db);

    const remote =
      new MemoryEventSourceAdapter('remote-ahead');

    await remote.append(
      {
        id: 'r1',
        previousTransactionId: null,
        sequence: 1,
        sagaId: 'seed',
        createdAt: new Date().toISOString(),
        events: []
      },
      null);

    const source =
      new EventSourceManager(
      local,
      [remote]
    );

    const appended =
      await source.appendTransaction(
        {
        sagaId: 's2',
        events: [{
          tableName: 'items',
          eventName: 'update',
          forward: { id: 'a', value: '2' },
          undo: { id: 'a', value: '1' }
        }]
      });

    const localAll =
      await local.readAfter(null);

    const remoteAll =
      await remote.readAfter(null);

    assert.equal(
      localAll.length,
      2);

    assert.equal(
      remoteAll.length,
      2);

    assert.equal(
      appended.previousTransactionId,
      'r1');

    assert.equal(
      localAll[0]?.id,
      'r1');

    assert.equal(
      remoteAll[0]?.id,
      'r1');
  });

test(
  'projection: apply pending transactions and persist checkpoint',
  async () =>
  {
    const db =
      await openSagaDb();

    const local =
      new IndexedDbEventSourceAdapter(db);

    const source =
      new EventSourceManager(local);

    await source.appendTransaction(
      {
        sagaId: 's1',
        events: [{
          tableName: 'items',
          eventName: 'add',
          forward: { id: 'a' },
          undo: { id: 'a' }
        }]
      });

    await source.appendTransaction(
      {
        sagaId: 's2',
        events: [{
          tableName: 'items',
          eventName: 'add',
          forward: { id: 'b' },
          undo: { id: 'b' }
        }]
      });

    const applied: string[] = [];

    const projection =
      new EventSourceProjectionManager(
      'table-set-main',
      source,
      async transaction =>
      {
        applied.push(
          transaction.id);
      },
      () =>
        eventSourceProjectionGet(
          db,
          'table-set-main'),
      record =>
        eventSourceProjectionSet(
          db,
          record)
    );

    const appliedCount =
      await projection.applyPending();

    const checkpoint =
      await eventSourceProjectionGet(
        db,
        'table-set-main');

    const secondApplied =
      await projection.applyPending();

    assert.equal(
      appliedCount,
      2);

    assert.equal(
      secondApplied,
      0);

    assert.equal(
      applied.length,
      2);

    assert.equal(
      checkpoint?.appliedTransactionId,
      applied[1]);
  });

test(
  'saga: recover pending rolls back unfinished saga',
  async () =>
  {
    const db =
      await openSagaDb();

    const table =
      new Table<Item>(
      'items',
      db
    );

    await table.add(
      { id: 'a', value: '1', deleted: '' });

    const tx =
      db.transaction(
        ['saga_transactions', 'saga_entries'],
        'readwrite');

    tx.objectStore(
      'saga_transactions')
      .add(
        {
          id: 's1',
          name: 'pending',
          status: 'started',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

    tx.objectStore('saga_entries')
      .add(
        {
          sagaId: 's1',
          sequence: 1,
          tableName: 'items',
          eventName: 'add',
          forward: {
            type: 'add',
            tableName: 'items',
            record: { id: 'a', value: '1', deleted: '' }
          },
          undo: { type: 'delete', tableName: 'items', key: 'a' },
          createdAt: new Date().toISOString()
        });

    await new Promise<void>(
      (resolve, reject) =>
      {
        tx.oncomplete = () => resolve();

        tx.onerror = () =>
          reject(
            tx.error);

        tx.onabort = () =>
          reject(
            tx.error);
      }
    );

    const manager =
      new SagaManager(db);

    const rolledBack =
      await manager.recoverPending();

    const record =
      await table.getOne('a');

    const sagas =
      await sagaGetAll(db);

    const sagaRecord =
      sagas.find(
        item => item.id === 's1');

    assert.deepEqual(
      rolledBack,
      ['s1']);

    assert.equal(
      record,
      null);

    assert.equal(
      sagaRecord?.status,
      'rolled_back');
  });

// Keep named import used to validate public API compiles end-to-end.
void sagaEntriesGetAll;
