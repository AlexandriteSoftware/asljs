import { dbRequestAsync }
  from '../db.js';
import { txDone,
         TxMode,
         txReuseOrCreate }
  from '../transactions.js';
import { SAGA_ENTRIES_STORE_NAME,
         SAGA_STORE_NAME,
         SagaEntryRecord,
         SagaTransactionRecord }
  from './types.js';

export async function sagaGetAll(
    db: IDBDatabase,
    storeName: string = SAGA_STORE_NAME
  ): Promise<SagaTransactionRecord[]>
{
  const tx =
    txReuseOrCreate(
      null,
      [storeName],
      TxMode.read,
      db);

  const records =
    await dbRequestAsync(
      tx.objectStore(storeName)
      .getAll());

  await txDone(tx);

  return records;
}

export async function sagaEntriesGetAll(
    db: IDBDatabase,
    storeName: string = SAGA_ENTRIES_STORE_NAME
  ): Promise<SagaEntryRecord[]>
{
  const tx =
    txReuseOrCreate(
      null,
      [storeName],
      TxMode.read,
      db);

  const records =
    await dbRequestAsync(
      tx.objectStore(storeName)
      .getAll());

  await txDone(tx);

  return records;
}
