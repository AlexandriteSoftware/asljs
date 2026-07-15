import { EventfulBase }
  from 'asljs-eventful';
import { dbRequestAsync }
  from './db.js';
import { DeleteStrategy }
  from './delete-strategy.js';
import { keyAssert,
         keyGet,
         KeyPath,
         keyPathAssert }
  from './keys.js';
import { LiveRecord }
  from './live-record.js';
import { LiveRecordSet }
  from './live-recordset.js';
import { TableBroadcastMessage,
         TableBroadcastService }
  from './table-broadcast-service.js';
import { txDone,
         txRead,
         txWrite }
  from './transactions.js';
import { VersionConflictError }
  from './version-conflict-error.js';
import { VersionStrategy }
  from './version-strategy.js';

export type {
  TableBroadcastMessage,
  TableBroadcastService
};

export {
  LiveRecord,
  LiveRecordSet
};

export type TableEvents<T extends Record<string, any>> = {
  add: [record: T];
  update: [record: T, previousRecord: T];
  delete: [record: T];
  clear: [records: T[]];
};

export type TableEventsReceiver<T extends Record<string, any>> = Partial<
  {
    [K in keyof TableEvents<T>]: (...args: TableEvents<T>[K]) => void;
  }
>;

/**
 * An event delivered to observers (see `Table.observe()`).
 *
 * The `source` field indicates whether the change originated on this tab
 * (`'local'`) or was received via the broadcast service from another tab
 * (`'remote'`).
 *
 * Consumers can use `eventType` as a discriminant to narrow the event and
 * access the typed record fields.
 */
export type TableObservedEvent<T extends Record<string, any>> =
  | { source: 'local' | 'remote'; eventType: 'add'; record: T; }
  | {
    source: 'local' | 'remote';
    eventType: 'update';
    record: T;
    previousRecord: T;
  }
  | { source: 'local' | 'remote'; eventType: 'delete'; record: T; }
  | { source: 'local' | 'remote'; eventType: 'clear'; records: T[]; };

/**
 * Callback signature for `Table.observe()` subscriptions.
 * Receives both local and remote observed events.
 */
export type TableObservedReceiver<T extends Record<string, any>> = (
  event: TableObservedEvent<T>
) => void;

export class Table<
  T extends Record<string, any>
> extends EventfulBase<TableEvents<T>>
{
  /** Local-only subscribers — receive events from this tab only. */
  readonly #receivers: Array<TableEventsReceiver<T>> = [];

  /**
   * Observed subscribers — receive both local commits and remote changes
   * arriving through the broadcast service.
   */
  readonly #observedReceivers: Array<TableObservedReceiver<T>> = [];

  public readonly key: KeyPath<T>;

  readonly #versionStrategy: VersionStrategy<T> | undefined;

  readonly #deleteStrategy: DeleteStrategy<T> | undefined;

  /**
   * Unique ID for this Table instance.
   * Included in every broadcast message as `originId` so that this instance
   * can recognise and discard its own echoed messages.
   */
  readonly #instanceId: string;

  readonly #broadcastService: TableBroadcastService | undefined;

  /** Disposal function returned by the broadcast service subscription. */
  #broadcastUnsubscribe: (() => void) | undefined;

  constructor(
    public readonly storeName: string,
    public readonly db: IDBDatabase,
    options?: {
      versionStrategy?: VersionStrategy<T>;
      deleteStrategy?: DeleteStrategy<T>;
      broadcastService?: TableBroadcastService;
    }
  )
  {
    super();

    this.#versionStrategy = options?.versionStrategy;
    this.#deleteStrategy = options?.deleteStrategy;
    this.#broadcastService = options?.broadcastService;
    this.#instanceId = crypto.randomUUID();

    const key =
      txRead(
        this.db,
        this.storeName)
      .objectStore(
        this.storeName
      )
      .keyPath as KeyPath<T>;

    keyPathAssert(
      key as KeyPath<T>
    );

    this.key = key;

    if (this.#broadcastService !== undefined) {
      this.#broadcastUnsubscribe = this.#broadcastService.subscribe(
        (message) =>
        {
          this.#onBroadcastMessage(message);
        }
      );
    }
  }

  getOne(
    key: IDBValidKey,
    tx: IDBTransaction | null = null
  ): Promise<T | null>
  {
    keyAssert(
      this.key,
      key
    );

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
          .objectStore(
            this.storeName
          )
          .get(key);

        request.onsuccess = () =>
        {
          const fields: T | undefined =
            request.result;

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

        request.onerror = () =>
        {
          reject(
            request.error
              ?? new Error(
                `${this.storeName}: getOne request failed`
              )
          );
        };
      }
    );
  }

  get(
    index: string,
    key: IDBValidKey,
    tx: IDBTransaction | null = null
  ): Promise<T[]>
  {
    if (this.#deleteStrategy === undefined) {
      return this.#getByIndex(
        index,
        key,
        tx
      );
    }

    return this.#getActiveByIndex(
      index,
      key,
      tx
    );
  }

  notify(
    receiver: TableEventsReceiver<T>
  ): () => boolean
  {
    this.#receivers.push(receiver);

    return (): boolean =>
    {
      const index =
        this.#receivers.indexOf(receiver);

      if (index < 0) {
        return false;
      }

      this.#receivers.splice(
        index,
        1
      );

      return true;
    };
  }

  /**
   * Subscribe to **all** table changes — both changes committed by this
   * Table instance (local) and changes received from other tabs via the
   * broadcast service (remote).
   *
   * Each event carries a `source` field (`'local'` or `'remote'`) so
   * consumers can distinguish its origin.
   *
   * Local-only subscribers (registered via `notify()`) are unaffected and
   * continue to receive only local events.
   *
   * Returns an unsubscribe function that removes this observer.
   * Calling it twice is safe and returns `false` on the second call.
   */
  observe(
    receiver: TableObservedReceiver<T>
  ): () => boolean
  {
    this.#observedReceivers.push(receiver);

    return (): boolean =>
    {
      const index =
        this.#observedReceivers.indexOf(receiver);

      if (index < 0) {
        return false;
      }

      this.#observedReceivers.splice(
        index,
        1
      );

      return true;
    };
  }

  /**
   * Release the broadcast service subscription created in the constructor.
   * Call this when the Table instance is no longer needed to prevent leaks.
   */
  dispose(): void
  {
    this.#broadcastUnsubscribe?.();
    this.#broadcastUnsubscribe = undefined;
  }

  /**
   * Returns a **live** single-record view for the given primary key.
   *
   * - `record` on the returned `LiveRecord` gives the matching record, or
   *   `null` when no record exists for that key.
   * - Subscribe to changes via `on('changed', cb)` / `on('deleted', cb)`
   *   (ASLJS eventful).
   * - Watch property paths via `watch('record.someField', cb)`
   *   (ASLJS observable).
   * - The view reacts to committed `add`, `update`, `delete`, and `clear`
   *   events on this table.
   * - Call `dispose()` on the returned view to stop tracking and release
   *   resources.
   *
   * This API is **live by default** — no `.live()` call is required.
   * For one-shot snapshot reads, use `getOne(key)` instead.
   *
   * Note: `record(key)` is limited to key-only semantics for now.
   */
  record(
    key: IDBValidKey
  ): LiveRecord<T>
  {
    return new LiveRecord<T>(
      key,
      this.key,
      (k) => this.getOne(k),
      (receiver) => this.notify(receiver)
    );
  }

  /**
   * Returns a **live** filtered set view over this table.
   *
   * - `records` on the returned `LiveRecordSet` gives a readonly array of
   *   all records currently matching `predicate`.
   * - Subscribe to changes via `on('added', cb)`, `on('removed', cb)`,
   *   `on('updated', cb)`, `on('cleared', cb)`, `on('changed', cb)`
   *   (ASLJS eventful).
   * - Watch property paths via `watch('records.length', cb)`
   *   (ASLJS observable).
   * - Membership is re-evaluated on every committed `add`, `update`,
   *   `delete`, and `clear` event.
   * - Call `dispose()` on the returned view to stop tracking and release
   *   resources.
   *
   * This API is **live by default** — no `.live()` call is required.
   * For one-shot snapshot reads, use `scan(predicate)` instead.
   *
   * Note: `recordset(predicate)` is limited to client-side predicate
   * semantics for now. Joins, ordering, and DB-level query composition are
   * not supported here.
   */
  recordset(
    predicate: (record: T) => boolean
  ): LiveRecordSet<T>
  {
    return new LiveRecordSet<T>(
      this.key,
      predicate,
      (p) => this.scan(p),
      (receiver) => this.notify(receiver)
    );
  }

  async getAll(
    tx: IDBTransaction | null = null
  ): Promise<T[]>
  {
    const records =
      await dbRequestAsync(
        txRead(
          this.db,
          this.storeName,
          tx)
        .objectStore(
          this.storeName
        )
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
          txRead(
            this.db,
            this.storeName,
            tx)
          .objectStore(
            this.storeName
          )
          .openCursor();

        const result: T[] = [];

        request.onsuccess = () =>
        {
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

        request.onerror = () =>
        {
          reject(
            request.error
              ?? new Error(
                `${this.storeName}: scan request failed`
              )
          );
        };
      }
    );
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
      txWrite(
        this.db,
        this.storeName,
        tx);

    const store =
      ltx.objectStore(
        this.storeName);

    await dbRequestAsync(
      store.add(storedRecord)
    );

    this.#onTransactionCompleted(
      store.transaction,
      () =>
      {
        this.emit(
          'add',
          storedRecord
        );

        this.#notify(
          'add',
          [storedRecord]
        );

        this.#notifyObserved(
          { source: 'local', eventType: 'add', record: storedRecord }
        );

        this.#publishBroadcast(
          'add',
          { record: storedRecord }
        );
      }
    );

    if (tx === null) {
      await txDone(ltx);
    }

    return storedRecord;
  }

  async update(
    record: T,
    expectedVersion?: unknown,
    tx: IDBTransaction | null = null
  ): Promise<T>
  {
    const key =
      keyGet(
        this.key,
        record);

    const ltx =
      txWrite(
        this.db,
        this.storeName,
        tx);

    const store =
      ltx.objectStore(
        this.storeName);

    const existing =
      await dbRequestAsync(
        store.get(key));

    if (!existing) {
      throw new Error(
        `Record with key ${String(key)} not found.`
      );
    }

    let storedRecord = record;

    if (this.#versionStrategy) {
      if (expectedVersion === undefined) {
        throw new Error(
          `${this.storeName}: expectedVersion is required when a version strategy is configured.`
        );
      }

      if (
        !this.#versionStrategy.verify(
          existing,
          expectedVersion
        )
      ) {
        throw new VersionConflictError(
          key,
          expectedVersion,
          this.#versionStrategy.getVersion(existing)
        );
      }

      storedRecord = this.#versionStrategy.update(record);
    }

    await dbRequestAsync(
      store.put(storedRecord)
    );

    this.#onTransactionCompleted(
      store.transaction,
      () =>
      {
        this.emit(
          'update',
          storedRecord,
          existing
        );

        this.#notify(
          'update',
          [storedRecord, existing]
        );

        this.#notifyObserved(
          {
            source: 'local',
            eventType: 'update',
            record: storedRecord,
            previousRecord: existing
          }
        );

        this.#publishBroadcast(
          'update',
          { record: storedRecord, previousRecord: existing }
        );
      }
    );

    if (tx === null) {
      await txDone(ltx);
    }

    return storedRecord;
  }

  async delete(
    key: IDBValidKey,
    expectedVersion?: unknown,
    tx: IDBTransaction | null = null
  ): Promise<void>
  {
    keyAssert(
      this.key,
      key
    );

    const ltx =
      txWrite(
        this.db,
        this.storeName,
        tx);

    const store =
      ltx.objectStore(
        this.storeName);

    const existing =
      await dbRequestAsync(
        store.get(key));

    if (existing === undefined) {
      return;
    }

    if (this.#deleteStrategy === undefined) {
      if (this.#versionStrategy) {
        if (expectedVersion === undefined) {
          throw new Error(
            `${this.storeName}: expectedVersion is required when a version strategy is configured.`
          );
        }

        if (
          !this.#versionStrategy.verify(
            existing,
            expectedVersion
          )
        ) {
          throw new VersionConflictError(
            key,
            expectedVersion,
            this.#versionStrategy.getVersion(existing)
          );
        }
      }

      await dbRequestAsync(
        store.delete(key)
      );

      this.#onTransactionCompleted(
        store.transaction,
        () =>
        {
          this.emit(
            'delete',
            existing
          );

          this.#notify(
            'delete',
            [existing]
          );

          this.#notifyObserved(
            { source: 'local', eventType: 'delete', record: existing }
          );

          this.#publishBroadcast(
            'delete',
            { record: existing }
          );
        }
      );

      if (tx === null) {
        await txDone(ltx);
      }

      return;
    }

    if (this.#deleteStrategy.isDeleted(existing)) {
      return;
    }

    if (this.#versionStrategy) {
      if (expectedVersion === undefined) {
        throw new Error(
          `${this.storeName}: expectedVersion is required when a version strategy is configured.`
        );
      }

      if (
        !this.#versionStrategy.verify(
          existing,
          expectedVersion
        )
      ) {
        throw new VersionConflictError(
          key,
          expectedVersion,
          this.#versionStrategy.getVersion(existing)
        );
      }
    }

    let storedRecord =
      this.#deleteStrategy.delete(existing);

    if (this.#versionStrategy) {
      storedRecord = this.#versionStrategy.update(storedRecord);
    }

    await dbRequestAsync(
      store.put(storedRecord)
    );

    this.#onTransactionCompleted(
      store.transaction,
      () =>
      {
        this.emit(
          'delete',
          storedRecord
        );

        this.#notify(
          'delete',
          [storedRecord]
        );

        this.#notifyObserved(
          { source: 'local', eventType: 'delete', record: storedRecord }
        );

        this.#publishBroadcast(
          'delete',
          { record: storedRecord }
        );
      }
    );

    if (tx === null) {
      await txDone(ltx);
    }
  }

  async clear(
    tx: IDBTransaction | null = null
  ): Promise<void>
  {
    const ltx =
      txWrite(
        this.db,
        this.storeName,
        tx);

    const store =
      ltx.objectStore(
        this.storeName);

    const records =
      await dbRequestAsync(
        store.getAll());

    await dbRequestAsync(
      store.clear()
    );

    this.#onTransactionCompleted(
      store.transaction,
      () =>
      {
        this.emit(
          'clear',
          records
        );

        this.#notify(
          'clear',
          [records]
        );

        this.#notifyObserved(
          { source: 'local', eventType: 'clear', records }
        );

        this.#publishBroadcast(
          'clear',
          { records }
        );
      }
    );

    if (tx === null) {
      await txDone(ltx);
    }
  }

  #activeRecords(
    records: T[]
  ): T[]
  {
    const deleteStrategy =
      this.#deleteStrategy;

    if (deleteStrategy === undefined) {
      return records;
    }

    return records.filter(
      (record) => !deleteStrategy.isDeleted(record)
    );
  }

  async #getActiveByIndex(
    index: string,
    key: IDBValidKey,
    tx: IDBTransaction | null
  ): Promise<T[]>
  {
    let mapped: { index: string; key: IDBValidKey; } | null = null;

    const strategy =
      this.#deleteStrategy;

    if (strategy) {
      const query =
        strategy.mapIndexQuery;

      if (query) {
        mapped = query(
          index,
          key
        );
      }
    }

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
        if (!this.#canFallbackMappedQuery(error)) {
          throw error;
        }
      }
    }

    const records =
      await this.#getByIndex(
        index,
        key,
        tx);

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
      txRead(
        this.db,
        this.storeName,
        tx)
      .objectStore(
        this.storeName
      );

    const idx =
      store.index(index);

    const keyPath =
      idx.keyPath as KeyPath<T>;

    if (validateKey) {
      keyPathAssert(
        keyPath as KeyPath<T>
      );

      keyAssert(
        keyPath,
        key
      );
    }

    return new Promise<T[]>(
      (
        resolve,
        reject
      ) =>
      {
        const request =
          idx.getAll(key);

        request.onsuccess = () =>
        {
          const records: T[] =
            request.result;

          resolve(records);
        };

        request.onerror = () =>
        {
          reject(
            request.error
              ?? new Error(
                `${this.storeName}: get request failed for index ${index}`
              )
          );
        };
      }
    );
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
    if (!(error instanceof DOMException)) {
      return false;
    }

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
      () =>
      {
        try {
          action();
        } catch (error) {
          console.error(
            `${this.storeName}: on complete action failed`,
            error
          );
        }
      },
      { once: true }
    );
  }

  #notify<K extends keyof TableEvents<T>>(
    eventName: K,
    args: TableEvents<T>[K]
  ): void
  {
    if (this.#receivers.length === 0) {
      return;
    }

    for (const receiver of this.#receivers) {
      const handler =
        receiver[eventName];

      if (typeof handler !== 'function') {
        continue;
      }

      const tableEventHandler =
        handler as (
        ...largs: TableEvents<T>[K]
      ) => void;

      try {
        tableEventHandler(
          ...args
        );
      } catch (error) {
        console.error(
          `${this.storeName}: notify handler failed for event ${
            String(eventName)
          }`,
          error
        );
      }
    }
  }

  #notifyObserved(
    event: TableObservedEvent<T>
  ): void
  {
    if (this.#observedReceivers.length === 0) {
      return;
    }

    for (const receiver of this.#observedReceivers) {
      try {
        receiver(event);
      } catch (error) {
        console.error(
          `${this.storeName}: observe handler failed for event ${event.eventType}`,
          error
        );
      }
    }
  }

  #publishBroadcast(
    eventType: TableBroadcastMessage['eventType'],
    payload: unknown
  ): void
  {
    if (this.#broadcastService === undefined) {
      return;
    }

    const message: TableBroadcastMessage =
      {
      messageId: crypto.randomUUID(),
      originId: this.#instanceId,
      storeName: this.storeName,
      eventType,
      payload
    };

    try {
      this.#broadcastService.publish(message);
    } catch (error) {
      console.error(
        `${this.storeName}: broadcast publish failed`,
        error
      );
    }
  }

  /**
   * Handle an incoming broadcast message from another tab.
   *
   * Loop prevention rules:
   *  - Messages with `originId === this.#instanceId` are discarded (own echo).
   *  - Messages for a different `storeName` are discarded.
   *  - Remote messages are forwarded to observed subscribers only; local
   *    subscribers are never called, and the message is never re-published.
   */
  #onBroadcastMessage(
    message: TableBroadcastMessage
  ): void
  {
    // Discard own echoes.
    if (message.originId === this.#instanceId) {
      return;
    }

    // Discard messages for other stores.
    if (message.storeName !== this.storeName) {
      return;
    }

    if (this.#observedReceivers.length === 0) {
      return;
    }

    const payload =
      message.payload as Record<string, unknown>;

    let event: TableObservedEvent<T> | undefined;

    if (message.eventType === 'add') {
      event = {
        source: 'remote',
        eventType: 'add',
        record: payload['record'] as T
      };
    } else if (message.eventType === 'update') {
      event = {
        source: 'remote',
        eventType: 'update',
        record: payload['record'] as T,
        previousRecord: payload['previousRecord'] as T
      };
    } else if (message.eventType === 'delete') {
      event = {
        source: 'remote',
        eventType: 'delete',
        record: payload['record'] as T
      };
    } else if (message.eventType === 'clear') {
      event = {
        source: 'remote',
        eventType: 'clear',
        records: payload['records'] as T[]
      };
    }

    if (event === undefined) {
      return;
    }

    this.#notifyObserved(event);
  }
}
