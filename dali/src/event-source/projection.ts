import { dbRequestAsync }
  from '../db.js';
import { txDone,
         TxMode,
         txReuseOrCreate }
  from '../transactions.js';
import { EventSourceManager }
  from './manager.js';
import { EVENT_SOURCE_PROJECTION_STORE_NAME,
         EVENT_SOURCE_STORE_NAME,
         EventSourceProjection,
         EventSourceTransaction }
  from './types.js';

export async function eventSourceGetAll(
  db: IDBDatabase,
  tx: IDBTransaction | null = null,
  storeName: string = EVENT_SOURCE_STORE_NAME
): Promise<EventSourceTransaction[]>
{
  const ltx =
    txReuseOrCreate(
      tx,
      [storeName],
      TxMode.read,
      db);

  const records =
    await dbRequestAsync(
      ltx.objectStore(storeName)
      .index('by_sequence')
      .getAll());

  if (tx === null) {
    await txDone(ltx);
  }

  return records;
}

export async function eventSourceProjectionGet(
  db: IDBDatabase,
  projectionId: string,
  storeName: string = EVENT_SOURCE_PROJECTION_STORE_NAME
): Promise<EventSourceProjection | null>
{
  const tx =
    txReuseOrCreate(
      null,
      [storeName],
      TxMode.read,
      db);

  const projection =
    await dbRequestAsync(
      tx.objectStore(storeName)
      .get(projectionId));

  await txDone(tx);

  return projection ?? null;
}

export async function eventSourceProjectionSet(
  db: IDBDatabase,
  projection: EventSourceProjection,
  storeName: string = EVENT_SOURCE_PROJECTION_STORE_NAME
): Promise<void>
{
  const tx =
    txReuseOrCreate(
      null,
      [storeName],
      TxMode.readWrite,
      db);

  await dbRequestAsync(
    tx.objectStore(storeName)
      .put(projection)
  );

  await txDone(tx);
}

export class EventSourceProjectionManager
{
  constructor(
    public readonly projectionId: string,
    public readonly source: EventSourceManager,
    private readonly apply: (
      transaction: EventSourceTransaction
    ) => Promise<void>,
    private readonly projectionReader: () => Promise<
      EventSourceProjection | null
    >,
    private readonly projectionWriter: (
      projection: EventSourceProjection
    ) => Promise<void>
  )
  {
  }

  async applyPending(): Promise<number>
  {
    const checkpoint =
      await this.projectionReader();

    const currentId =
      checkpoint?.appliedTransactionId
      ?? null;

    const transactions =
      await this.source.readAfter(currentId);

    let applied = 0;

    for (const transaction of transactions) {
      await this.apply(transaction);

      await this.projectionWriter(
        {
          projectionId: this.projectionId,
          appliedTransactionId: transaction.id,
          updatedAt: new Date().toISOString()
        }
      );

      applied += 1;
    }

    return applied;
  }
}
