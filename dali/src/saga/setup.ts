import { SAGA_ENTRIES_STORE_NAME,
         SAGA_STORE_NAME }
  from './types.js';

export function sagaSetup(
  db: IDBDatabase,
  options: { sagaStoreName?: string; entryStoreName?: string; } = {}
): void
{
  const sagaStoreName =
    options.sagaStoreName
    ?? SAGA_STORE_NAME;

  const entryStoreName =
    options.entryStoreName
    ?? SAGA_ENTRIES_STORE_NAME;

  if (!db.objectStoreNames.contains(sagaStoreName)) {
    const sagaStore =
      db.createObjectStore(
        sagaStoreName,
        { keyPath: 'id' });

    sagaStore.createIndex(
      'by_status',
      'status',
      { unique: false }
    );

    sagaStore.createIndex(
      'by_updatedAt',
      'updatedAt',
      { unique: false }
    );
  }

  if (!db.objectStoreNames.contains(entryStoreName)) {
    const entryStore =
      db.createObjectStore(
        entryStoreName,
        { keyPath: 'id', autoIncrement: true });

    entryStore.createIndex(
      'by_saga_sequence',
      ['sagaId', 'sequence'],
      { unique: true }
    );

    entryStore.createIndex(
      'by_saga',
      'sagaId',
      { unique: false }
    );
  }
}
