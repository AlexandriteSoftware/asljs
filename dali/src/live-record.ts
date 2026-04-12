import {
    type KeyPath,
    keyAssert,
    keyEqual,
    keyGet,
  } from './keys.js';
import {
    type TableEventsReceiver,
  } from './table.js';

/**
 * A live single-record view for a specific primary key.
 *
 * - `current()` returns the matching record, or `null` if no record exists
 *   for that key.
 * - Subscribe to changes via `subscribe(listener)`.
 * - Call `dispose()` to stop receiving updates and release resources.
 *
 * Obtain via `Table.record(key)` — this API is **live by default**.
 * For snapshot reads, use the imperative `getOne`, `get`, or `scan` methods
 * on `Table` instead.
 *
 * The live record tracks only **committed** changes; it does not react to
 * provisional changes before a transaction completes.
 *
 * Note: `record(key)` is limited to key-only semantics.
 */
export class LiveRecord<T extends Record<string, any>> {
  readonly #key: IDBValidKey;
  readonly #keyPath: KeyPath<T>;
  #current: T | null = null;
  readonly #subscribers: Array<(value: T | null) => void> = [];
  readonly #unsubscribe: () => boolean;
  #loadVersion = 0;
  #disposed = false;

  constructor(
      key: IDBValidKey,
      keyPath: KeyPath<T>,
      loadFn: (key: IDBValidKey) => Promise<T | null>,
      subscribeFn:
        (receiver: TableEventsReceiver<T>) => (() => boolean)
    )
  {
    keyAssert(keyPath, key);

    this.#key = key;
    this.#keyPath = keyPath;

    // Subscribe to committed table changes first to avoid missing events
    // that occur between construction and the initial load completing.
    this.#unsubscribe =
      subscribeFn({
        add: record => {
          if (!this.#matchesKey(record))
            return;

          this.#loadVersion++;
          this.#setCurrent(record);
        },

        update: record => {
          if (!this.#matchesKey(record))
            return;

          this.#loadVersion++;
          this.#setCurrent(record);
        },

        delete: record => {
          if (!this.#matchesKey(record))
            return;

          this.#loadVersion++;
          this.#setCurrent(null);
        },

        clear: () => {
          this.#loadVersion++;
          this.#setCurrent(null);
        },
      });

    // Load initial state asynchronously.
    // If a relevant committed event fires before this load settles,
    // the event handler increments #loadVersion and the stale load
    // result is discarded below.
    const capturedVersion =
      this.#loadVersion;

    loadFn(this.#key)
      .then(record => {
        if (this.#disposed)
          return;

        if (this.#loadVersion !== capturedVersion)
          return;

        this.#setCurrent(record);
      })
      .catch(error => {
        console.error(
          'LiveRecord: initial load failed',
          error);
      });
  }

  /** Returns the current record, or `null` if no record exists for the key. */
  current(): T | null
  {
    return this.#current;
  }

  /**
   * Subscribe to changes.
   * Returns an unsubscribe function — calling it removes the listener.
   */
  subscribe(
      listener: (value: T | null) => void
    ): () => void
  {
    this.#subscribers.push(listener);

    return () => {
      const index =
        this.#subscribers.indexOf(listener);

      if (index >= 0)
        this.#subscribers.splice(index, 1);
    };
  }

  /**
   * Unsubscribe from table notifications and release all listeners.
   * After disposal the live record no longer tracks changes.
   */
  dispose(): void
  {
    this.#disposed = true;
    this.#unsubscribe();
    this.#subscribers.length = 0;
  }

  #matchesKey(
      record: T
    ): boolean
  {
    const recordKey =
      keyGet(this.#keyPath, record);

    return keyEqual(recordKey, this.#key);
  }

  #setCurrent(
      value: T | null
    ): void
  {
    // Reference equality is correct here: every committed table change
    // delivers a freshly deserialised object from IndexedDB, so two
    // distinct records will never share the same reference.  The only
    // case where the references are equal is null === null, which
    // correctly suppresses a redundant notification.
    if (this.#current === value)
      return;

    this.#current = value;

    for (const listener of this.#subscribers) {
      try {
        listener(value);
      } catch (error) {
        console.error(
          'LiveRecord: subscriber threw',
          error);
      }
    }
  }
}
