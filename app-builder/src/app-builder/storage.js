/**
 * Storage layer for ASLJS App Builder.
 *
 * Uses IndexedDB via asljs-dali for local-first persistence.
 * Stores apps metadata and file contents.
 */

import {
    dbOpen,
    dbRequestAsync,
  } from 'asljs-dali';

const DB_NAME = 'asljs-app-builder';

/** @type {IDBDatabase | null} */
let _db = null;

/**
 * @returns {Promise<IDBDatabase>}
 */
async function getDb() {
  if (_db) {
    return _db;
  }

  _db = await dbOpen(
    DB_NAME,
    [
      (db) => {
        // v1: apps + files stores
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
      },
    ]);

  return _db;
}

// ── Apps ──────────────────────────────────────────────────

/**
 * @returns {Promise<import('./types.js').AppRecord[]>}
 */
export async function listApps() {
  const db = await getDb();

  const tx =
    db.transaction(
      'apps',
      'readonly');

  const store =
    tx.objectStore('apps');

  return dbRequestAsync(store.getAll());
}

/**
 * @param {import('./types.js').AppRecord} app
 * @returns {Promise<void>}
 */
export async function saveApp(app) {
  const db = await getDb();

  const tx =
    db.transaction(
      'apps',
      'readwrite');

  await dbRequestAsync(
    tx.objectStore('apps').put(app));
}

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteApp(id) {
  const db = await getDb();

  const tx =
    db.transaction(
      [ 'apps', 'files' ],
      'readwrite');

  await dbRequestAsync(
    tx.objectStore('apps').delete(id));

  const index =
    tx.objectStore('files').index('byAppId');

  const fileKeys =
    await dbRequestAsync(
      index.getAllKeys(id));

  for (const key of fileKeys) {
    await dbRequestAsync(
      tx.objectStore('files').delete(key));
  }
}

// ── Files ─────────────────────────────────────────────────

/**
 * @param {string} appId
 * @returns {Promise<import('./types.js').FileRecord[]>}
 */
export async function listFiles(appId) {
  const db = await getDb();

  const tx =
    db.transaction(
      'files',
      'readonly');

  const index =
    tx.objectStore('files').index('byAppId');

  return dbRequestAsync(
    index.getAll(appId));
}

/**
 * @param {import('./types.js').FileRecord} file
 * @returns {Promise<void>}
 */
export async function saveFile(file) {
  const db = await getDb();

  const tx =
    db.transaction(
      'files',
      'readwrite');

  await dbRequestAsync(
    tx.objectStore('files').put(file));
}

/**
 * @param {string} fileId
 * @returns {Promise<void>}
 */
export async function deleteFile(fileId) {
  const db = await getDb();

  const tx =
    db.transaction(
      'files',
      'readwrite');

  await dbRequestAsync(
    tx.objectStore('files').delete(fileId));
}

/**
 * Replace all files for an app atomically.
 * @param {string} appId
 * @param {import('./types.js').FileRecord[]} files
 * @returns {Promise<void>}
 */
export async function replaceFiles(
    appId,
    files
  ) {
  const db = await getDb();

  const tx =
    db.transaction(
      'files',
      'readwrite');

  const store =
    tx.objectStore('files');

  const index =
    store.index('byAppId');

  const existingKeys =
    await dbRequestAsync(
      index.getAllKeys(appId));

  for (const key of existingKeys) {
    await dbRequestAsync(store.delete(key));
  }

  for (const file of files) {
    await dbRequestAsync(store.put(file));
  }
}
