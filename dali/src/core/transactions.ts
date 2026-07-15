export const TxMode =
  {
  read: 'readonly' as IDBTransactionMode,
  readWrite: 'readwrite' as IDBTransactionMode
};

export function txDone(
  tx: IDBTransaction
): Promise<void>
{
  return new Promise(
    (
      resolve,
      reject
    ) =>
    {
      tx.addEventListener(
        'complete',
        () =>
        {
          resolve();
        }
      );

      tx.addEventListener(
        'abort',
        () =>
        {
          reject(
            tx.error
          );
        }
      );

      tx.addEventListener(
        'error',
        () =>
        {
          reject(
            tx.error
          );
        }
      );
    }
  );
}

export function txReuseOrCreate(
  tx: IDBTransaction | null,
  storeNames: string | string[],
  mode: IDBTransactionMode,
  db: IDBDatabase
): IDBTransaction
{
  if (tx) {
    const storeNamesArray =
      Array.isArray(storeNames)
      ? storeNames
      : [storeNames];

    for (const storeName of storeNamesArray) {
      txEnsure(
        tx,
        storeName,
        mode
      );
    }

    return tx;
  }

  return db.transaction(
    storeNames,
    mode
  );
}

export function txEnsure(
  tx: IDBTransaction,
  storeName: string,
  mode: IDBTransactionMode
): void
{
  if (!tx.objectStoreNames.contains(storeName)) {
    throw new TransactionStoreAccessError(storeName);
  }

  switch (mode) {
    case TxMode.read:
      if (
        tx.mode !== TxMode.read
        && tx.mode !== TxMode.readWrite
      ) {
        throw new TransactionReadModeRequiredError(storeName);
      }
      break;
    case TxMode.readWrite:
      if (tx.mode !== TxMode.readWrite) {
        throw new TransactionWriteModeRequiredError(storeName);
      }
      break;
    default:
      throw new UnsupportedTransactionModeError(mode);
  }
}

export class UnsupportedTransactionModeError extends Error
{
  constructor(
    mode: IDBTransactionMode
  )
  {
    super(
      `Unsupported transaction mode "${mode}"`
    );

    this.name = 'UnsupportedTransactionModeError';
  }
}

export class TransactionReadModeRequiredError extends Error
{
  constructor(
    storeName: string
  )
  {
    super(
      `Transaction does not have read access to the store "${storeName}".`
    );

    this.name = 'TransactionReadModeRequiredError';
  }
}

export class TransactionWriteModeRequiredError extends Error
{
  constructor(
    storeName: string
  )
  {
    super(
      `Transaction does not have write access to the store "${storeName}".`
    );

    this.name = 'TransactionWriteModeRequiredError';
  }
}

export class TransactionStoreAccessError extends Error
{
  constructor(
    storeName: string
  )
  {
    super(
      `Transaction does not have access to the store "${storeName}".`
    );

    this.name = 'TransactionStoreAccessError';
  }
}

export function txRead(
  db: IDBDatabase,
  storeName: string,
  tx: IDBTransaction | null = null
): IDBTransaction
{
  if (tx !== null) {
    txEnsure(
      tx,
      storeName,
      TxMode.read
    );

    return tx;
  }

  return db.transaction(
    [storeName],
    TxMode.read
  );
}

export function txWrite(
  db: IDBDatabase,
  storeName: string,
  tx: IDBTransaction | null = null
): IDBTransaction
{
  if (tx !== null) {
    txEnsure(
      tx,
      storeName,
      TxMode.readWrite
    );

    return tx;
  }

  return db.transaction(
    [storeName],
    TxMode.readWrite
  );
}
