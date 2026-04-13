import {
    EventfulBase,
  } from 'asljs-eventful';
import {
    observable,
  } from 'asljs-observable';
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
 * Payload emitted on `set:record` and `set` events.
 * These events follow the ASLJS observable property-change convention and
 * are consumed by `observable.watch()` to support deep-path watching
 * (e.g. `r.watch('record.title', cb)`).
 */
export type LiveRecordSetPayload<T extends Record<string, any>> =
  { property: 'record';
    value: T | null;
    previous: T | null; };

/**
 * Event map for `LiveRecord`.
 *
 * Domain events (via ASLJS eventful):
 * - `changed` — the tracked record changed (including appearing from null).
 * - `deleted` — the tracked record was deleted or the table was cleared.
 *
 * Observable property events (via ASLJS observable, used by `watch()`):
 * - `set:record` / `set` — emitted whenever `record` is reassigned.
 */
export type LiveRecordEvents<T extends Record<string, any>> =
  { 'changed': [ record: T, previous: T | null ];
    'deleted': [ previous: T ];
    'set:record': [ LiveRecordSetPayload<T> ];
    'set': [ LiveRecordSetPayload<T> ]; };

/**
 * A live single-record view for a specific primary key.
 *
 * - `record` — the current matching record, or `null` when none exists.
 * - Subscribe to domain events via `on('changed', cb)` / `on('deleted', cb)`
 *   (ASLJS eventful).
 * - Watch property paths via `watch('record.title', cb)`
 *   (ASLJS observable — uses the real `observable.watch` implementation).
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
      subscribeFn:
        (receiver: TableEventsReceiver<T>) => (() => boolean)
    )
  {
    super();

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
          this.#setRecord(record);
        },

        update: record => {
          if (!this.#matchesKey(record))
            return;

          this.#loadVersion++;
          this.#setRecord(record);
        },

        delete: record => {
          if (!this.#matchesKey(record))
            return;

          this.#loadVersion++;
          this.#setRecord(null);
        },

        clear: () => {
          this.#loadVersion++;
          this.#setRecord(null);
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

        this.#setRecord(record);
      })
      .catch(error => {
        console.error(
          'LiveRecord: initial load failed',
          error);
      });
  }

  /**
   * The current record for the tracked key, or `null` when none exists.
   *
   * Changes to this property are signalled via `set:record` / `set` events,
   * enabling `watch('record.someField', cb)` through ASLJS observable.
   */
  get record(): T | null
  {
    return this.#current;
  }

  /**
   * Watch a property path on this live container using ASLJS observable.
   *
   * Example:
   * ```ts
   * const r = table.record(key);
   * r.watch('record.title', title => console.log(title));
   * ```
   *
   * The callback is invoked immediately with the current value and again
   * whenever the path's value changes.  Returns an unwatch function.
   *
   * Watchers are anchored to the stable live container, so replacing the
   * underlying record object does not break existing subscriptions.
   */
  watch(
      property: string,
      callback: (value: any) => void
    ): () => boolean
  {
    return observable.watch(
      this as any,
      property,
      callback);
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
      keyGet(this.#keyPath, record);

    return keyEqual(recordKey, this.#key);
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
    if (this.#current === value)
      return;

    const previous =
      this.#current;

    this.#current = value;

    // Emit ASLJS observable-style property-change events so that
    // observable.watch() path subscriptions work correctly.
    // `as any` is required because EventfulBase<LiveRecordEvents<T>> does not
    // expose `set:*` in its typed event map; these events are consumed by the
    // observable watch system internally and are not part of the public domain
    // event surface.
    const payload: LiveRecordSetPayload<T> =
      { property: 'record',
        value,
        previous };

    (this as any).emit('set:record', payload);
    (this as any).emit('set', payload);

    // Emit ASLJS eventful domain events.
    if (value === null) {
      if (previous !== null)
        this.emit('deleted', previous);
    } else {
      this.emit('changed', value, previous);
    }
  }
}
