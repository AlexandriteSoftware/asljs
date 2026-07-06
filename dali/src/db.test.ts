import { test }
  from 'node:test';
import assert
  from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { dbDelete,
         dbOpen }
  from './db.js';
import { TransactionStoreAccessError,
         txReuseOrCreate,
         TxMode }
  from './transactions.js';

const TEST_SUITE =
  'db';

async function openBasicDb(
  ): Promise<IDBDatabase>
{
  return dbOpen(
    `db-test-${crypto.randomUUID()}`,
    [ db => {
        db.createObjectStore(
          'records',
          { keyPath: 'id' });
      } ]);
}

test(
  `${TEST_SUITE}: txReuseOrCreate reuses compatible transaction`,
  async () => {
    const db =
      await openBasicDb();

    const tx =
      db.transaction(
        [ 'records' ],
        TxMode.readWrite);

    const reused =
      txReuseOrCreate(
        tx,
        'records',
        TxMode.read,
        db);

    assert.equal(
      reused,
      tx);
  });

test(
  `${TEST_SUITE}: txReuseOrCreate throws for inaccessible store`,
  async () => {
    const db =
      await openBasicDb();

    const tx =
      db.transaction(
        [ 'records' ],
        TxMode.read);

    assert.throws(
      () =>
        txReuseOrCreate(
          tx,
          'missing',
          TxMode.read,
          db),
      (error: unknown) => {
        assert.ok(
          error instanceof TransactionStoreAccessError);

        return true;
      });
  });

test(
  `${TEST_SUITE}: dbDelete removes existing database`,
  async () => {
    const dbName =
      `db-delete-test-${crypto.randomUUID()}`;

    const opened =
      await dbOpen(
        dbName,
        [ db => {
            db.createObjectStore(
              'records',
              { keyPath: 'id' });
          } ]);

    opened.close();

    await dbDelete(dbName);

    let upgraded = false;

    const reopened =
      await dbOpen(
        dbName,
        [ db => {
            upgraded = true;
            db.createObjectStore(
              'records',
              { keyPath: 'id' });
          } ]);

    assert.equal(
      upgraded,
      true);

    reopened.close();
  });

test(
  `${TEST_SUITE}: dbOpen runs all migrations for a new database`,
  async () => {
    const db =
      await dbOpen(
        `db-migration-test-${crypto.randomUUID()}`,
        [ database => {
            database.createObjectStore(
              'first',
              { keyPath: 'id' });
          },
          database => {
            database.createObjectStore(
              'second',
              { keyPath: 'id' });
          } ]);

    assert.equal(
      db.objectStoreNames.contains('first'),
      true);
    assert.equal(
      db.objectStoreNames.contains('second'),
      true);

    db.close();
  });

test(
  `${TEST_SUITE}: dbOpen starts migrations after existing oldVersion`,
  async () => {
    const dbName =
      `db-upgrade-test-${crypto.randomUUID()}`;

    const firstVersion =
      await dbOpen(
        dbName,
        [ database => {
            database.createObjectStore(
              'first',
              { keyPath: 'id' });
          } ]);

    firstVersion.close();

    const secondVersion =
      await dbOpen(
        dbName,
        [ database => {
            database.createObjectStore(
              'first',
              { keyPath: 'id' });
          },
          database => {
            database.createObjectStore(
              'second',
              { keyPath: 'id' });
          } ]);

    assert.equal(
      secondVersion.objectStoreNames.contains('first'),
      true);
    assert.equal(
      secondVersion.objectStoreNames.contains('second'),
      true);

    secondVersion.close();
  });
