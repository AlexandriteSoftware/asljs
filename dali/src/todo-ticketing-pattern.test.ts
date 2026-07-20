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
         sagaGetAll,
         SagaManager,
         sagaSetup,
         Table,
         UuidSoftDeleteTableDeleteStrategy,
         UuidTableVersionStrategy }
  from './index.js';

type Ticket = {
  id: string;
  version: string;
  deleted: string;
  title: string;
  assigneeId: string;
};

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
        `${this.name}: head mismatch expected ${
          String(
            expectedPreviousTransactionId)
        } actual ${String(actualPrevious)}.`
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

async function openTicketingDb(
  ): Promise<IDBDatabase>
{
  return dbOpen(
    `ticketing-pattern-test-${crypto.randomUUID()}`,
    [db =>
    {
      const tickets =
        db.createObjectStore(
          'tickets',
          { keyPath: 'id' });

      tickets.createIndex(
        'by_deleted',
        'deleted',
        { unique: false });

      tickets.createIndex(
        'by_assignee_deleted',
        ['assigneeId', 'deleted'],
        { unique: false });

      db.createObjectStore(
        'ticket_read_model',
        { keyPath: 'assigneeId' });

      sagaSetup(db);
      eventSourceSetup(db);
      eventSourceProjectionSetup(db);
    }]);
}

function ticketDeleteMapper(
    index: string,
    key: IDBValidKey
  ):
  | { index: string; key: IDBValidKey; }
  | null
{
  if (key instanceof IDBKeyRange) {
    return null;
  }

  if (index === 'by_deleted') {
    return {
      index,
      key: ''
    };
  }

  if (Array.isArray(key)) {
    return {
      index,
      key: [...key, ''] as unknown as IDBValidKey
    };
  }

  return {
    index,
    key: [key, ''] as unknown as IDBValidKey
  };
}

test(
  'ticketing pattern: soft delete + version + saga + event source + projection sync',
  async () =>
  {
    const db =
      await openTicketingDb();

    const table =
      new Table<Ticket>(
      'tickets',
      db,
      {
        versionStrategy: new UuidTableVersionStrategy('version'),
        deleteStrategy: new UuidSoftDeleteTableDeleteStrategy(
          'deleted',
          ticketDeleteMapper
        )
      }
    );

    const localAdapter =
      new IndexedDbEventSourceAdapter(db);

    const remoteAdapter =
      new MemoryEventSourceAdapter('remote');

    const source =
      new EventSourceManager(
      localAdapter,
      [remoteAdapter]
    );

    const saga =
      new SagaManager(
      db,
      { eventSource: source }
    );

    await saga.execute(
      'ticket-edit',
      [table as unknown as Table<Record<string, any>>],
      async () =>
      {
        const t1 =
          await table.add(
            {
            id: 't1',
            version: '',
            deleted: '',
            title: 'First',
            assigneeId: 'u1'
          });

        const t2 =
          await table.add(
            {
            id: 't2',
            version: '',
            deleted: '',
            title: 'Second',
            assigneeId: 'u1'
          });

        await table.update(
          { ...t1, title: 'First updated' },
          t1.version);

        await table.delete(
          t2.id,
          t2.version);
      });

    const active =
      await table.getAll();

    assert.equal(
      active.length,
      1);

    assert.equal(
      active[0]?.id,
      't1');

    const sagas =
      await sagaGetAll(db);

    assert.equal(
      sagas.length,
      1);

    assert.equal(
      sagas[0]?.status,
      'completed');

    assert.equal(
      typeof sagas[0]?.eventTransactionId,
      'string');

    const localTransactions =
      await eventSourceGetAll(db);

    const remoteTransactions =
      await remoteAdapter.readAfter(null);

    assert.equal(
      localTransactions.length,
      1);

    assert.equal(
      remoteTransactions.length,
      1);

    assert.equal(
      localTransactions[0]?.id,
      remoteTransactions[0]?.id);

    const projectedCounts = new Map<string, number>();

    const projection =
      new EventSourceProjectionManager(
      'ticket-read-model-v1',
      source,
      async transaction =>
      {
        for (const event of transaction.events) {
          if (event.tableName !== 'tickets') {
            continue;
          }

          const forward =
            event.forward as {
            assigneeId?: string;
            deleted?: string;
          };

          if (event.eventName === 'add') {
            const assigneeId =
              forward.assigneeId ?? '';

            if (assigneeId === '') {
              continue;
            }

            const current =
              projectedCounts.get(assigneeId)
              ?? 0;

            projectedCounts.set(
              assigneeId,
              current + 1);
          }

          if (event.eventName === 'delete') {
            const assigneeId =
              forward.assigneeId ?? '';

            if (assigneeId === '') {
              continue;
            }

            const current =
              projectedCounts.get(assigneeId)
              ?? 0;

            projectedCounts.set(
              assigneeId,
              Math.max(
                current - 1,
                0));
          }
        }
      },
      () =>
        eventSourceProjectionGet(
          db,
          'ticket-read-model-v1'),
      record =>
        eventSourceProjectionSet(
          db,
          record)
    );

    const firstApplied =
      await projection.applyPending();

    const secondApplied =
      await projection.applyPending();

    assert.equal(
      firstApplied,
      1);

    assert.equal(
      secondApplied,
      0);

    const beforeRemoteAhead =
      projectedCounts.get('u1')
      ?? 0;

    assert.equal(
      beforeRemoteAhead,
      0);

    const remoteHead =
      await remoteAdapter.peek();

    await remoteAdapter.append(
      {
        id: 'remote-extra',
        previousTransactionId: remoteHead?.id ?? null,
        sequence: (remoteHead?.sequence ?? 0) + 1,
        sagaId: 'remote-sync',
        createdAt: new Date().toISOString(),
        events: [{
          tableName: 'tickets',
          eventName: 'add',
          forward: { id: 't3', assigneeId: 'u1', deleted: '' },
          undo: { id: 't3' }
        }]
      },
      remoteHead?.id ?? null);

    await source.synchronize();

    const afterSyncApplied =
      await projection.applyPending();

    const afterRemoteAhead =
      projectedCounts.get('u1')
      ?? 0;

    assert.equal(
      afterSyncApplied,
      1);

    assert.equal(
      afterRemoteAhead,
      1);
  });
