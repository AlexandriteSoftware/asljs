import { dbRequestAsync }
  from '../db.js';
import { txDone,
         TxMode,
         txReuseOrCreate }
  from '../transactions.js';
import { EVENT_SOURCE_STORE_NAME,
         EventSourceAdapter,
         EventSourceConflictError,
         EventSourceTransaction }
  from './types.js';

async function storePeek(
    store: IDBObjectStore
  ): Promise<EventSourceTransaction | null>
{
  const cursor =
    await dbRequestAsync(
      store.index('by_sequence')
      .openCursor(
        null,
        'prev'));

  if (cursor === null) {
    return null;
  }

  return cursor.value as EventSourceTransaction;
}

export class IndexedDbEventSourceAdapter implements EventSourceAdapter
{
  readonly name: string;

  constructor(
    public readonly db: IDBDatabase,
    public readonly storeName: string = EVENT_SOURCE_STORE_NAME,
    name: string = 'local-indexeddb'
  )
  {
    this.name = name;
  }

  async peek(): Promise<EventSourceTransaction | null>
  {
    const tx =
      txReuseOrCreate(
        null,
        [this.storeName],
        TxMode.read,
        this.db);

    const head =
      await storePeek(
        tx.objectStore(
          this.storeName));

    await txDone(tx);

    return head;
  }

  async append(
    transaction: EventSourceTransaction,
    expectedPreviousTransactionId: string | null
  ): Promise<void>
  {
    const tx =
      txReuseOrCreate(
        null,
        [this.storeName],
        TxMode.readWrite,
        this.db);

    const store =
      tx.objectStore(
        this.storeName);

    const head =
      await storePeek(store);

    const actualPrevious =
      head?.id
      ?? null;

    if (actualPrevious !== expectedPreviousTransactionId) {
      await txDone(tx);

      throw new EventSourceConflictError(
        `${this.name}: expected previous transaction ${
          String(
            expectedPreviousTransactionId)
        }, actual ${String(actualPrevious)}.`
      );
    }

    const existing =
      await dbRequestAsync(
        store.get(
          transaction.id));

    if (existing !== undefined) {
      await txDone(tx);

      // Idempotent append support for retries.
      if (JSON.stringify(existing) !== JSON.stringify(transaction)) {
        throw new EventSourceConflictError(
          `${this.name}: transaction ${transaction.id} already exists with different payload.`
        );
      }

      return;
    }

    await dbRequestAsync(
      store.add(transaction));

    await txDone(tx);
  }

  async readAfter(
    transactionId: string | null
  ): Promise<EventSourceTransaction[]>
  {
    const tx =
      txReuseOrCreate(
        null,
        [this.storeName],
        TxMode.read,
        this.db);

    const store =
      tx.objectStore(
        this.storeName);

    if (transactionId === null) {
      const all =
        await dbRequestAsync(
          store.index('by_sequence')
          .getAll());

      await txDone(tx);

      return all;
    }

    const current =
      await dbRequestAsync(
        store.get(transactionId));

    if (current === undefined) {
      await txDone(tx);

      throw new EventSourceConflictError(
        `${this.name}: transaction ${transactionId} not found.`
      );
    }

    const after =
      await dbRequestAsync(
        store.index('by_sequence')
        .getAll(
          IDBKeyRange.lowerBound(
            current.sequence,
            true)));

    await txDone(tx);

    return after;
  }
}
