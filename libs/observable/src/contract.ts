import { functionTypeGuard,
         isFunction,
         isObject }
  from './guards.js';

/**
 * A single change to an object's **own** properties.
 *
 * A participant knows its own properties; it does not know its position in
 * someone else's graph, so a change never carries a path. Paths are composed
 * by the query, which subscribes segment by segment.
 *
 * - `set` covers every value change, including removal, which is reported as a
 *   set to `undefined`. Array indices are ordinary string properties, so an
 *   index change is `{ kind: 'set', property: '0', ... }`.
 * - `splice` is optional. Only a producer that intercepts the mutating array
 *   methods is in a position to know a splice cheaply; a participant that only
 *   ever emits `set` entries conforms fully.
 * - `reset` says that an array changed so much that it is better read again,
 *   and carries nothing else.
 *
 * A consumer that meets a kind it does not understand treats it as "something
 * changed, re-read", which is what keeps the contract open to further kinds.
 */
export type Change =
  | {
    kind: 'set';
    property: string;
    value: unknown;
    previous: unknown;
  }
  | {
    kind: 'splice';
    index: number;
    removed: readonly unknown[];
    added: readonly unknown[];
  }
  | {
    kind: 'reset';
  };

export type ChangeListener =
  (
    changes: readonly Change[]
  ) =>
    unknown;

/**
 * What an object must provide to be observed.
 *
 * Deliberately loose: no base class, no marker, no dependency on
 * `asljs-eventful`. A Node `EventEmitter` satisfies the shape and participates
 * as soon as it emits `change`.
 *
 * - `on(event, listener)` subscribes. The return value is unspecified, so an
 *   emitter that returns `this` conforms. A function it returns is used as a
 *   disposer when one is offered.
 * - `off(event, listener)` unsubscribes, and is the canonical teardown path.
 * - The payload is always a list, even for a single change.
 *
 * Timing is not part of the contract. A participant may emit whenever it suits
 * it, including asynchronously or after debouncing, and it still conforms: the
 * query re-reads on notification, so a late notification produces a late but
 * correct read. A consumer must not assume that listeners have run by the time
 * a mutating call returns.
 */
export interface Observable
{
  on(
    event: 'change',
    listener: ChangeListener
  ): unknown;

  off(
    event: 'change',
    listener: ChangeListener
  ): unknown;
}

/**
 * Whether a value conforms to the contract.
 *
 * Both `on` and `off` are required. Testing for `on` alone would admit a value
 * that then fails at teardown, which is the Node `EventEmitter` bug in a new
 * place: its `on` returns `this`, so a disposer-only teardown throws.
 */
export function isObservable(
    value: unknown
  ): value is Observable
{
  if (
    !isObject(value)
    && !isFunction(value)
  ) {
    return false;
  }

  const candidate =
    value as { on?: unknown; off?: unknown; };

  return isFunction(candidate.on)
    && isFunction(candidate.off);
}

export function asObservable(
    value: unknown
  ): Observable | undefined
{
  if (isObservable(value)) {
    return value;
  }

  return undefined;
}

/**
 * The producer side of the contract, as this package's own producers use it.
 *
 * Kept separate from `Observable`: a participant has to be subscribable to be
 * observed, and only a producer has to be able to emit.
 */
export interface ChangeEmitter
{
  emit(
    event: 'change',
    changes: readonly Change[]
  ): unknown;
}

/**
 * Present in every runtime this package targets, browsers and Node alike, but
 * declared here because the published build compiles without a platform
 * library.
 */
declare const queueMicrotask: (
  callback: () => void
) => void;

/**
 * How many rounds of listener-provoked writes are delivered before the
 * delivery is declared not to settle.
 *
 * Queueing converts recursion into iteration, which does not by itself stop a
 * cycle: two listeners writing to each other would loop forever in rounds
 * instead of overflowing the stack, with no stack trace to show what happened.
 */
const MAX_DELIVERY_ROUNDS = 100;

type Collector = {
  entries: Change[];
  suppress: number;
};

type Delivery = {
  source: ChangeEmitter;
  changes: readonly Change[];
};

let batchDepth = 0;

/**
 * Changes collected during the open batch, one collector per emitter.
 *
 * A `Map` rather than per-object state, because the flush order is the order
 * the emitters were first written to, and because the whole point of a batch
 * is that it spans emitters.
 */
const collectors = new Map<ChangeEmitter, Collector>();

let deliveryDepth = 0;

let deliveryId = 0;

const queued: Delivery[] = [ ];

const afterDelivery: Array<() => void> = [ ];

const traces =
  new WeakMap<object, (changes: readonly Change[]) => void>();

function ensureCollector(
    source: ChangeEmitter
  ): Collector
{
  let collector =
    collectors.get(source);

  if (!collector) {
    collector =
      { entries: [ ],
        suppress: 0 };

    collectors.set(
      source,
      collector);
  }

  return collector;
}

/** Whether a change leaves the value it describes as it was. */
function isUnchanged(
    change: Change
  ): boolean
{
  return change.kind === 'set'
    && Object.is(
      change.value,
      change.previous);
}

/**
 * Adds one change to the open batch.
 *
 * Every change is kept, in the order it was made, and none is merged with
 * another: the list can then always be applied in order. Merging repeated
 * writes to one property is wrong for an array, where an index names a
 * different element once a splice has run in between.
 */
function collect(
    source: ChangeEmitter,
    change: Change
  ): void
{
  // Checked before the collector is created, so an emitter whose writes all
  // left its values as they were takes no place in the delivery order.
  if (isUnchanged(change)) {
    return;
  }

  const collector =
    ensureCollector(source);

  if (collector.suppress > 0) {
    return;
  }

  collector.entries.push(change);
}

/**
 * Closes the batch: one notification per emitter, in the order the emitters
 * were first written to.
 */
function flushCollected(
  ): void
{
  if (collectors.size === 0) {
    return;
  }

  const pending =
    [ ...collectors ];

  collectors.clear();

  const round: Delivery[] = [ ];

  for (const [source, collector] of pending) {
    if (collector.entries.length === 0) {
      continue;
    }

    round.push(
      { source,
        changes: collector.entries });
  }

  deliver(round);
}

function dispatch(
    source: ChangeEmitter,
    changes: readonly Change[]
  ): void
{
  deliveryId++;

  try {
    traces.get(
      source as object)?.(changes);

    source.emit(
      'change',
      changes);
  } finally {
    // Whatever asked to run at the end of this delivery runs here, even if a
    // listener threw, so a deferred recompute is never skipped.
    while (afterDelivery.length > 0) {
      const run =
        afterDelivery.shift()!;

      run();
    }
  }
}

function describeRunaway(
    pending: readonly Delivery[]
  ): string
{
  const properties = new Set<string>();

  for (const { changes } of pending) {
    for (const change of changes) {
      properties.add(
        change.kind === 'set'
          ? change.property
          : `(${change.kind})`);
    }
  }

  return `Change delivery did not settle after ${MAX_DELIVERY_ROUNDS} rounds. `
    + `Properties still changing: ${[ ...properties ].join(', ')}. `
    + 'The writes have already landed and were not delivered, so the model '
    + 'and anything built from it now disagree.';
}

/**
 * Delivers a round of notifications, then the writes the listeners made.
 *
 * A write made by a listener while it is being notified is queued and
 * delivered after the current notification finishes, as its own `change`. It
 * does not join the list being delivered, which is what makes the entries
 * every subscriber receives consistent and ordered regardless of subscription
 * order. The write itself lands immediately; only its notification is queued.
 */
function deliver(
    round: readonly Delivery[]
  ): void
{
  if (round.length === 0) {
    return;
  }

  if (deliveryDepth > 0) {
    queued.push(...round);

    return;
  }

  deliveryDepth++;

  try {
    for (const { source, changes } of round) {
      dispatch(
        source,
        changes);
    }

    let rounds = 0;

    while (queued.length > 0) {
      rounds++;

      if (rounds > MAX_DELIVERY_ROUNDS) {
        throw new Error(
          describeRunaway(queued));
      }

      const next =
        queued.splice(
          0,
          queued.length);

      for (const { source, changes } of next) {
        dispatch(
          source,
          changes);
      }
    }
  } finally {
    deliveryDepth--;

    queued.length = 0;
  }
}

/**
 * Reports one change from a producer.
 *
 * Inside a batch the change joins the collected list; outside one it is
 * delivered immediately as a one-element list. A change whose value equals its
 * previous value is not a change and is dropped here, so the same `Object.is`
 * rule holds from the source to the terminal.
 */
export function reportChange(
    source: ChangeEmitter,
    change: Change
  ): void
{
  if (batchDepth > 0) {
    collect(
      source,
      change);

    return;
  }

  if (isUnchanged(change)) {
    return;
  }

  deliver(
    [ { source,
        changes:
          [ change ] } ]);
}

/**
 * Groups everything that changes during `fn` into one notification per
 * emitter.
 *
 * - Nesting is counted, not stacked: an inner batch joins the outer one and
 *   only the outermost close emits.
 * - An exception inside `fn` still flushes what was collected, because the
 *   writes have already landed. The exception propagates after the flush.
 * - Grouping is per emitter, not global. "One notification" always means one
 *   per source.
 * - Every change is delivered, in the order it was made: two writes to one
 *   property are two entries.
 *
 * A hand-written participant cannot be made to join a batch -- it emits when
 * it emits -- so a mixed model gets batching only across the parts this
 * package's producers own.
 */
export function batch<T>(
    fn: () => T
  ): T
{
  functionTypeGuard(fn);

  batchDepth++;

  let failed = false;

  try {
    return fn();
  } catch (error) {
    failed = true;

    throw error;
  } finally {
    batchDepth--;

    if (batchDepth === 0) {
      if (failed) {
        // `fn`'s exception is the one rethrown. One a listener throws while
        // the collected changes are delivered is not discarded either: it is
        // rethrown from a microtask, where it reaches the platform's
        // unhandled-error channel.
        try {
          flushCollected();
        } catch (flushError) {
          queueMicrotask(
            () =>
            {
              throw flushError;
            });
        }
      } else {
        flushCollected();
      }
    }
  }
}

/**
 * Runs a mutating array method as one change.
 *
 * The method is called through on the proxy, so each element write trips the
 * `set` trap and is converted on the way in. Those per-index entries are the
 * fan-out the list exists to remove, and reporting them alongside the splice
 * would break the rule that a producer emits the most specific description it
 * has and never both, so they are suppressed while the splice is collected.
 *
 * `describe` is called with the result of the call, which is what carries the
 * removed elements for `pop`, `shift` and `splice`. Returning `null` reports
 * nothing, which is what an operation that changed nothing does.
 */
export function withSplice<T>(
    source: ChangeEmitter,
    call: () => T,
    describe: (result: T) => Change | null
  ): T
{
  batchDepth++;

  const existed =
    collectors.has(source);

  const collector =
    ensureCollector(source);

  collector.suppress++;

  try {
    let result: T;

    try {
      result =
        call();
    } finally {
      collector.suppress--;
    }

    const entry =
      describe(result);

    if (entry) {
      collect(
        source,
        entry);
    }

    // A call that changed nothing takes no place in the delivery order.
    if (
      !existed
      && collector.entries.length === 0
    ) {
      collectors.delete(source);
    }

    return result;
  } finally {
    batchDepth--;

    if (batchDepth === 0) {
      flushCollected();
    }
  }
}

/** Whether a notification is currently being delivered. */
export function inDelivery(
  ): boolean
{
  return deliveryDepth > 0;
}

/**
 * Identifies the notification currently being delivered.
 *
 * Delivery is synchronous, so a counter incremented once per notification is
 * enough for a consumer to act once per delivery rather than once per input
 * that reaches it. It works precisely because nothing else can be running.
 */
export function currentDelivery(
  ): number
{
  return deliveryId;
}

/**
 * Runs `fn` once the notification being delivered has reached every listener.
 *
 * Outside a delivery there is nothing to wait for, so `fn` runs at once.
 */
export function afterCurrentDelivery(
    fn: () => void
  ): void
{
  if (deliveryDepth === 0) {
    fn();

    return;
  }

  afterDelivery.push(fn);
}

/**
 * Registers the hook that reports a delivery to a producer's trace.
 *
 * Tracing belongs to the producer, not to the contract, but the entry list
 * only exists at delivery time, so the hook is held here and called just
 * before the emit.
 */
export function setChangeTrace(
    source: ChangeEmitter,
    trace: (changes: readonly Change[]) => void
  ): void
{
  traces.set(
    source as object,
    trace);
}
