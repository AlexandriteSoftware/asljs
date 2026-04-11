import {
    type Table,
  } from '../table.js';
import {
    dbRequestAsync,
  } from '../db.js';
import {
    keyGet,
  } from '../keys.js';
import {
    txDone,
    txReuseOrCreate,
    TxMode,
  } from '../transactions.js';
import {
    type EventSourceEvent,
    type EventSourceManager,
  } from '../event-source.js';
import {
    SagaEntryRecord,
    SagaForwardOperation,
    SAGA_ENTRIES_STORE_NAME,
    SAGA_STORE_NAME,
    SagaTransactionRecord,
    SagaUndoOperation,
  } from './types.js';

function nowIso(
  ): string
{
  return new Date().toISOString();
}

export class SagaManager
{
  readonly #sagaStoreName: string;
  readonly #entryStoreName: string;
  readonly #eventSource: EventSourceManager | null;

  constructor(
      public readonly db: IDBDatabase,
      options:
        { sagaStoreName?: string;
          entryStoreName?: string;
          eventSource?: EventSourceManager | null; } = {}
    )
  {
    this.#sagaStoreName =
      options.sagaStoreName
      ?? SAGA_STORE_NAME;

    this.#entryStoreName =
      options.entryStoreName
      ?? SAGA_ENTRIES_STORE_NAME;

    this.#eventSource =
      options.eventSource
      ?? null;
  }

  async execute(
      sagaName: string,
      tables: Table<Record<string, any>>[],
      action: () => Promise<void>
    ): Promise<string>
  {
    const sagaId =
      crypto.randomUUID();

    await this.#insertSaga(
      { id: sagaId,
        name: sagaName,
        status: 'started',
        createdAt: nowIso(),
        updatedAt: nowIso() });

    let sequence = 0;
    const unsubscribeActions: Array<() => boolean> = [];

    let queue: Promise<void> = Promise.resolve();
    let queueError: unknown = null;

    const enqueue =
      (job: () => Promise<void>): void => {
        queue =
          queue.then(
            async () => {
              if (queueError !== null)
                return;

              try {
                await job();
              } catch (error) {
                queueError = error;
              }
            });
      };

    for (const table of tables) {
      const unsubscribe =
        table.notify(
          { add: record => {
              sequence += 1;

              const undo: SagaUndoOperation =
                { type: 'delete',
                  tableName: table.storeName,
                  key: keyGet(table.key, record) };

              const forward: SagaForwardOperation =
                { type: 'add',
                  tableName: table.storeName,
                  record };

              enqueue(
                async () => {
                  await this.#insertEntry(
                    { sagaId,
                      sequence,
                      tableName: table.storeName,
                      eventName: 'add',
                      forward,
                      undo,
                      createdAt: nowIso() });
                });
            },
            update: (
                record,
                previousRecord
              ) => {
              sequence += 1;

              const undo: SagaUndoOperation =
                { type: 'put',
                  tableName: table.storeName,
                  record: previousRecord };

              const forward: SagaForwardOperation =
                { type: 'update',
                  tableName: table.storeName,
                  record,
                  previousRecord };

              enqueue(
                async () => {
                  await this.#insertEntry(
                    { sagaId,
                      sequence,
                      tableName: table.storeName,
                      eventName: 'update',
                      forward,
                      undo,
                      createdAt: nowIso() });
                });
            },
            delete: record => {
              sequence += 1;

              const undo: SagaUndoOperation =
                { type: 'put',
                  tableName: table.storeName,
                  record: this.#undoDeleteRecord(record) };

              const forward: SagaForwardOperation =
                { type: 'delete',
                  tableName: table.storeName,
                  record };

              enqueue(
                async () => {
                  await this.#insertEntry(
                    { sagaId,
                      sequence,
                      tableName: table.storeName,
                      eventName: 'delete',
                      forward,
                      undo,
                      createdAt: nowIso() });
                });
            },
            clear: records => {
              sequence += 1;

              const undo: SagaUndoOperation =
                { type: 'clear',
                  tableName: table.storeName,
                  records };

              const forward: SagaForwardOperation =
                { type: 'clear',
                  tableName: table.storeName,
                  records };

              enqueue(
                async () => {
                  await this.#insertEntry(
                    { sagaId,
                      sequence,
                      tableName: table.storeName,
                      eventName: 'clear',
                      forward,
                      undo,
                      createdAt: nowIso() });
                });
            } });

      unsubscribeActions.push(unsubscribe);
    }

    try {
      await action();

      await this.#waitForCapturedEvents(
        () => sequence,
        () => queue);

      if (queueError !== null)
        throw queueError;
    } catch (error) {
      await this.#waitForCapturedEvents(
        () => sequence,
        () => queue);

      for (const unsubscribe of unsubscribeActions)
        unsubscribe();

      await this.rollbackSaga(sagaId);

      throw error;
    }

    for (const unsubscribe of unsubscribeActions)
      unsubscribe();

    try {
      const eventTransactionId =
        await this.#completeSaga(sagaId);

      await this.#updateSaga(
        sagaId,
        { status: 'completed',
          completedAt: nowIso(),
          updatedAt: nowIso(),
          eventTransactionId,
          error: undefined });
    } catch (error) {
      // Saga remains started and recoverPending() may roll it back on restart.
      await this.#updateSaga(
        sagaId,
        { status: 'started',
          updatedAt: nowIso(),
          error: String(error) });

      throw error;
    }

    return sagaId;
  }

  async recoverPending(
    ): Promise<string[]>
  {
    const tx =
      this.db.transaction(
        [ this.#sagaStoreName ],
        TxMode.read);

    const request =
      tx.objectStore(this.#sagaStoreName)
        .index('by_status')
        .getAll('started');

    const pending =
      await dbRequestAsync<SagaTransactionRecord[]>(request);

    await txDone(tx);

    const rolledBack: string[] = [];

    for (const saga of pending) {
      await this.rollbackSaga(saga.id);
      rolledBack.push(saga.id);
    }

    return rolledBack;
  }

  async rollbackSaga(
      sagaId: string
    ): Promise<void>
  {
    const entries =
      await this.#readEntries(sagaId);

    const reversed =
      entries
        .slice()
        .sort((left, right) => right.sequence - left.sequence);

    const storeNames =
      Array.from(
        new Set(
          reversed.map(entry => entry.undo.tableName)));

    const tx =
      txReuseOrCreate(
        null,
        [ ...storeNames,
          this.#sagaStoreName ],
        TxMode.readWrite,
        this.db);

    for (const entry of reversed) {
      const undo =
        entry.undo;

      const store =
        tx.objectStore(undo.tableName);

      switch (undo.type) {
        case 'delete':
          await dbRequestAsync(
            store.delete(undo.key));
          break;
        case 'put':
          await dbRequestAsync(
            store.put(undo.record));
          break;
        case 'clear':
          await dbRequestAsync(
            store.clear());

          for (const record of undo.records) {
            await dbRequestAsync(
              store.add(record));
          }
          break;
      }
    }

    const sagaStore =
      tx.objectStore(this.#sagaStoreName);

    const saga =
      await dbRequestAsync<SagaTransactionRecord | undefined>(
        sagaStore.get(sagaId));

    if (saga !== undefined) {
      await dbRequestAsync(
        sagaStore.put(
          { ...saga,
            status: 'rolled_back',
            rollbackAt: nowIso(),
            updatedAt: nowIso() }));
    }

    await txDone(tx);
  }

  async #insertSaga(
      record: SagaTransactionRecord
    ): Promise<void>
  {
    const tx =
      txReuseOrCreate(
        null,
        [ this.#sagaStoreName ],
        TxMode.readWrite,
        this.db);

    await dbRequestAsync(
      tx.objectStore(this.#sagaStoreName)
        .add(record));

    await txDone(tx);
  }

  async #updateSaga(
      sagaId: string,
      patch: Partial<SagaTransactionRecord>
    ): Promise<void>
  {
    const tx =
      txReuseOrCreate(
        null,
        [ this.#sagaStoreName ],
        TxMode.readWrite,
        this.db);

    const store =
      tx.objectStore(this.#sagaStoreName);

    const current =
      await dbRequestAsync<SagaTransactionRecord | undefined>(
        store.get(sagaId));

    if (current === undefined) {
      await txDone(tx);
      throw new Error(`Saga ${sagaId} not found.`);
    }

    await dbRequestAsync(
      store.put(
        { ...current,
          ...patch }));

    await txDone(tx);
  }

  async #insertEntry(
      entry: Omit<SagaEntryRecord, 'id'>
    ): Promise<void>
  {
    const tx =
      txReuseOrCreate(
        null,
        [ this.#entryStoreName,
          this.#sagaStoreName ],
        TxMode.readWrite,
        this.db);

    await dbRequestAsync(
      tx.objectStore(this.#entryStoreName)
        .add(entry));

    const sagaStore =
      tx.objectStore(this.#sagaStoreName);

    const saga =
      await dbRequestAsync<SagaTransactionRecord | undefined>(
        sagaStore.get(entry.sagaId));

    if (saga !== undefined) {
      await dbRequestAsync(
        sagaStore.put(
          { ...saga,
            updatedAt: nowIso() }));
    }

    await txDone(tx);
  }

  async #readEntries(
      sagaId: string
    ): Promise<SagaEntryRecord[]>
  {
    const tx =
      txReuseOrCreate(
        null,
        [ this.#entryStoreName ],
        TxMode.read,
        this.db);

    const keyRange =
      IDBKeyRange.bound(
        [ sagaId, 0 ],
        [ sagaId, Number.MAX_SAFE_INTEGER ]);

    const entries =
      await dbRequestAsync<SagaEntryRecord[]>(
        tx.objectStore(this.#entryStoreName)
          .index('by_saga_sequence')
          .getAll(keyRange));

    await txDone(tx);

    return entries;
  }

  async #completeSaga(
      sagaId: string
    ): Promise<string | undefined>
  {
    if (this.#eventSource === null)
      return undefined;

    const entries =
      await this.#readEntries(sagaId);

    const events: EventSourceEvent[] =
      entries
        .sort((left, right) => left.sequence - right.sequence)
        .map(
          entry =>
            ({ tableName: entry.tableName,
               eventName: entry.eventName,
               forward: entry.forward,
               undo: entry.undo }));

    const transaction =
      await this.#eventSource.appendTransaction(
        { sagaId,
          events });

    return transaction.id;
  }

  #undoDeleteRecord(
      record: Record<string, any>
    ): Record<string, any>
  {
    const deleted =
      record['deleted'];

    if (typeof deleted === 'string'
        && deleted.length > 0)
    {
      return {
        ...record,
        deleted: ''
      };
    }

    return record;
  }

  async #waitForCapturedEvents(
      getSequence: () => number,
      getQueue: () => Promise<void>
    ): Promise<void>
  {
    let previousSequence =
      -1;

    while (true) {
      await getQueue();

      await new Promise<void>(
        resolve => setTimeout(resolve, 0));

      await getQueue();

      const currentSequence =
        getSequence();

      if (currentSequence === previousSequence)
        return;

      previousSequence = currentSequence;
    }
  }
}