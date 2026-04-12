import {
    type KeyPath,
    keyGet,
  } from './keys.js';
import {
    type TableEventsReceiver,
  } from './table.js';

type PendingEvent<T> =
  | { type: 'add'; record: T }
  | { type: 'update'; record: T }
  | { type: 'delete'; record: T }
  | { type: 'clear' };

/**
 * A live filtered set view for one table, driven by a client-side predicate.
 *
 * - `current()` returns the current array of matching records as a snapshot.
 * - Subscribe to changes via `subscribe(listener)`.
 * - Call `dispose()` to stop receiving updates and release resources.
 *
 * Obtain via `Table.recordset(predicate)` — this API is **live by default**.
 * For snapshot reads, use the imperative `scan` or `getAll` methods on
 * `Table` instead.
 *
 * The live recordset tracks only **committed** changes; it does not react to
 * provisional changes before a transaction completes.
 *
 * Membership is re-evaluated on each committed change:
 * - `add` — included if the predicate returns `true`.
 * - `update` — membership is re-evaluated; the record is added, updated, or
 *   removed from the set accordingly.
 * - `delete` — removed from the set if present.
 * - `clear` — the set is emptied.
 *
 * Note: `recordset(predicate)` is limited to predicate-only semantics.
 * Joins, ordering, and DB-level query composition are out of scope.
 */
export class LiveRecordSet<T extends Record<string, any>> {
  readonly #keyPath: KeyPath<T>;
  readonly #predicate: (record: T) => boolean;
  #current: Map<string, T> = new Map();
  readonly #subscribers: Array<(value: readonly T[]) => void> = [];
  readonly #unsubscribe: () => boolean;
  #pendingEvents: Array<PendingEvent<T>> = [];
  #loaded = false;
  #disposed = false;

  constructor(
      keyPath: KeyPath<T>,
      predicate: (record: T) => boolean,
      scanFn:
        (predicate: (record: T) => boolean) => Promise<T[]>,
      subscribeFn:
        (receiver: TableEventsReceiver<T>) => (() => boolean)
    )
  {
    this.#keyPath = keyPath;
    this.#predicate = predicate;

    // Subscribe to committed table changes first to avoid missing events
    // that occur between construction and the initial scan completing.
    // Events that arrive while loading are buffered and applied afterwards.
    this.#unsubscribe =
      subscribeFn({
        add: record => {
          if (!this.#loaded) {
            this.#pendingEvents.push(
              { type: 'add',
                record });
            return;
          }

          if (this.#applyEvent({ type: 'add', record }))
            this.#notifySubscribers();
        },

        update: (record, _previousRecord) => {
          if (!this.#loaded) {
            this.#pendingEvents.push(
              { type: 'update',
                record });
            return;
          }

          if (this.#applyEvent({ type: 'update', record }))
            this.#notifySubscribers();
        },

        delete: record => {
          if (!this.#loaded) {
            this.#pendingEvents.push(
              { type: 'delete',
                record });
            return;
          }

          if (this.#applyEvent({ type: 'delete', record }))
            this.#notifySubscribers();
        },

        clear: () => {
          if (!this.#loaded) {
            this.#pendingEvents.push(
              { type: 'clear' });
            return;
          }

          if (this.#applyEvent({ type: 'clear' }))
            this.#notifySubscribers();
        },
      });

    // Initial scan: load all matching records, then replay buffered events.
    scanFn(this.#predicate)
      .then(records => {
        if (this.#disposed)
          return;

        this.#current =
          new Map(
            records.map(record =>
              [ this.#keyString(record),
                record ]));

        // Replay events that arrived while the scan was in flight.
        for (const event of this.#pendingEvents) {
          this.#applyEvent(event);
        }

        this.#pendingEvents = [];
        this.#loaded = true;

        this.#notifySubscribers();
      })
      .catch(error => {
        console.error(
          'LiveRecordSet: initial scan failed',
          error);
      });
  }

  /**
   * Returns a snapshot of the current matching records.
   * The returned array is a copy; mutations do not affect the live set.
   */
  current(): readonly T[]
  {
    return [ ...this.#current.values() ];
  }

  /**
   * Subscribe to changes.
   * Returns an unsubscribe function — calling it removes the listener.
   */
  subscribe(
      listener: (value: readonly T[]) => void
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
   * After disposal the live recordset no longer tracks changes.
   */
  dispose(): void
  {
    this.#disposed = true;
    this.#unsubscribe();
    this.#subscribers.length = 0;
  }

  #keyString(
      record: T
    ): string
  {
    return JSON.stringify(
      keyGet(this.#keyPath, record));
  }

  /** Applies a single pending event to `#current`. Returns `true` if the set changed. */
  #applyEvent(
      event: PendingEvent<T>
    ): boolean
  {
    if (event.type === 'add')
      return this.#handleAdd(event.record);

    if (event.type === 'update')
      return this.#handleUpdate(event.record);

    if (event.type === 'delete')
      return this.#handleDelete(event.record);

    return this.#handleClear();
  }

  #handleAdd(
      record: T
    ): boolean
  {
    if (!this.#predicate(record))
      return false;

    const key =
      this.#keyString(record);

    this.#current.set(key, record);
    return true;
  }

  #handleUpdate(
      record: T
    ): boolean
  {
    // Membership of the previous version is determined by checking whether
    // the key is already present in #current, rather than using the
    // previousRecord payload, so no second parameter is needed here.
    const key =
      this.#keyString(record);

    const wasPresent =
      this.#current.has(key);

    const matches =
      this.#predicate(record);

    if (!wasPresent && !matches)
      return false;

    if (matches)
      this.#current.set(key, record);
    else
      this.#current.delete(key);

    return true;
  }

  #handleDelete(
      record: T
    ): boolean
  {
    const key =
      this.#keyString(record);

    if (!this.#current.has(key))
      return false;

    this.#current.delete(key);
    return true;
  }

  #handleClear(): boolean
  {
    if (this.#current.size === 0)
      return false;

    this.#current.clear();
    return true;
  }

  #notifySubscribers(): void
  {
    const snapshot =
      this.current();

    for (const listener of this.#subscribers) {
      try {
        listener(snapshot);
      } catch (error) {
        console.error(
          'LiveRecordSet: subscriber threw',
          error);
      }
    }
  }
}
