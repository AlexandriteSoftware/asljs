import { eventful }
  from 'asljs-eventful';
import assert
  from 'node:assert/strict';
import { EventEmitter }
  from 'node:events';
import test
  from 'node:test';
import { asObservable,
         batch,
         Change,
         isObservable }
  from './contract.js';
import { observable }
  from './observable.js';

const TEST_SUITE = 'contract';

function record(
    source: any
  ): Array<readonly Change[]>
{
  const deliveries: Array<readonly Change[]> = [ ];

  source.on(
    'change',
    (
      changes: readonly Change[]
    ) => deliveries.push(changes));

  return deliveries;
}

/**
 * Both `on` and `off` are required. Testing for `on` alone would admit a value
 * that then fails at teardown, which is the Node `EventEmitter` bug in a new
 * place.
 */
test(
  `${TEST_SUITE}: conformance requires on and off`,
  () =>
  {
    assert.equal(
      isObservable(
        { on: () => { } }),
      false);

    assert.equal(
      isObservable(
        { on: () => { },
          off: () => { } }),
      true);

    assert.equal(
      isObservable(
        observable(
          { a: 1 })),
      true);

    // A Node EventEmitter conforms: the contract does not care what `on`
    // returns.
    assert.equal(
      isObservable(
        new EventEmitter()),
      true);

    assert.equal(
      isObservable(null),
      false);

    assert.equal(
      isObservable(42),
      false);

    assert.equal(
      asObservable(
        { a: 1 }),
      undefined);

    const conforming =
      { on: () => { },
        off: () => { } };

    assert.strictEqual(
      asObservable(conforming),
      conforming);
  });

/**
 * A list only pays off if something fills it, and a batch is what fills it.
 */
test(
  `${TEST_SUITE}: batch groups changes into one notification`,
  () =>
  {
    const model =
      observable(
        { a: 1,
          b: 2 });

    const deliveries =
      record(model);

    batch(
      () =>
      {
        model.a = 10;
        model.b = 20;
      });

    assert.equal(
      deliveries.length,
      1);

    assert.deepEqual(
      deliveries[0],
      [ { kind: 'set',
          property: 'a',
          value: 10,
          previous: 1 },
        { kind: 'set',
          property: 'b',
          value: 20,
          previous: 2 } ]);
  });

/**
 * A batch records every write in the order it was made and merges none, so the
 * list can always be applied in order. Merging is left out deliberately: for an
 * array, an index names a different element once a splice has run.
 */
test(
  `${TEST_SUITE}: repeated writes to one property are each delivered`,
  () =>
  {
    const model =
      observable(
        { a: 1 });

    const deliveries =
      record(model);

    batch(
      () =>
      {
        model.a = 2;
        model.a = 3;
      });

    assert.deepEqual(
      deliveries,
      [ [ { kind: 'set',
            property: 'a',
            value: 2,
            previous: 1 },
          { kind: 'set',
            property: 'a',
            value: 3,
            previous: 2 } ] ]);
  });

/**
 * A write that leaves the value as it was is not a modification, inside a
 * batch as outside, and a batch in which nothing changed reports nothing.
 */
test(
  `${TEST_SUITE}: a write that changes nothing is not delivered`,
  () =>
  {
    const model =
      observable(
        { a: 1 });

    const deliveries =
      record(model);

    batch(
      () =>
      {
        model.a = 1;
      });

    assert.deepEqual(
      deliveries,
      [ ]);

    batch(
      () =>
      {
        model.a = 2;
        model.a = 1;
      });

    // Two real changes that happen to cancel out are both delivered.
    assert.deepEqual(
      deliveries,
      [ [ { kind: 'set',
            property: 'a',
            value: 2,
            previous: 1 },
          { kind: 'set',
            property: 'a',
            value: 1,
            previous: 2 } ] ]);
  });

/**
 * The writes have already landed; discarding their notifications would leave
 * listeners describing a model that no longer exists.
 */
test(
  `${TEST_SUITE}: an exception inside a batch still flushes`,
  () =>
  {
    const model =
      observable(
        { a: 1 });

    const deliveries =
      record(model);

    assert.throws(
      () =>
        batch(
          () =>
          {
            model.a = 2;

            throw new Error('boom');
          }),
      /boom/);

    assert.deepEqual(
      deliveries,
      [ [ { kind: 'set',
            property: 'a',
            value: 2,
            previous: 1 } ] ]);
  });

/** An inner batch joins the outer one; only the outermost close emits. */
test(
  `${TEST_SUITE}: nesting is counted, not stacked`,
  () =>
  {
    const model =
      observable(
        { a: 1,
          b: 2 });

    const deliveries =
      record(model);

    batch(
      () =>
      {
        model.a = 10;

        batch(
          () =>
          {
            model.b = 20;
          });

        assert.equal(
          deliveries.length,
          0);
      });

    assert.equal(
      deliveries.length,
      1);

    assert.equal(
      deliveries[0].length,
      2);
  });

/**
 * "One notification" always means one per source. A batch touching two objects
 * produces one `change` on each, in the order the writes happened.
 */
test(
  `${TEST_SUITE}: batch groups per emitter, not globally`,
  () =>
  {
    const user =
      observable(
        { name: 'Alice' });

    const items =
      observable(
        { count: 0 });

    const seen: string[] = [ ];

    items.on(
      'change',
      () => seen.push('items'));

    user.on(
      'change',
      () => seen.push('user'));

    batch(
      () =>
      {
        user.name = 'Bob';
        items.count = 1;
      });

    assert.deepEqual(
      seen,
      [ 'user',
        'items' ]);
  });

/**
 * A write made by a listener while it is being notified is queued and delivered
 * after the current notification finishes. Without that, every listener
 * registered after the one that writes is told about the effect before the
 * cause, so the behaviour depends on subscription order.
 */
test(
  `${TEST_SUITE}: writes made during delivery are delivered after it`,
  () =>
  {
    const model =
      observable(
        { celsius: 0,
          fahrenheit: 32 });

    model.on(
      'change',
      (
          changes: readonly Change[]
        ) =>
      {
        for (const change of changes) {
          if (
            change.kind === 'set'
            && change.property === 'celsius'
          ) {
            model.fahrenheit =
              (change.value as number) * 9 / 5 + 32;
          }
        }
      });

    const rendered: string[] = [ ];

    model.on(
      'change',
      (
          changes: readonly Change[]
        ) =>
      {
        for (const change of changes) {
          if (change.kind === 'set') {
            rendered.push(
              `${change.property}=${String(change.value)}`);
          }
        }
      });

    model.celsius = 100;

    assert.deepEqual(
      rendered,
      [ 'celsius=100',
        'fahrenheit=212' ]);

    // The write itself lands immediately; only its notification is queued.
    assert.equal(
      model.fahrenheit,
      212);
  });

/**
 * Queueing converts recursion into iteration, which does not by itself stop a
 * cycle, so the round count is capped and the cap throws. A silently abandoned
 * flush would leave the model and every view disagreeing with no indication.
 */
test(
  `${TEST_SUITE}: a delivery that does not settle throws`,
  () =>
  {
    const model =
      observable(
        { a: 0,
          b: 0 });

    model.on(
      'change',
      (
          changes: readonly Change[]
        ) =>
      {
        for (const change of changes) {
          if (
            change.kind === 'set'
            && change.property === 'a'
          ) {
            model.b = model.a + 1;
          }
        }
      });

    model.on(
      'change',
      (
          changes: readonly Change[]
        ) =>
      {
        for (const change of changes) {
          if (
            change.kind === 'set'
            && change.property === 'b'
          ) {
            model.a = model.b + 1;
          }
        }
      });

    assert.throws(
      () =>
      {
        model.a = 1;
      },
      { message:
          /did not settle after 100 rounds\. Properties still changing: [ab]\./ });

    // The state is left usable: a later, settling write still delivers.
    const later =
      observable(
        { n: 1 });

    const deliveries =
      record(later);

    later.n = 2;

    assert.equal(
      deliveries.length,
      1);
  });

/**
 * The common case terminates without the cap, and it is deduplication that
 * makes it do so: the write back is equal to what is already there.
 */
test(
  `${TEST_SUITE}: a two-way binding settles`,
  () =>
  {
    const model =
      observable(
        { left: 0,
          right: 0 });

    let deliveries = 0;

    model.on(
      'change',
      (
          changes: readonly Change[]
        ) =>
      {
        deliveries++;

        for (const change of changes) {
          if (change.kind !== 'set') {
            continue;
          }

          if (change.property === 'left') {
            model.right =
              change.value as number;
          } else {
            model.left =
              change.value as number;
          }
        }
      });

    model.left = 5;

    assert.equal(
      model.right,
      5);

    assert.equal(
      deliveries,
      2);
  });

/** `batch` requires a function, like every other hook in the package. */
test(
  `${TEST_SUITE}: batch rejects a non-function`,
  () =>
  {
    assert.throws(
      () =>
        batch(
          123 as any),
      /Expect a function\./);
  });

/**
 * Emitters deliver in the order they were first changed. A write that left a
 * value as it was, or an array call that changed nothing, takes no place.
 */
test(
  `${TEST_SUITE}: delivery order follows the first real change`,
  () =>
  {
    const a =
      observable(
        { n: 1 });

    const b =
      observable(
        { n: 1 });

    const list =
      observable(
        [ 1 ]);

    const order: string[] = [ ];

    a.on(
      'change',
      () => order.push('a'));

    b.on(
      'change',
      () => order.push('b'));

    list.on(
      'change',
      () => order.push('list'));

    batch(
      () =>
      {
        a.n = 1;
        list.push();
        b.n = 2;
        list.push(2);
        a.n = 2;
      });

    assert.deepEqual(
      order,
      [ 'b',
        'list',
        'a' ]);
  });

/**
 * The exception `fn` throws is the one a caller sees, even when a listener
 * throws while the collected changes are delivered.
 */
test(
  `${TEST_SUITE}: a batch rethrows the exception its function threw`,
  () =>
  {
    const model =
      observable(
        { n: 1 },
        { eventful:
            (value: any) =>
          eventful(
            value,
            { strict: true }) });

    model.on(
      'change',
      () =>
      {
        throw new Error('listener');
      });

    // The listener's error is rethrown from a microtask; capture it instead.
    const deferred: Array<() => void> = [ ];

    const original =
      globalThis.queueMicrotask;

    globalThis.queueMicrotask =
      (
          callback: () => void
        ): void =>
      {
      deferred.push(callback);
    };

    try {
      assert.throws(
        () =>
          batch(
            () =>
            {
              model.n = 2;

              throw new Error('fn');
            }),
        /^Error: fn$/);
    } finally {
      globalThis.queueMicrotask = original;
    }

    assert.equal(
      deferred.length,
      1);

    assert.throws(
      deferred[0],
      /^Error: listener$/);
  });
