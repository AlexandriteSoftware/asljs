import { EVENT_SOURCE_PROJECTION_STORE_NAME,
         EVENT_SOURCE_STORE_NAME }
  from './types.js';

export function eventSourceSetup(
  db: IDBDatabase,
  storeName: string = EVENT_SOURCE_STORE_NAME
): void
{
  if (!db.objectStoreNames.contains(storeName)) {
    const store =
      db.createObjectStore(
        storeName,
        { keyPath: 'id' });

    store.createIndex(
      'by_sequence',
      'sequence',
      { unique: true }
    );

    store.createIndex(
      'by_previous',
      'previousTransactionId',
      { unique: false }
    );
  }
}

export function eventSourceProjectionSetup(
  db: IDBDatabase,
  storeName: string = EVENT_SOURCE_PROJECTION_STORE_NAME
): void
{
  if (db.objectStoreNames.contains(storeName)) {
    return;
  }

  db.createObjectStore(
    storeName,
    { keyPath: 'projectionId' }
  );
}
