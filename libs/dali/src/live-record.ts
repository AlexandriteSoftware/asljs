import { EventfulBase }
  from 'asljs-eventful';
import { Change }
  from 'asljs-observable';
import { keyAssert,
         keyEqual,
         keyGet,
         KeyPath }
  from './keys.js';
import { TableEventsReceiver }
  from './table.js';

/**
 * Event map for `LiveRecord`.
 *
 * Domain events (via ASLJS eventful):
 * - `changed` — the tracked record changed (including appearing from null).
 * - `deleted` — the tracked record was deleted or the table was cleared.
 *
 * Observable contract event (ASLJS observable):
 * - `change` — one `set` entry for `record` whenever it is reassigned.
 */
export type LiveRecordEvents<T extends Record<string, any>> = {
  changed: [record: T, previous: T | null];
  deleted: [previous: T];
  change: [changes: readonly Change[]];
};

/**
 * A live single-record view for a specific primary key.
 *
 * - `record` — the current matching record, or `null` when none exists.
 * - Subscribe to domain events via `on('changed', cb)` / `on('deleted', cb)`
 *   (ASLJS eventful).
 * - Query property paths via `observe(live).at('record.title')`
 *   (ASLJS observable) — the container conforms to the observable contract.
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
export class LiveRecord<T extends Record<string, any>>
  extends EventfulBase<LiveRecordEvents<T>>
{
  readonly #key: IDBValidKey;
  readonly #keyPath: KeyPath<T>;
  #current: T | null = null;
  readonly #unsubscribe: () => boolean;
  #loadVersion = 0;
  #disposed = false;

  constructor(
    key: IDBValidKey,
    keyPath: KeyPath<T>,
    loadFn: (key: IDBValidKey) => Promise<T | null>,
    subscribeFn: (receiver: TableEventsReceiver<T>) => () => boolean
  )
  {
    super();

    keyAssert(
      keyPath,
      key);

    this.#key = key;
    this.#keyPath = keyPath;

    // Subscribe to committed table changes first to avoid missing events
    // that occur between construction and the initial load completing.
    this.#unsubscribe =
      subscribeFn(
        { add:
            (
                record
              ) =>
            {
          if (!this.#matchesKey(record)) {
            return;
          }

          this.#loadVersion++;
          this.#setRecord(record);
        },
          update:
            (
                record
              ) =>
            {
          if (!this.#matchesKey(record)) {
            return;
          }

          this.#loadVersion++;
          this.#setRecord(record);
        },
          delete:
            (
                record
              ) =>
            {
          if (!this.#matchesKey(record)) {
            return;
          }

          this.#loadVersion++;
          this.#setRecord(null);
        },
          clear:
            () =>
            {
          this.#loadVersion++;
          this.#setRecord(null);
        } });

    // Load initial state asynchronously.
    // If a relevant committed event fires before this load settles,
    // the event handler increments #loadVersion and the stale load
    // result is discarded below.
    const capturedVersion = this.#loadVersion;

    loadFn(
      this.#key)
      .then(
        (
            record
          ) =>
        {
          if (this.#disposed) {
            return;
          }

          if (this.#loadVersion !== capturedVersion) {
            return;
          }

          this.#setRecord(record);
        })
      .catch(
        (
            error
          ) =>
        {
          console.error(
            'LiveRecord: initial load failed',
            error);
        });
  }

  /**
   * The current record for the tracked key, or `null` when none exists.
   *
   * Changes to this property are reported as a `change` event, so
   * `observe(live).at('record.someField')` from ASLJS observable follows it.
   */
  get record(): T | null {
    return this.#current;
  }

  /**
   * Unsubscribe from table notifications and release all listeners.
   * After disposal the live record no longer tracks changes.
   */
  dispose(): void
  {
    this.#disposed = true;
    this.#unsubscribe();
  }

  #matchesKey(
    record: T
  ): boolean
  {
    const recordKey =
      keyGet(
        this.#keyPath,
        record);

    return keyEqual(
      recordKey,
      this.#key);
  }

  #setRecord(
    value: T | null
  ): void
  {
    // Reference equality is correct here: every committed table change
    // delivers a freshly deserialised object from IndexedDB, so two
    // distinct records will never share the same reference.  The only
    // case where the references are equal is null === null, which
    // correctly suppresses a redundant notification.
    if (this.#current === value) {
      return;
    }

    const previous = this.#current;

    this.#current = value;

    this.emit(
      'change',
      [ { kind: 'set',
          property: 'record',
          value,
          previous } ]);

    // Emit ASLJS eventful domain events.
    if (value === null) {
      if (previous !== null) {
        this.emit(
          'deleted',
          previous);
      }
    } else {
      this.emit(
        'changed',
        value,
        previous);
    }
  }
}
