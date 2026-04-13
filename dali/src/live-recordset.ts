import {
    EventfulBase,
  } from 'asljs-eventful';
import {
    observable,
  } from 'asljs-observable';
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
 * Payload emitted on `set:records` and `set` events.
 * These events follow the ASLJS observable property-change convention and
 * are consumed by `observable.watch()` to support path watching
 * (e.g. `rs.watch('records.length', cb)`).
 */
export type LiveRecordSetSetPayload<T extends Record<string, any>> =
  { property: 'records';
    value: readonly T[];
    previous: readonly T[]; };

/**
 * Event map for `LiveRecordSet`.
 *
 * Domain events (via ASLJS eventful):
 * - `added`   — a record entered the set.
 * - `removed` — a record left the set.
 * - `updated` — a record already in the set was replaced with a new version.
 * - `cleared` — the set was emptied due to a table clear.
 * - `changed` — catch-all emitted after any mutation of `records`.
 *
 * Observable property events (via ASLJS observable, used by `watch()`):
 * - `set:records` / `set` — emitted whenever `records` changes.
 */
export type LiveRecordSetEvents<T extends Record<string, any>> =
  { 'added': [ record: T ];
    'removed': [ record: T ];
    'updated': [ record: T, previous: T ];
    'cleared': [];
    'changed': [ records: readonly T[] ];
    'set:records': [ LiveRecordSetSetPayload<T> ];
    'set': [ LiveRecordSetSetPayload<T> ]; };

/**
 * A live filtered set view for one table, driven by a client-side predicate.
 *
 * - `records` — the current array of matching records.
 * - Subscribe to domain events via `on('added', cb)`, `on('removed', cb)`,
 *   `on('updated', cb)`, `on('cleared', cb)`, `on('changed', cb)`
 *   (ASLJS eventful).
 * - Watch property paths via `watch('records.length', cb)`
 *   (ASLJS observable — uses the real `observable.watch` implementation).
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
export class LiveRecordSet<T extends Record<string, any>>
  extends EventfulBase<LiveRecordSetEvents<T>>
{
  readonly #keyPath: KeyPath<T>;
  readonly #predicate: (record: T) => boolean;
  #current: Map<string, T> = new Map();
  #lastSnapshot: readonly T[] = [];
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
    super();

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

          this.#applyAndNotify({ type: 'add', record });
        },

        update: (record, _previousRecord) => {
          if (!this.#loaded) {
            this.#pendingEvents.push(
              { type: 'update',
                record });
            return;
          }

          this.#applyAndNotify({ type: 'update', record });
        },

        delete: record => {
          if (!this.#loaded) {
            this.#pendingEvents.push(
              { type: 'delete',
                record });
            return;
          }

          this.#applyAndNotify({ type: 'delete', record });
        },

        clear: () => {
          if (!this.#loaded) {
            this.#pendingEvents.push(
              { type: 'clear' });
            return;
          }

          this.#applyAndNotify({ type: 'clear' });
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
        // We do not emit individual domain events for replayed events —
        // a single `changed` is emitted via #emitRecordsChanged() after all
        // replays settle.
        for (const event of this.#pendingEvents) {
          this.#applyEvent(event);
        }

        this.#pendingEvents = [];
        this.#loaded = true;

        this.#emitRecordsChanged();
      })
      .catch(error => {
        console.error(
          'LiveRecordSet: initial scan failed',
          error);
      });
  }

  /**
   * The current set of matching records as a readonly array snapshot.
   *
   * Changes to this property are signalled via `set:records` / `set` events,
   * enabling `watch('records.length', cb)` through ASLJS observable.
   */
  get records(): readonly T[]
  {
    return [ ...this.#current.values() ];
  }

  /**
   * Watch a property path on this live container using ASLJS observable.
   *
   * Example:
   * ```ts
   * const rs = table.recordset(r => r.active);
   * rs.watch('records.length', count => console.log(count));
   * ```
   *
   * The callback is invoked immediately with the current value and again
   * whenever the path's value changes.  Returns an unwatch function.
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
   * After disposal the live recordset no longer tracks changes.
   */
  dispose(): void
  {
    this.#disposed = true;
    this.#unsubscribe();
  }

  #keyString(
      record: T
    ): string
  {
    return JSON.stringify(
      keyGet(this.#keyPath, record));
  }

  /**
   * Applies a single event, then emits the appropriate domain events and
   * the `set:records` / `changed` notifications if the set changed.
   */
  #applyAndNotify(
      event: PendingEvent<T>
    ): void
  {
    const result =
      this.#applyEvent(event);

    if (!result.changed)
      return;

    this.#emitDomainEvent(result);
    this.#emitRecordsChanged();
  }

  /** Applies a single pending event to `#current`. Returns change metadata. */
  #applyEvent(
      event: PendingEvent<T>
    ): ApplyResult<T>
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
    ): ApplyResult<T>
  {
    if (!this.#predicate(record))
      return { changed: false };

    const key =
      this.#keyString(record);

    this.#current.set(key, record);
    return { changed: true,
             domainEvent: 'added',
             record };
  }

  #handleUpdate(
      record: T
    ): ApplyResult<T>
  {
    // Membership of the previous version is determined by checking whether
    // the key is already present in #current, rather than using the
    // previousRecord payload, so no second parameter is needed here.
    const key =
      this.#keyString(record);

    const previous =
      this.#current.get(key);

    const wasPresent =
      previous !== undefined;

    const matches =
      this.#predicate(record);

    if (!wasPresent && !matches)
      return { changed: false };

    if (matches) {
      this.#current.set(key, record);

      return wasPresent
        ? { changed: true,
            domainEvent: 'updated',
            record,
            previous }
        : { changed: true,
            domainEvent: 'added',
            record };
    }

    this.#current.delete(key);
    return { changed: true,
             domainEvent: 'removed',
             record: previous! };
  }

  #handleDelete(
      record: T
    ): ApplyResult<T>
  {
    const key =
      this.#keyString(record);

    const existing =
      this.#current.get(key);

    if (existing === undefined)
      return { changed: false };

    this.#current.delete(key);
    return { changed: true,
             domainEvent: 'removed',
             record: existing };
  }

  #handleClear(): ApplyResult<T>
  {
    if (this.#current.size === 0)
      return { changed: false };

    this.#current.clear();
    return { changed: true,
             domainEvent: 'cleared' };
  }

  #emitDomainEvent(
      result: ApplyResult<T> & { changed: true }
    ): void
  {
    if (result.domainEvent === 'added')
      this.emit('added', result.record);
    else if (result.domainEvent === 'removed')
      this.emit('removed', result.record);
    else if (result.domainEvent === 'updated')
      this.emit('updated', result.record, result.previous);
    else
      this.emit('cleared');
  }

  #emitRecordsChanged(): void
  {
    const previous =
      this.#lastSnapshot;

    const snapshot =
      this.records;

    this.#lastSnapshot =
      snapshot;

    // Emit ASLJS observable-style property-change event so that
    // observable.watch() path subscriptions work correctly.
    // `as any` is required because EventfulBase<LiveRecordSetEvents<T>> does
    // not expose `set:*` in its typed event map; these events are consumed by
    // the observable watch system internally and are not part of the public
    // domain event surface.
    const payload: LiveRecordSetSetPayload<T> =
      { property: 'records',
        value: snapshot,
        previous };

    (this as any).emit('set:records', payload);
    (this as any).emit('set', payload);

    // Emit the catch-all domain event.
    this.emit('changed', snapshot);
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type ApplyResult<T> =
  | { changed: false }
  | { changed: true; domainEvent: 'added';   record: T }
  | { changed: true; domainEvent: 'removed'; record: T }
  | { changed: true; domainEvent: 'updated'; record: T; previous: T }
  | { changed: true; domainEvent: 'cleared' };
