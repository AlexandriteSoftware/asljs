import assert
  from 'node:assert/strict';
import { test }
  from 'node:test';
import 'fake-indexeddb/auto';
import { dbOpen }
  from './db.js';
import { TransactionStoreAccessError,
         txEnsure,
         TxMode }
  from './transactions.js';

const TEST_SUITE = 'transactions';

async function openTestDb(): Promise<IDBDatabase>
{
  return dbOpen(
    `transactions-test-${crypto.randomUUID()}`,
    [db =>
    {
      db.createObjectStore(
        'records',
        { keyPath: 'id' }
      );
    }]
  );
}

test(
  `${TEST_SUITE}: txEnsure accepts read mode on readwrite transaction`,
  async () =>
  {
    const db =
      await openTestDb();

    const tx =
      db.transaction(
        'records',
        TxMode.readWrite);

    assert.doesNotThrow(
      () =>
        txEnsure(
          tx,
          'records',
          TxMode.read
        )
    );
  }
);

test(
  `${TEST_SUITE}: txEnsure throws for inaccessible store`,
  async () =>
  {
    const db =
      await openTestDb();

    const tx =
      db.transaction(
        'records',
        TxMode.read);

    assert.throws(
      () =>
        txEnsure(
          tx,
          'missing_store',
          TxMode.read
        ),
      (error: unknown) =>
      {
        assert.ok(
          error instanceof TransactionStoreAccessError
        );

        return true;
      }
    );
  }
);
