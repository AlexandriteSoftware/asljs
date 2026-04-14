import {
    dbOpen,
    dbRequestAsync,
  } from 'asljs-dali';
import {
    type AppRecord,
    type FileRecord,
  } from './types.js';

const DB_NAME =
  'asljs-app-builder';

let dbRef: IDBDatabase | null = null;

async function getDb(
  ): Promise<IDBDatabase>
{
  if (dbRef !== null) {
    return dbRef;
  }

  dbRef =
    await dbOpen(
      DB_NAME,
      [ db => {
          db.createObjectStore(
            'apps',
            { keyPath: 'id' });

          const filesStore =
            db.createObjectStore(
              'files',
              { keyPath: 'id' });

          filesStore.createIndex(
            'byAppId',
            'appId',
            { unique: false });
        } ]);

  return dbRef;
}

export async function listApps(
  ): Promise<AppRecord[]>
{
  const db =
    await getDb();

  const tx =
    db.transaction(
      'apps',
      'readonly');

  return dbRequestAsync(
    tx.objectStore('apps').getAll());
}

export async function saveApp(
    app: AppRecord
  ): Promise<void>
{
  const db =
    await getDb();

  const tx =
    db.transaction(
      'apps',
      'readwrite');

  await dbRequestAsync(
    tx.objectStore('apps').put(app));
}

export async function deleteApp(
    id: string
  ): Promise<void>
{
  const db =
    await getDb();

  const tx =
    db.transaction(
      [ 'apps', 'files' ],
      'readwrite');

  await dbRequestAsync(
    tx.objectStore('apps').delete(id));

  const filesStore =
    tx.objectStore('files');

  const fileKeys =
    await dbRequestAsync(
      filesStore.index('byAppId').getAllKeys(id));

  for (const key of fileKeys) {
    await dbRequestAsync(
      filesStore.delete(key));
  }
}

export async function listFiles(
    appId: string
  ): Promise<FileRecord[]>
{
  const db =
    await getDb();

  const tx =
    db.transaction(
      'files',
      'readonly');

  return dbRequestAsync(
    tx.objectStore('files')
      .index('byAppId')
      .getAll(appId));
}

export async function saveFile(
    file: FileRecord
  ): Promise<void>
{
  const db =
    await getDb();

  const tx =
    db.transaction(
      'files',
      'readwrite');

  await dbRequestAsync(
    tx.objectStore('files').put(file));
}

export async function deleteFile(
    fileId: string
  ): Promise<void>
{
  const db =
    await getDb();

  const tx =
    db.transaction(
      'files',
      'readwrite');

  await dbRequestAsync(
    tx.objectStore('files').delete(fileId));
}

export async function replaceFiles(
    appId: string,
    files: FileRecord[]
  ): Promise<void>
{
  const db =
    await getDb();

  const tx =
    db.transaction(
      'files',
      'readwrite');

  const store =
    tx.objectStore('files');

  const existingKeys =
    await dbRequestAsync(
      store.index('byAppId').getAllKeys(appId));

  for (const key of existingKeys) {
    await dbRequestAsync(
      store.delete(key));
  }

  for (const file of files) {
    await dbRequestAsync(
      store.put(file));
  }
}
