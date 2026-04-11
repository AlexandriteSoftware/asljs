import {
    EventfulBase
  } from 'asljs-eventful';
import {
    dbRequestAsync
  } from './db.js';
import {
    type KeyPath,
    keyAssert,
    keyGet,
    keyPathAssert,
  } from './keys.js';
import {
    type DeleteStrategy,
  } from './delete-strategy.js';
import {
    VersionConflictError
  } from './version-conflict-error.js';
import {
    type VersionStrategy
  } from './version-strategy.js';
import {
    txDone,
    txRead,
    txWrite,
  } from './transactions.js';

export type TableEvents<T extends Record<string, any>> =
  { add: [ record: T ];
    update: [ record: T, previousRecord: T ];
    delete: [ record: T ];
    clear: [ records: T[] ]; };

export type TableEventsReceiver<T extends Record<string, any>> =
  Partial<
    {
      [K in keyof TableEvents<T>]:
        (...args: TableEvents<T>[K]) => void;
    }
  >;

export class Table<
    T extends Record<string, any>>
  extends EventfulBase<TableEvents<T>>
{
  readonly #receivers: Array<TableEventsReceiver<T>> = [];

  public readonly key: KeyPath<T>;

  readonly #versionStrategy: VersionStrategy<T> | undefined;

  readonly #deleteStrategy: DeleteStrategy<T> | undefined;

  constructor(
      public readonly storeName: string,
      public readonly db: IDBDatabase,
      options?:
        { versionStrategy?: VersionStrategy<T>;
          deleteStrategy?: DeleteStrategy<T>; }
    )
  {
    super();

    this.#versionStrategy = options?.versionStrategy;
    this.#deleteStrategy = options?.deleteStrategy;

    const key =
      txRead(this.db, this.storeName)
        .objectStore(this.storeName)
        .keyPath as KeyPath<T>;

    keyPathAssert(
      key as KeyPath<T>);

    this.key = key;
  }

  getOne(
      key: IDBValidKey,
      tx: IDBTransaction | null = null
    ): Promise<T | null>
  {
    keyAssert(
      this.key,
      key);

    return new Promise<T | null>(
      (
          resolve,
          reject
        ) =>
      {
        const request =
          txRead(
            this.db,
            this.storeName,
            tx)
            .objectStore(this.storeName)
            .get(key);

        request.onsuccess =
          () => {
            const fields: T | undefined = request.result;

            if (fields === undefined) {
              resolve(null);
              return;
            }

            if (this.#isDeleted(fields)) {
              resolve(null);
              return;
            }

            resolve(fields);
          };

        request.onerror =
          () => {
            reject(
              request.error
              ?? new Error(
                   `${this.storeName}: getOne request failed`));
          };
      });
  }

  get(
      index: string,
      key: IDBValidKey,
      tx: IDBTransaction | null = null
    ): Promise<T[]>
  {
    if (this.#deleteStrategy === undefined)
      return this.#getByIndex(index, key, tx);

    return this.#getActiveByIndex(index, key, tx);
  }

  notify(
      receiver: TableEventsReceiver<T>
    ): () => boolean
  {
    this.#receivers.push(receiver);

    return () : boolean => {
      const index =
        this.#receivers.indexOf(receiver);

      if (index < 0)
        return false;

      this.#receivers.splice(index, 1);
      return true;
    };
  }

  async getAll(
      tx: IDBTransaction | null = null
    ): Promise<T[]>
  {
    const records =
      await dbRequestAsync<T[]>(
        txRead(this.db, this.storeName, tx)
          .objectStore(this.storeName)
          .getAll());

    return this.#activeRecords(records);
  }

  scan(
      predicate: (
          record: T
        ) => boolean,
      tx: IDBTransaction | null = null
    ): Promise<T[]>
  {
    return new Promise<T[]>(
      (
          resolve,
          reject
        ) =>
      {
        const request =
          txRead(this.db, this.storeName, tx)
            .objectStore(this.storeName)
            .openCursor();

        const result: T[] = [];

        request.onsuccess =
          () => {
            const cursor =
              request.result;

            if (cursor === null) {
              resolve(result);
              return;
            }

            const record =
              cursor.value as T;

            if (this.#isDeleted(record)) {
              cursor.continue();
              return;
            }

            try {
              if (predicate(record)) {
                result.push(record);
              }
            } catch (error) {
              reject(error);
              return;
            }
            cursor.continue();
          };
        request.onerror =
          () => {
            reject(
              request.error
              ?? new Error(
                   `${this.storeName}: scan request failed`));
          };
      });
  }

  async add(
      record: T,
      tx: IDBTransaction | null = null
    ): Promise<T>
  {
    const storedRecord =
      this.#versionStrategy
        ? this.#versionStrategy.initialise(record)
        : record;

    const ltx =
      txWrite(this.db, this.storeName, tx);

    const store =
      ltx.objectStore(this.storeName);

    await dbRequestAsync(
      store.add(storedRecord));

    this.#onTransactionCompleted(
      store.transaction,
      () => {
        this.emit(
          'add',
          storedRecord);

        this.#notify(
          'add',
          [ storedRecord ]);
      });

    if (tx === null)
      await txDone(ltx);

    return storedRecord;
  }

  async update(
      record: T,
      expectedVersion?: unknown,
      tx: IDBTransaction | null = null
    ): Promise<T>
  {
    const key =
      keyGet(this.key, record);

    const ltx =
      txWrite(this.db, this.storeName, tx);

    const store =
      ltx.objectStore(this.storeName);

    const existing =
      await dbRequestAsync<T | undefined>(
        store.get(key));

    if (!existing) {
      throw new Error(
        `Record with key ${String(key)} not found.`);
    }

    let storedRecord = record;

    if (this.#versionStrategy) {
      if (expectedVersion === undefined) {
        throw new Error(
          `${this.storeName}: expectedVersion is required when a version strategy is configured.`);
      }

      if (!this.#versionStrategy.verify(existing, expectedVersion)) {
        throw new VersionConflictError(
          key,
          expectedVersion,
          this.#versionStrategy.getVersion(existing));
      }

      storedRecord = this.#versionStrategy.update(record);
    }

    await dbRequestAsync(
      store.put(storedRecord));

    this.#onTransactionCompleted(
      store.transaction,
      () => {
        this.emit(
          'update',
          storedRecord,
          existing);

        this.#notify(
          'update',
          [ storedRecord,
            existing ]);
      });

    if (tx === null)
      await txDone(ltx);

    return storedRecord;
  }

  async delete(
      key: IDBValidKey,
      expectedVersion?: unknown,
      tx: IDBTransaction | null = null
    ): Promise<void>
  {
    keyAssert(this.key, key);

    const ltx =
      txWrite(this.db, this.storeName, tx);

    const store =
      ltx.objectStore(this.storeName);

    const existing =
      await dbRequestAsync<T | undefined>(
        store.get(key));

    if (existing === undefined)
      return;

    if (this.#deleteStrategy === undefined) {
      if (this.#versionStrategy) {
        if (expectedVersion === undefined) {
          throw new Error(
            `${this.storeName}: expectedVersion is required when a version strategy is configured.`);
        }

        if (!this.#versionStrategy.verify(existing, expectedVersion)) {
          throw new VersionConflictError(
            key,
            expectedVersion,
            this.#versionStrategy.getVersion(existing));
        }
      }

      await dbRequestAsync(
        store.delete(key));

      this.#onTransactionCompleted(
        store.transaction,
        () => {
          this.emit(
            'delete',
            existing);

          this.#notify(
            'delete',
            [ existing ]);
        });

      if (tx === null)
        await txDone(ltx);

      return;
    }

    if (this.#deleteStrategy.isDeleted(existing))
      return;

    if (this.#versionStrategy) {
      if (expectedVersion === undefined) {
        throw new Error(
          `${this.storeName}: expectedVersion is required when a version strategy is configured.`);
      }

      if (!this.#versionStrategy.verify(existing, expectedVersion)) {
        throw new VersionConflictError(
          key,
          expectedVersion,
          this.#versionStrategy.getVersion(existing));
      }
    }

    let storedRecord =
      this.#deleteStrategy.delete(existing);

    if (this.#versionStrategy)
      storedRecord = this.#versionStrategy.update(storedRecord);

    await dbRequestAsync(
      store.put(storedRecord));

    this.#onTransactionCompleted(
      store.transaction,
      () => {
        this.emit(
          'delete',
          storedRecord);

        this.#notify(
          'delete',
          [ storedRecord ]);
      });

    if (tx === null)
      await txDone(ltx);
  }

  async clear(
      tx: IDBTransaction | null = null
    ): Promise<void>
  {
    const ltx =
      txWrite(this.db, this.storeName, tx);

    const store =
      ltx.objectStore(this.storeName);

    const records =
      await dbRequestAsync<T[]>(
        store.getAll());

    await dbRequestAsync(
      store.clear());

    this.#onTransactionCompleted(
      store.transaction,
      () => {
        this.emit(
          'clear',
          records);

        this.#notify(
          'clear',
          [ records ]);
      });

    if (tx === null)
      await txDone(ltx);
  }

  #activeRecords(
      records: T[]
    ): T[]
  {
    const deleteStrategy =
      this.#deleteStrategy;

    if (deleteStrategy === undefined)
      return records;

    return records.filter(record => !deleteStrategy.isDeleted(record));
  }

  async #getActiveByIndex(
      index: string,
      key: IDBValidKey,
      tx: IDBTransaction | null
    ): Promise<T[]>
  {
    const mapped =
      this.#deleteStrategy?.mapIndexQuery?.(index, key);

    if (mapped) {
      try {
        const records =
          await this.#getByIndex(
            mapped.index,
            mapped.key,
            tx,
            false);

        return this.#activeRecords(records);
      } catch (error) {
        // Degrade to filtering when mapped query cannot be executed.
        if (!this.#canFallbackMappedQuery(error))
          throw error;
      }
    }

    const records =
      await this.#getByIndex(index, key, tx);

    return this.#activeRecords(records);
  }

  #getByIndex(
      index: string,
      key: IDBValidKey,
      tx: IDBTransaction | null,
      validateKey: boolean = true
    ): Promise<T[]>
  {
    const store =
      txRead(this.db, this.storeName, tx)
        .objectStore(this.storeName);

    const idx =
      store.index(index);

    const keyPath =
      idx.keyPath as KeyPath<T>;

    if (validateKey) {
      keyPathAssert(keyPath as KeyPath<T>);
      keyAssert(keyPath, key);
    }

    return new Promise<T[]>(
      (
          resolve,
          reject
        ) =>
      {
        const request =
          idx.getAll(key);

        request.onsuccess =
          () => {
            const records: T[] = request.result;

            resolve(records);
          };

        request.onerror =
          () => {
            reject(
              request.error
              ?? new Error(
                   `${this.storeName}: get request failed for index ${index}`));
          };
      });
  }

  #isDeleted(
      record: T
    ): boolean
  {
    return this.#deleteStrategy?.isDeleted(record)
      ?? false;
  }

  #canFallbackMappedQuery(
      error: unknown
    ): boolean
  {
    if (!(error instanceof DOMException))
      return false;

    return error.name === 'NotFoundError'
      || error.name === 'DataError';
  }

  #onTransactionCompleted(
      tx: IDBTransaction,
      action: () => void
    ): void
  {
    tx.addEventListener(
      'complete',
      () => {
        try {
          action();
        } catch (error) {
          console.error(
            `${this.storeName}: on complete action failed`,
            error);
        }
      },
      { once: true });
  }

  #notify<K extends keyof TableEvents<T>>(
      eventName: K,
      args: TableEvents<T>[K]
    ): void
  {
    if (this.#receivers.length === 0)
      return;

    for (const receiver of this.#receivers) {
      const handler =
        receiver[eventName];

      if (typeof handler !== 'function')
        continue;

      try {
        (handler as (...largs: TableEvents<T>[K]) => void)(...args);
      } catch (error) {
        console.error(
          `${this.storeName}: notify handler failed for event ${String(eventName)}`,
          error);
      }
    }
  }
}
