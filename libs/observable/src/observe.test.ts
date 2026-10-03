import { eventful }
  from 'asljs-eventful';
import assert
  from 'node:assert/strict';
import { EventEmitter }
  from 'node:events';
import test
  from 'node:test';
import { batch,
         Change,
         ChangeListener,
         Observable }
  from './contract.js';
import { ObservableObject }
  from './observable-object.js';
import { observable }
  from './observable.js';
import { combine,
         observe }
  from './observe.js';

const TEST_SUITE = 'observe';

/**
 * A participant written by hand, with neither `observable()` nor
 * `asljs-eventful`. The contract is one event and two methods.
 */
function makeCounter(
  ): Observable & {
  readonly count: number;
  increment: () => void;
}
{
  let count = 0;

  const listeners = new Set<ChangeListener>();

  return { get count(): number {
      return count;
    },
           increment(): void
    {
      const previous = count;

      count++;

      const changes: readonly Change[] =
        [ { kind: 'set',
            property: 'count',
            value: count,
            previous } ];

      for (const listener of [ ...listeners ]) {
        listener(changes);
      }
    },
           on(
      _event: 'change',
      listener: ChangeListener
    ): unknown
    {
      listeners.add(listener);

      return undefined;
    },
           off(
      _event: 'change',
      listener: ChangeListener
    ): unknown
    {
      return listeners.delete(listener);
    } };
}

/**
 * Forgetting `observable()` used to be silence: one callback with a snapshot and
 * a disposer that disposed nothing. It is a message now.
 */
test(
  `${TEST_SUITE}: observe refuses a source that does not conform`,
  () =>
  {
    assert.throws(
      () =>
        observe(
          { user:
              { name: 'Alice' } } as any),
      { name: 'TypeError',
        message:
          /Wrap the value with observable\(\) first\./ });

    // `on` alone is not enough: teardown needs `off`.
    assert.throws(
      () =>
        observe(
          { on: () => { } } as any),
      TypeError);
  });

/** A terminal reports the current value before any change arrives. */
test(
  `${TEST_SUITE}: subscribe reports the current value and then changes`,
  () =>
  {
    const model =
      observable(
        { a: 1,
          b: 2 });

    const seen: unknown[] = [ ];

    observe(model)
      .at('a')
      .subscribe(
        value => seen.push(value));

    model.b = 20;
    model.a = 10;

    assert.deepEqual(
      seen,
      [ 1,
        10 ]);
  });

/** Descent resubscribes at each segment, which is what `map` cannot do. */
test(
  `${TEST_SUITE}: at descends a nested path and rebinds`,
  () =>
  {
    const model =
      observable(
        { user:
            { name: 'Alice' } },
        { deep: true });

    const seen: unknown[] = [ ];

    observe(model)
      .at('user.name')
      .subscribe(
        value => seen.push(value));

    model.user.name = 'Bob';

    model.user =
      observable(
        { name: 'Carol' });

    model.user.name = 'Dan';

    assert.deepEqual(
      seen,
      [ 'Alice',
        'Bob',
        'Carol',
        'Dan' ]);
  });

/** An ancestor that does not exist yet is bound as soon as it appears. */
test(
  `${TEST_SUITE}: at binds through an ancestor created later`,
  () =>
  {
    const model =
      observable(
        { user:
            undefined as undefined | { name: string; } });

    const seen: unknown[] = [ ];

    observe(model)
      .at('user.name')
      .subscribe(
        value => seen.push(value));

    model.user =
      observable(
        { name: 'Alice' }) as any;

    (model.user as any).name = 'Bob';

    assert.deepEqual(
      seen,
      [ undefined,
        'Alice',
        'Bob' ]);
  });

/**
 * One `subscribe` builds one subscription tree and returns the one disposer
 * that owns it.
 */
test(
  `${TEST_SUITE}: the disposer tears the subscription down and is idempotent`,
  () =>
  {
    const model =
      observable(
        { user:
            { name: 'Alice' } },
        { deep: true });

    const seen: unknown[] = [ ];

    const unsubscribe =
      observe(model)
      .at('user.name')
      .subscribe(
        value => seen.push(value));

    model.user.name = 'Bob';

    assert.equal(
      unsubscribe(),
      true);

    model.user.name = 'Carol';

    assert.equal(
      unsubscribe(),
      false);

    assert.deepEqual(
      seen,
      [ 'Alice',
        'Bob' ]);

    assert.equal(
      (model as any).getListeners().size,
      0);

    assert.equal(
      (model.user as any).getListeners().size,
      0);
  });

/** A chain is a description: building one attaches nothing. */
test(
  `${TEST_SUITE}: a chain is immutable and subscribes nothing until executed`,
  () =>
  {
    const model =
      observable(
        { n: 2 });

    const base =
      observe(model).at('n');

    const doubled =
      base.map(
        value => value * 2);

    assert.notStrictEqual(
      base,
      doubled);

    assert.equal(
      (model as any).getListeners().size,
      0);

    assert.equal(
      base.value,
      2);

    assert.equal(
      doubled.value,
      4);

    assert.equal(
      (model as any).getListeners().size,
      0);
  });

/** A malformed path is rejected when the chain is built, not when it runs. */
test(
  `${TEST_SUITE}: at rejects empty and malformed paths`,
  () =>
  {
    const model =
      observable(
        { user:
            { name: 'Alice' } });

    for (
      const path of [ '',
                      '   ',
                      '.user.name',
                      'user.name.',
                      'user..name',
                      'user. .name' ]
    ) {
      assert.throws(
        () =>
          observe(model).at(
            path as any),
        TypeError);
    }
  });

/**
 * The more a chain projects away, the more often an upstream change is
 * invisible downstream. Without deduplication the subscriber would run for a
 * change it cannot see.
 */
test(
  `${TEST_SUITE}: an operator stays silent when its result is unchanged`,
  () =>
  {
    const model =
      observable(
        { user:
            { role: 'admin',
              name: 'Alice' } });

    const seen: unknown[] = [ ];

    observe(model)
      .at('user')
      .map(
        user => user.role)
      .subscribe(
        role => seen.push(role));

    model.user =
      observable(
        { role: 'admin',
          name: 'Bob' });

    assert.deepEqual(
      seen,
      [ 'admin' ]);

    model.user =
      observable(
        { role: 'editor',
          name: 'Cass' });

    assert.deepEqual(
      seen,
      [ 'admin',
        'editor' ]);
  });

/**
 * A projection that rebuilds a value is never deduplicated by `Object.is`, and
 * `distinct` is the way out. Keeping it separate is why `map` needs no
 * comparison argument.
 */
test(
  `${TEST_SUITE}: distinct replaces the comparison for one step`,
  () =>
  {
    const model =
      observable(
        { user:
            { name: 'Alice' } });

    const projected =
      observe(model)
      .at('user')
      .map(
        user => ({ name: user.name }));

    const withoutDistinct: unknown[] = [ ];

    const stopPlain =
      projected.subscribe(
        value => withoutDistinct.push(value));

    const withDistinct: unknown[] = [ ];

    const stopDistinct =
      projected
      .distinct(
        (a, b) => a.name === b.name)
      .subscribe(
        value => withDistinct.push(value));

    model.user =
      observable(
        { name: 'Alice' });

    stopPlain();
    stopDistinct();

    assert.equal(
      withoutDistinct.length,
      2);

    assert.equal(
      withDistinct.length,
      1);
  });

/**
 * A chain whose current value the filter rejects starts silent, and `.value` on
 * it is `undefined`.
 */
test(
  `${TEST_SUITE}: filter can reject the current value`,
  () =>
  {
    const model =
      observable(
        { n: 1 });

    const large =
      observe(model)
      .at('n')
      .filter(
        value => value > 5);

    const seen: unknown[] = [ ];

    large.subscribe(
      value => seen.push(value));

    assert.deepEqual(
      seen,
      [ ]);

    assert.equal(
      large.value,
      undefined);

    model.n = 10;

    assert.deepEqual(
      seen,
      [ 10 ]);

    assert.equal(
      large.value,
      10);
  });

/**
 * Two inputs reading from one source are both notified by one `change`, so the
 * recompute has to wait for the end of that delivery. Otherwise a subscriber
 * sees the intermediate tuple before the settled one.
 */
test(
  `${TEST_SUITE}: combine recomputes once per delivery`,
  () =>
  {
    const model =
      observable(
        { a: 1,
          b: 2 });

    const pair =
      combine(
        [ observe(model).at('a'),
          observe(model).at('b') ]);

    const seen: unknown[] = [ ];

    pair.subscribe(
      value => seen.push(value));

    batch(
      () =>
      {
        model.a = 10;
        model.b = 20;
      });

    assert.deepEqual(
      seen,
      [ [ 1,
          2 ],
        [ 10,
          20 ] ]);

    assert.deepEqual(
      pair.value,
      [ 10,
        20 ]);
  });

/**
 * The delivery counter is module-level, so two independent combines notified in
 * one delivery must both recompute rather than one shadowing the other.
 */
test(
  `${TEST_SUITE}: two combines in one delivery both recompute`,
  () =>
  {
    const model =
      observable(
        { a: 1,
          b: 2 });

    const left: unknown[] = [ ];
    const right: unknown[] = [ ];

    combine(
      [ observe(model).at('a'),
        observe(model).at('b') ])
      .subscribe(
        value => left.push(value));

    combine(
      [ observe(model).at('b'),
        observe(model).at('a') ])
      .subscribe(
        value => right.push(value));

    batch(
      () =>
      {
        model.a = 10;
        model.b = 20;
      });

    assert.deepEqual(
      left,
      [ [ 1,
          2 ],
        [ 10,
          20 ] ]);

    assert.deepEqual(
      right,
      [ [ 2,
          1 ],
        [ 20,
          10 ] ]);
  });

/** Outside a batch each write is its own delivery, so each is reported. */
test(
  `${TEST_SUITE}: combine reports every delivery it is notified in`,
  () =>
  {
    const model =
      observable(
        { a: 1,
          b: 2,
          c: 3 });

    const seen: unknown[] = [ ];

    const unsubscribe =
      combine(
        [ observe(model).at('a'),
          observe(model).at('b') ])
      .subscribe(
        value => seen.push(value));

    model.a = 10;
    model.c = 30;
    model.b = 20;

    assert.deepEqual(
      seen,
      [ [ 1,
          2 ],
        [ 10,
          2 ],
        [ 10,
          20 ] ]);

    assert.equal(
      unsubscribe(),
      true);

    model.a = 100;

    assert.equal(
      seen.length,
      3);
  });

/**
 * A splice carries no `property`, so the rule that it counts as a change to
 * every index from `splice.index` onwards and to `length` is part of the
 * contract rather than of one consumer.
 */
test(
  `${TEST_SUITE}: a splice counts as a change to the indices and to length`,
  () =>
  {
    const items =
      observable(
        [ 'a',
          'b',
          'c' ]);

    const atOne: unknown[] = [ ];
    const lengths: unknown[] = [ ];

    observe(items)
      .at('1')
      .subscribe(
        value => atOne.push(value));

    observe(items)
      .at('length')
      .subscribe(
        value => lengths.push(value));

    items.shift();

    assert.deepEqual(
      atOne,
      [ 'b',
        'c' ]);

    assert.deepEqual(
      lengths,
      [ 3,
        2 ]);
  });

/** Arrays are queried like anything else: an index is an ordinary property. */
test(
  `${TEST_SUITE}: a path descends into an array`,
  () =>
  {
    const model =
      observable(
        { items:
            [ { name: 'a' } ] },
        { deep: true });

    const seen: unknown[] = [ ];

    observe(model)
      .at('items.0.name')
      .subscribe(
        value => seen.push(value));

    model.items[0].name = 'b';

    assert.deepEqual(
      seen,
      [ 'a',
        'b' ]);
  });

/**
 * A consumer that meets an entry kind it does not understand treats it as
 * "something changed, re-read", which keeps the contract open to further kinds.
 */
test(
  `${TEST_SUITE}: an unrecognised entry kind means re-read`,
  () =>
  {
    const source: any =
      eventful(
        { n: 1 });

    const seen: unknown[] = [ ];

    observe(source)
      .at('n')
      .subscribe(
        value => seen.push(value));

    source.n = 2;

    source.emit(
      'change',
      [ { kind: 'permute' } as any ]);

    assert.deepEqual(
      seen,
      [ 1,
        2 ]);

    // Deduplication absorbs a re-read the chain does not care about: the
    // notification above found the value already current.
    source.n = 3;

    source.emit(
      'change',
      [ { kind: 'permute' } as any ]);

    assert.deepEqual(
      seen,
      [ 1,
        2,
        3 ]);
  });

/**
 * The contract is loose on purpose: a Node `EventEmitter` participates as soon
 * as it emits `change`, and teardown goes through `off` because its `on`
 * returns `this` rather than a disposer.
 */
test(
  `${TEST_SUITE}: a Node EventEmitter conforms`,
  () =>
  {
    class Model extends EventEmitter
    {
      #name = 'Alice';

      get name(): string {
        return this.#name;
      }

      set name(value: string) {
        const previous = this.#name;

        this.#name = value;

        this.emit(
          'change',
          [ { kind: 'set',
              property: 'name',
              value,
              previous } ]);
      }
    }

    const model =
      new Model();

    const seen: unknown[] = [ ];

    const unsubscribe =
      observe(
        model as unknown as Model & Observable)
      .at('name')
      .subscribe(
        value => seen.push(value));

    model.name = 'Bob';

    assert.deepEqual(
      seen,
      [ 'Alice',
        'Bob' ]);

    unsubscribe();

    assert.equal(
      model.listenerCount('change'),
      0);

    model.name = 'Carol';

    assert.equal(
      seen.length,
      2);
  });

/** The same, for a participant that depends on nothing at all. */
test(
  `${TEST_SUITE}: a hand-written participant conforms`,
  () =>
  {
    const counter =
      makeCounter();

    const seen: unknown[] = [ ];

    const unsubscribe =
      observe(counter)
      .at('count')
      .subscribe(
        value => seen.push(value));

    counter.increment();
    counter.increment();

    unsubscribe();

    counter.increment();

    assert.deepEqual(
      seen,
      [ 0,
        1,
        2 ]);
  });

/**
 * A wrapper the `convert` hook returns joins a path like any other conforming
 * value, which is what makes a custom kind usable from the rest of the API.
 */
test(
  `${TEST_SUITE}: a converted wrapper participates along a path`,
  () =>
  {
    const observableSet =
      (
          source: Set<unknown>
        ): any =>
      {
      const wrapper: any =
        eventful(
          { get size(): number {
            return source.size;
          },
            add(
            value: unknown
          ): void
          {
            if (source.has(value)) {
              return;
            }

            const previous = source.size;

            source.add(value);

            wrapper.emit(
              'change',
              [ { kind: 'set',
                  property: 'size',
                  value: source.size,
                  previous } ]);
          } });

      return wrapper;
    };

    const model =
      observable(
        { tags:
            new Set(
              [ 'a' ]) },
        { deep: true,
          convert:
            value =>
          value instanceof Set
            ? observableSet(value)
            : undefined });

    const seen: unknown[] = [ ];

    observe(
      model as any)
      .at('tags.size')
      .subscribe(
        (
          size: unknown
        ) => seen.push(size));

    (model.tags as any).add('b');

    assert.deepEqual(
      seen,
      [ 1,
        2 ]);
  });

/**
 * Intermediates stay permissive rather than checked, because single-level
 * conversion, the default, produces partial observation on purpose: the root is
 * heard, and what it holds is not.
 */
test(
  `${TEST_SUITE}: a single-level model is observed only where it conforms`,
  () =>
  {
    const model =
      observable(
        { user:
            { name: 'Alice' } });

    const seen: unknown[] = [ ];

    observe(model)
      .at('user.name')
      .subscribe(
        value => seen.push(value));

    // Nothing along the path below the root conforms, so a leaf edit is not
    // reported.
    model.user.name = 'Bob';

    // Replacing the segment the root owns is.
    model.user =
      { name: 'Carol' };

    assert.deepEqual(
      seen,
      [ 'Alice',
        'Carol' ]);
  });

/** Writes through any handle on a shared target reach every query on it. */
test(
  `${TEST_SUITE}: a shared reference is one source`,
  () =>
  {
    const shared =
      { n: 1 };

    const model =
      observable(
        { a: shared,
          b: shared },
        { deep: true });

    const seen: unknown[] = [ ];

    observe(model)
      .at('a.n')
      .subscribe(
        value => seen.push(value));

    model.b.n = 9;

    assert.deepEqual(
      seen,
      [ 1,
        9 ]);
  });

/** `ObservableObject` is a source like any other. */
test(
  `${TEST_SUITE}: an ObservableObject is queried through observe`,
  () =>
  {
    class Person extends ObservableObject<{ name: string; }>
    {
      #name = '';

      get name(): string {
        return this.#name;
      }

      set name(value: string) {
        this.setAndEmit(
          'name',
          this.#name,
          value,
          next => this.#name = next);
      }
    }

    const person =
      new Person();

    const seen: unknown[] = [ ];

    const unsubscribe =
      observe(person)
      .at('name')
      .subscribe(
        value => seen.push(value));

    person.name = 'Alice';
    person.name = 'Alice';
    person.name = 'Bob';

    assert.equal(
      unsubscribe(),
      true);

    person.name = 'Cass';

    assert.deepEqual(
      seen,
      [ '',
        'Alice',
        'Bob' ]);
  });

/** `combine` takes queries, and says so when it is given something else. */
test(
  `${TEST_SUITE}: combine rejects anything that is not a query`,
  () =>
  {
    assert.throws(
      () =>
        combine(
          123 as any),
      /Expect an array of queries\./);

    assert.throws(
      () =>
        combine(
          [ { at: () => { } } as any ]),
      /Expect an array of queries built by observe\(\.\.\.\)\./);
  });
