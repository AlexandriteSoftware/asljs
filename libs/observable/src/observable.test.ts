import { eventful }
  from 'asljs-eventful';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import vm
  from 'node:vm';
import { batch,
         Change }
  from './contract.js';
import { observable }
  from './observable.js';
import { createTracer }
  from './testing/tracer.js';

const TEST_SUITE = 'observable';

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

function flat(
    deliveries: Array<readonly Change[]>
  ): Change[]
{
  return deliveries.flatMap(
    changes => [ ...changes ]);
}

/**
 * With `deep: true`, nested object fields are observable so listeners can
 * subscribe without manual wrapping.
 */
test(
  `${TEST_SUITE}: deep:true observes nested objects`,
  async () =>
  {
    const object =
      { a:
          { b: 1 } };

    const proxy =
      observable(
        object,
        { deep: true });

    const deliveries =
      record(proxy.a);

    proxy.a.b = 2;

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: 'b',
          value: 2,
          previous: 1 } ]);
  });

/**
 * Values introduced through defineProperty must follow the same deep
 * conversion rules as normal assignment paths.
 */
test(
  `${TEST_SUITE}: defineProperty converts nested value in deep mode`,
  async () =>
  {
    const proxy =
      observable(
        {} as { x?: { y: number; }; },
        { deep: true });

    Object.defineProperty(
      proxy,
      'x',
      { value:
          { y: 1 },
        writable: true,
        configurable: true,
        enumerable: true });

    const deliveries =
      record(proxy.x);

    (proxy.x as any).y = 2;

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: 'y',
          value: 2,
          previous: 1 } ]);
  });

/**
 * Conversion is single-level by default, so child objects stay raw unless the
 * caller asks for recursion.
 */
test(
  `${TEST_SUITE}: keeps nested objects non-observable by default`,
  async () =>
  {
    const object =
      { a:
          { b: 1 } };

    const proxy =
      observable(object);

    assert.equal(
      typeof (proxy.a as any).on,
      'undefined');
  });

/**
 * With `deep: true`, nested entries inside arrays are observable so
 * item-level edits notify listeners.
 */
test(
  `${TEST_SUITE}: deep:true observes nested objects inside arrays`,
  async () =>
  {
    const object =
      { items:
          [ { name: 'A' } ] };

    const proxy =
      observable(
        object,
        { deep: true });

    const deliveries =
      record(proxy.items[0]);

    proxy.items[0].name = 'B';

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: 'name',
          value: 'B',
          previous: 'A' } ]);
  });

/**
 * By default, array items stay plain objects so nested wrapping is not applied
 * automatically.
 */
test(
  `${TEST_SUITE}: keeps nested objects inside arrays non-observable by default`,
  async () =>
  {
    const object =
      { items:
          [ { name: 'A' } ] };

    const proxy =
      observable(object);

    assert.equal(
      typeof (proxy.items[0] as any).on,
      'undefined');
  });

/**
 * One event, one payload shape. A plain assignment trips both the `set` and the
 * `defineProperty` trap, and the re-entrancy guard is what stops it being
 * reported twice.
 */
test(
  `${TEST_SUITE}: an object assignment is one change`,
  async () =>
  {
    const tracer =
      createTracer();

    const object =
      { a: 1 };

    const proxy =
      observable(
        object,
        { eventful:
            (value: any) =>
          eventful(
            value,
            tracer) });

    proxy.a = 2;

    assert.deepEqual(
      tracer.getMinimalTraces(),
      [ { action: 'new',
          payload:
            { object } },
        { action: 'emit',
          payload:
            { object,
              event: 'change',
              args:
                [ [ { kind: 'set',
                      property: 'a',
                      value: 2,
                      previous: 1 } ] ] } } ]);
  });

/**
 * Removal is a set to `undefined`. There is no delete event, so a consumer
 * cannot tell a removed key from one present and undefined.
 */
test(
  `${TEST_SUITE}: removing a property is a set to undefined`,
  async () =>
  {
    const proxy =
      observable(
        { a: 1 } as { a?: number; });

    const deliveries =
      record(proxy);

    delete proxy.a;

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: 'a',
          value: undefined,
          previous: 1 } ]);

    // Removing a key that was already undefined is not a change.
    (proxy as any).b = undefined;

    delete (proxy as any).b;

    assert.equal(
      flat(deliveries).length,
      1);
  });

/**
 * A definition is reported by whether the observed value changed, not by what
 * the descriptor says. Descriptor observation is not part of the contract.
 */
test(
  `${TEST_SUITE}: a definition is reported as a value change or not at all`,
  async () =>
  {
    const proxy: any =
      observable(
        { a: 1,
          b: 2,
          c: 3 });

    const deliveries =
      record(proxy);

    // The value changes.
    Object.defineProperty(
      proxy,
      'a',
      { value: 9,
        writable: true,
        enumerable: true,
        configurable: true });

    // Installing a getter changes the observed value from 2 to what it yields,
    // so it is reported -- and the getter runs to report it.
    let reads = 0;

    Object.defineProperty(
      proxy,
      'b',
      { get()
        {
          reads++;

          return 20;
        },
        configurable: true });

    // Redefining with the same value changes nothing.
    Object.defineProperty(
      proxy,
      'c',
      { value: 3,
        writable: true,
        enumerable: true,
        configurable: true });

    // A flag on its own changes nothing observable.
    Object.defineProperty(
      proxy,
      'c',
      { enumerable: false });

    // A setter with no getter leaves the read at undefined, so it is silent
    // only where the property was already undefined.
    Object.defineProperty(
      proxy,
      'd',
      { set(
          _value: unknown
        )
        {},
        configurable: true });

    // Converting the accessor back to a data property changes the observed
    // value again.
    Object.defineProperty(
      proxy,
      'b',
      { value: 21,
        writable: true,
        enumerable: true,
        configurable: true });

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: 'a',
          value: 9,
          previous: 1 },
        { kind: 'set',
          property: 'b',
          value: 20,
          previous: 2 },
        { kind: 'set',
          property: 'b',
          value: 21,
          previous: 20 } ]);

    assert.ok(reads > 0);
  });

/**
 * An array index is an ordinary string property, so there is no numeric `index`
 * field on a `set` and no separate array change type.
 */
test(
  `${TEST_SUITE}: array index and property writes are set entries`,
  async () =>
  {
    const arr: any =
      observable(
        [ 1,
          2 ]);

    const deliveries =
      record(arr);

    arr['0'] = 10;
    arr[1] = 20;
    arr.test1 = 30;
    arr['01'] = 99;

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: '0',
          value: 10,
          previous: 1 },
        { kind: 'set',
          property: '1',
          value: 20,
          previous: 2 },
        { kind: 'set',
          property: 'test1',
          value: 30,
          previous: undefined },
        { kind: 'set',
          property: '01',
          value: 99,
          previous: undefined } ]);
  });

/**
 * Deleting an index is a set to undefined, and it does not change length.
 */
test(
  `${TEST_SUITE}: deleting an array index is a set to undefined`,
  async () =>
  {
    const arr =
      observable(
        [ 10,
          20 ]);

    const deliveries =
      record(arr);

    delete arr[1];

    assert.equal(
      arr.length,
      2);

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: '1',
          value: undefined,
          previous: 20 } ]);
  });

/**
 * Clearing an array is the common idiom and a raw assignment, so it reports one
 * splice rather than the fan-out the list exists to remove.
 */
test(
  `${TEST_SUITE}: truncating an array through length is a splice`,
  async () =>
  {
    const arr =
      observable(
        [ 'a',
          'b',
          'c' ]);

    const deliveries =
      record(arr);

    arr.length = 1;

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'splice',
          index: 1,
          removed:
            [ 'b',
              'c' ],
          added: [ ] } ]);

    assert.deepEqual(
      [ ...arr ],
      [ 'a' ]);
  });

/**
 * A length assignment that removes nothing stays silent, and growing an array
 * reports the length itself.
 */
test(
  `${TEST_SUITE}: growing or keeping array length reports no splice`,
  async () =>
  {
    const arr =
      observable(
        [ 1 ]);

    const deliveries =
      record(arr);

    arr.length = 1;

    assert.deepEqual(
      flat(deliveries),
      [ ]);

    arr.length = 4;

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: 'length',
          value: 4,
          previous: 1 } ]);
  });

/**
 * Five methods produce a splice, because for those the arguments are the
 * description. Each runs in one batch, so `shift()` is one notification
 * carrying one entry rather than four notifications.
 */
test(
  `${TEST_SUITE}: the splicing array methods report one splice each`,
  async () =>
  {
    const cases: Array<[string, (arr: any) => void, Change]> =
      [ [ 'push',
          arr => arr.push('d'),
          { kind: 'splice',
            index: 3,
            removed: [ ],
            added:
              [ 'd' ] } ],
        [ 'pop',
          arr => arr.pop(),
          { kind: 'splice',
            index: 2,
            removed:
              [ 'c' ],
            added: [ ] } ],
        [ 'shift',
          arr => arr.shift(),
          { kind: 'splice',
            index: 0,
            removed:
              [ 'a' ],
            added: [ ] } ],
        [ 'unshift',
          arr => arr.unshift('z'),
          { kind: 'splice',
            index: 0,
            removed: [ ],
            added:
              [ 'z' ] } ],
        [ 'splice remove',
          arr =>
      arr.splice(
        1,
        1),
          { kind: 'splice',
            index: 1,
            removed:
              [ 'b' ],
            added: [ ] } ],
        [ 'splice insert',
          arr =>
        arr.splice(
          1,
          0,
          'z'),
          { kind: 'splice',
            index: 1,
            removed: [ ],
            added:
              [ 'z' ] } ],
        [ 'splice replace',
          arr =>
      arr.splice(
        1,
        1,
        'y',
        'z'),
          { kind: 'splice',
            index: 1,
            removed:
              [ 'b' ],
            added:
              [ 'y',
                'z' ] } ],
        [ 'splice from the end',
          arr =>
        arr.splice(
          -1,
          5),
          { kind: 'splice',
            index: 2,
            removed:
              [ 'c' ],
            added: [ ] } ],
        [ 'splice past the end',
          arr =>
      arr.splice(
        9,
        1,
        'z'),
          { kind: 'splice',
            index: 3,
            removed: [ ],
            added:
              [ 'z' ] } ] ];

    for (const [name, mutate, expected] of cases) {
      const arr: any =
        observable(
          [ 'a',
            'b',
            'c' ]);

      const deliveries =
        record(arr);

      mutate(arr);

      assert.equal(
        deliveries.length,
        1,
        `${name} should be one notification`);

      assert.deepEqual(
        flat(deliveries),
        [ expected ],
        name);
    }
  });

/** An operation that changes nothing reports nothing. */
test(
  `${TEST_SUITE}: a splicing method that changes nothing is silent`,
  async () =>
  {
    const arr: any =
      observable(
        [ ] as string[]);

    const deliveries =
      record(arr);

    arr.pop();
    arr.shift();
    arr.push();
    arr.unshift();

    arr.splice(
      0,
      0);

    assert.deepEqual(
      flat(deliveries),
      [ ]);
  });

/** Pushed values are converted, because the call goes through the proxy. */
test(
  `${TEST_SUITE}: a pushed object is converted and reported as added`,
  async () =>
  {
    const arr: any =
      observable(
        [ ] as Array<{ n: number; }>,
        { deep: true });

    const deliveries =
      record(arr);

    arr.push(
      { n: 1 });

    assert.equal(
      typeof arr[0].on,
      'function');

    const entry =
      flat(deliveries)[0] as Extract<Change, { kind: 'splice'; }>;

    // `added` holds what a read returns, meaning the converted values.
    assert.strictEqual(
      entry.added[0],
      arr[0]);
  });

/**
 * `sort` and `reverse` are permutations and `fill` is a range overwrite: the
 * producer does not have a splice for them, so it reports the `set` entries it
 * does have, batched into one notification.
 */
test(
  `${TEST_SUITE}: permutations and range writes report batched set entries`,
  async () =>
  {
    const arr =
      observable(
        [ 'a',
          'b',
          'c',
          'd',
          'e' ]);

    const deliveries =
      record(arr);

    arr.reverse();

    assert.equal(
      deliveries.length,
      1);

    // The middle element did not move, so it is absent: the entry list is what
    // changed, never the affected range.
    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: '0',
          value: 'e',
          previous: 'a' },
        { kind: 'set',
          property: '4',
          value: 'a',
          previous: 'e' },
        { kind: 'set',
          property: '1',
          value: 'd',
          previous: 'b' },
        { kind: 'set',
          property: '3',
          value: 'b',
          previous: 'd' } ]);

    const filled =
      observable(
        [ 1,
          2,
          3 ]);

    const fills =
      record(filled);

    filled.fill(
      0,
      1);

    assert.equal(
      fills.length,
      1);

    assert.deepEqual(
      flat(fills),
      [ { kind: 'set',
          property: '1',
          value: 0,
          previous: 2 },
        { kind: 'set',
          property: '2',
          value: 0,
          previous: 3 } ]);
  });

/**
 * A method invoked so that it bypasses the `get` trap produces `set` entries.
 * That is consistent with the contract, since `splice` is optional.
 */
test(
  `${TEST_SUITE}: a borrowed array method reports set entries`,
  async () =>
  {
    const arr =
      observable(
        [ 'a' ]);

    const deliveries =
      record(arr);

    Array.prototype
      .push
      .call(
        arr,
        'b');

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: '1',
          value: 'b',
          previous: undefined } ]);
  });

/** An own override of a mutating method is left alone. */
test(
  `${TEST_SUITE}: an own array method override is not wrapped`,
  async () =>
  {
    const source: any =
      [ 'a' ];

    const calls: unknown[] = [ ];

    source.push =
      (
          ...items: unknown[]
        ): number =>
      {
      calls.push(items);

      return 0;
    };

    const arr: any =
      observable(source);

    const deliveries =
      record(arr);

    arr.push('b');

    assert.deepEqual(
      calls,
      [ [ 'b' ] ]);

    assert.deepEqual(
      flat(deliveries),
      [ ]);
  });

/**
 * Starting without an initial value should still allow later assignment and
 * emit the same boxed contract.
 */
test(
  `${TEST_SUITE}: observable <empty>`,
  async () =>
  {
    const boxed =
      observable<number | undefined>(undefined);

    const deliveries =
      record(boxed);

    boxed.value = 43;

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: 'value',
          value: 43,
          previous: undefined } ]);
  });

/**
 * Telemetry gauge S5.1: a primitive reading wrapped as observable should emit
 * value transitions through the same event pipeline as object state.
 */
test(
  `${TEST_SUITE}: observable number`,
  async () =>
  {
    const boxed =
      observable(42);

    const deliveries =
      record(boxed);

    boxed.value = 43;

    // An equal write is not a change.
    boxed.value = 43;

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: 'value',
          value: 43,
          previous: 42 } ]);
  });

/**
 * Misconfigured eventful factories must fail fast so startup issues are
 * explicit instead of silently degrading events.
 */
test(
  `${TEST_SUITE}: throws when eventful option is not a function`,
  async () =>
  {
    assert.throws(
      () =>
        observable(
          { a: 1 },
          { eventful:
              123 as any }),
      /Expect a function\./);
  });

/**
 * `strict` and the `error` hook are reachable through the same seam, because
 * `ObservableOptions.eventful` takes the factory itself.
 */
test(
  `${TEST_SUITE}: the eventful factory carries eventful's own options`,
  async () =>
  {
    const model =
      observable(
        { a: 1 },
        { eventful:
            (value: any) =>
          eventful(
            value,
            { strict: true }) });

    model.on(
      'change',
      () =>
      {
        throw new Error('from a listener');
      });

    // With strict, a throwing listener propagates out of an ordinary
    // assignment.
    assert.throws(
      () =>
      {
        model.a = 2;
      },
      /from a listener/);
  });

/**
 * Wrapping an already-eventful object should preserve existing wiring and
 * avoid double augmentation.
 */
test(
  `${TEST_SUITE}: observable reuses pre-eventful object`,
  async () =>
  {
    const source =
      eventful(
        { name: 'Alice' });

    const observed =
      observable(
        source,
        { eventful:
            () =>
            {
          throw new Error('should not extend');
        } });

    const deliveries =
      record(observed);

    observed.name = 'Bob';

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: 'name',
          value: 'Bob',
          previous: 'Alice' } ]);
  });

/**
 * The trace hook reports `new` and one `change` per delivery, with the entry
 * list of that delivery.
 */
test(
  `${TEST_SUITE}: per-instance trace hook captures new and change actions`,
  async () =>
  {
    const actions: string[] = [ ];
    const payloads: any[] = [ ];

    const model =
      observable(
        { a: 1,
          b: 2 },
        { trace:
            (
                _source: unknown,
                action: string,
                payload: unknown
              ) =>
            {
          actions.push(action);
          payloads.push(payload);
        } });

    batch(
      () =>
      {
        model.a = 2;
        model.b = 3;
      });

    assert.deepEqual(
      actions,
      [ 'new',
        'change' ]);

    assert.deepEqual(
      payloads[payloads.length - 1],
      [ { kind: 'set',
          property: 'a',
          value: 2,
          previous: 1 },
        { kind: 'set',
          property: 'b',
          value: 3,
          previous: 2 } ]);
  });

/**
 * A global trace hook should capture lifecycle events when a local trace is
 * not supplied on the call.
 */
test(
  `${TEST_SUITE}: global trace option is used when local trace is absent`,
  async () =>
  {
    const actions: string[] = [ ];

    const previousTrace =
      observable.options.trace;

    observable.options.trace =
      (
          _source: unknown,
          action: string
        ) =>
      {
      actions.push(action);
    };

    try {
      const model =
        observable(
          { a: 1 });

      model.a = 2;
    } finally {
      observable.options.trace = previousTrace;
    }

    assert.deepEqual(
      actions,
      [ 'new',
        'change' ]);
  });

/**
 * Primitives, `null`, `undefined` and functions are explicit leaves, or
 * ordinary JSON data and models with methods would be refused.
 */
test(
  `${TEST_SUITE}: leaf kinds are stored as they are`,
  async () =>
  {
    const method = (): number => 1;

    const model: any =
      observable(
        { text: 'a',
          count: 1,
          flag: true,
          nothing: null,
          missing: undefined,
          method,
          big: 1n,
          tag:
            Symbol('tag') });

    assert.strictEqual(
      model.method,
      method);

    assert.strictEqual(
      model.nothing,
      null);

    assert.strictEqual(
      model.missing,
      undefined);

    const deliveries =
      record(model);

    model.count = 2;

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: 'count',
          value: 2,
          previous: 1 } ]);
  });

/**
 * A nested value observable cannot make observable is refused, with the path at
 * which it was found. Storing it silently would leave the model half observable
 * with no indication.
 */
test(
  `${TEST_SUITE}: an unsupported nested value is refused with its path`,
  async () =>
  {
    class Instance
    {}

    assert.throws(
      () =>
        observable(
          { orders:
              [ { meta: new Map() } ] },
          { deep: true }),
      { name: 'TypeError',
        message:
          'at value.orders[0].meta: Map is not supported. Hold it in a plain '
          + 'object, or take it over with the convert option.' });

    assert.throws(
      () =>
        observable(
          { created:
              new Date(1) },
          { deep: true }),
      { name: 'TypeError',
        message:
          /^at value\.created: Date is not supported\./ });

    assert.throws(
      () =>
        observable(
          { pattern: /x/ },
          { deep: true }),
      { name: 'TypeError',
        message:
          /^at value\.pattern: RegExp is not supported\./ });

    assert.throws(
      () =>
        observable(
          { instance:
              new Instance() },
          { deep: true }),
      { name: 'TypeError',
        message:
          /^at value\.instance: Instance is not supported\./ });

    assert.throws(
      () =>
        observable(
          { config:
              Object.freeze(
                { a: 1 }) },
          { deep: true }),
      { name: 'TypeError',
        message:
          /^at value\.config: a frozen object is not supported\./ });

    // The same rule applies to a value assigned later.
    const model: any =
      observable(
        { created:
            null as unknown },
        { deep: true });

    assert.throws(
      () =>
      {
        model.created =
          new Date(1);
      },
      /at value\.created: Date is not supported\./);
  });

/**
 * `Date` is the case most likely to be hit, and the `convert` hook is the
 * answer -- the same answer the package already gives for `Map` and `Set`.
 */
test(
  `${TEST_SUITE}: the convert hook is the escape from an unsupported value`,
  async () =>
  {
    const model =
      observable(
        { created:
            new Date(1) },
        { convert:
            value =>
          value instanceof Date
            ? value
            : undefined });

    // The member type is `never`: a model that holds a `Date` has to be typed
    // with the wrapper the hook returns, the same way it does for a `Set`.
    assert.strictEqual(
      (model.created as unknown as Date).getTime(),
      1);
  });

/**
 * A value that already conforms is stitched in as it is. Testing for `on` alone
 * would admit a value that then fails at teardown.
 */
test(
  `${TEST_SUITE}: a conforming nested value is passed through`,
  async () =>
  {
    const child =
      eventful(
        { n: 1 });

    const model =
      observable(
        { child });

    assert.strictEqual(
      model.child,
      child);
  });

/**
 * A null-prototype object is still a plain object, so it has to be converted
 * like an object literal.
 */
test(
  `${TEST_SUITE}: null prototype objects are converted`,
  async () =>
  {
    const bare =
      Object.create(null) as { a: number; };

    bare.a = 1;

    const model =
      observable(bare);

    const deliveries =
      record(model);

    model.a = 2;

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: 'a',
          value: 2,
          previous: 1 } ]);
  });

/**
 * A literal from another realm (an iframe, a `vm` context) has that realm's
 * `Object.prototype`, and is still a plain object.
 */
test(
  `${TEST_SUITE}: plain objects from another realm are converted`,
  async () =>
  {
    const model =
      observable(
        vm.runInNewContext(
          '({ a: { b: 1 }, list: [ 1 ] })'),
        { deep: true });

    const deliveries =
      record(model.a);

    model.a.b = 2;

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: 'b',
          value: 2,
          previous: 1 } ]);

    assert.equal(
      typeof model.list.on,
      'function');
  });

/**
 * A value observable cannot observe cannot be the top-level target either.
 * Boxing it would hand back something whose properties all read as undefined,
 * with nothing to say why.
 */
test(
  `${TEST_SUITE}: top-level unsupported value is refused`,
  async () =>
  {
    class Instance
    {}

    for (
      const value of [ new Date(9),
                       new Map(),
                       new Set(),
                       /x/,
                       new Instance(),
                       Object.freeze(
                         { a: 1 }),
                       () => { } ]
    ) {
      assert.throws(
        () =>
          observable(
            value as any),
        TypeError);
    }

    // Primitives are still boxed.
    assert.strictEqual(
      observable(42).value,
      42);
  });

/**
 * One target must map to one wrapper for the whole conversion, otherwise a
 * model that holds the same object twice ends up with a proxied and an
 * un-proxied handle, and writes through the second one emit nothing.
 */
test(
  `${TEST_SUITE}: repeated references share one wrapper`,
  async () =>
  {
    const shared =
      { s: 1 };

    const model =
      observable(
        { a: shared,
          b: shared },
        { deep: true });

    assert.strictEqual(
      model.a,
      model.b);

    const viaA =
      record(model.a);

    const viaB =
      record(model.b);

    model.b.s = 3;

    assert.equal(
      flat(viaA).length,
      1);

    assert.equal(
      flat(viaB).length,
      1);

    assert.strictEqual(
      model.a.s,
      3);
  });

/**
 * Sharing has to hold across branches of the model, not only between
 * siblings, so the identity map is threaded through the whole recursion.
 */
test(
  `${TEST_SUITE}: repeated references are shared across branches`,
  async () =>
  {
    const deep =
      { z: 1 };

    const model =
      observable(
        { x:
            { deep },
          y:
            { deep } });

    assert.strictEqual(
      model.x.deep,
      model.y.deep);
  });

/**
 * A cyclic model must converge: the wrapper is registered before its members
 * are converted, so a self reference resolves to the wrapper itself.
 */
test(
  `${TEST_SUITE}: cyclic references converge`,
  async () =>
  {
    type Cyclic = { n: number; self?: Cyclic; };

    const source: Cyclic =
      { n: 1 };

    source.self = source;

    const model =
      observable(
        source,
        { deep: true });

    assert.strictEqual(
      model.self,
      model);

    const deliveries =
      record(model);

    model.self!.n = 5;

    assert.equal(
      flat(deliveries).length,
      1);

    assert.strictEqual(
      model.n,
      5);
  });

/**
 * Accessors must survive conversion untouched: reading one to convert it
 * would run the getter, and writing the result back would replace the
 * accessor with a plain value.
 */
test(
  `${TEST_SUITE}: accessor properties are left untouched`,
  async () =>
  {
    let reads = 0;
    let backing = 1;

    const model =
      observable(
        { get computed(): object {
          reads++;

          return { deep: 1 };
        },
          get pair(): number {
          return backing;
        },
          set pair(value: number) {
          backing = value;
        } });

    assert.strictEqual(
      reads,
      0);

    assert.equal(
      typeof Object.getOwnPropertyDescriptor(
        model,
        'computed')?.get,
      'function');

    const deliveries =
      record(model);

    model.pair = 7;

    assert.strictEqual(
      backing,
      7);

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: 'pair',
          value: 7,
          previous: 1 } ]);
  });

/**
 * Non-writable members have no descriptor to rewrite, and array holes have no
 * descriptor at all, so conversion has to step over both rather than assign
 * through them.
 */
test(
  `${TEST_SUITE}: non-writable members and array holes are skipped`,
  async () =>
  {
    const source: any = {};

    Object.defineProperty(
      source,
      'readonly',
      { value:
          { a: 1 },
        writable: false,
        enumerable: true,
        configurable: true });

    const model =
      observable(source);

    assert.strictEqual(
      model.readonly.a,
      1);

    assert.equal(
      model.readonly.on,
      undefined);

    const sparse =
      observable(
        [, 1] as any);

    assert.equal(
      Object.prototype
        .hasOwnProperty
        .call(
          sparse,
          0),
      false);

    assert.strictEqual(
      sparse.length,
      2);
  });

/**
 * Symbol keys have no place in a contract whose `property` is a string, so they
 * are stored and not reported.
 */
test(
  `${TEST_SUITE}: symbol keys are not reported`,
  async () =>
  {
    const key =
      Symbol('key');

    const model: any =
      observable(
        { a: 1 });

    const deliveries =
      record(model);

    model[key] = 2;

    assert.strictEqual(
      model[key],
      2);

    assert.deepEqual(
      flat(deliveries),
      [ ]);
  });

/**
 * A wrapper for a kind observable does not support, built entirely outside the
 * library.
 */
function makeObservableSet(
    source: Set<unknown>
  ): any
{
  const wrapper: any =
    eventful(
      { contains:
          (
        value: unknown
      ): boolean => source.has(value),
        get size(): number {
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
}

const convertSets =
  (
  value: object
): unknown =>
  value instanceof Set
    ? makeObservableSet(value)
    : undefined;

/**
 * The convert hook has to see the values observable refuses, so a caller can
 * support a kind the library deliberately does not.
 */
test(
  `${TEST_SUITE}: convert hook takes over an otherwise unsupported value`,
  async () =>
  {
    const model =
      observable(
        { tags:
            new Set(
              [ 'a' ]) },
        { deep: true,
          convert: convertSets });

    const tags =
      model.tags as any;

    assert.equal(
      typeof tags.on,
      'function');

    assert.strictEqual(
      tags.size,
      1);

    const deliveries =
      record(tags);

    tags.add('b');

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: 'size',
          value: 2,
          previous: 1 } ]);
  });

/**
 * Wrappers the hook returns take part in the identity map like anything else
 * observable converts, so one target still maps to one wrapper.
 */
test(
  `${TEST_SUITE}: convert hook results share one wrapper per target`,
  async () =>
  {
    const shared =
      new Set(
        [ 'a' ]);

    const model =
      observable(
        { left: shared,
          right: shared },
        { convert: convertSets });

    assert.strictEqual(
      model.left,
      model.right);

    (model.left as any).add('b');

    assert.strictEqual(
      (model.right as any).size,
      2);
  });

/**
 * The identity map does not care how a target was reached. A wrapper the hook
 * returns for a top-level target is registered like a nested one, so the same
 * target handed over twice resolves to the one wrapper, and a target taken
 * over at the top is the same wrapper when it is later reached as a member.
 */
test(
  `${TEST_SUITE}: convert hook results share one wrapper at the top level`,
  async () =>
  {
    const shared =
      new Set(
        [ 'a' ]);

    const first =
      observable(
        shared,
        { convert: convertSets }) as any;

    const second =
      observable(
        shared,
        { convert: convertSets }) as any;

    assert.strictEqual(
      first,
      second);

    const holder =
      observable(
        { tags: shared },
        { deep: true,
          convert: convertSets });

    assert.strictEqual(
      holder.tags,
      first);

    first.add('b');

    assert.strictEqual(
      (holder.tags as any).size,
      2);
  });

/**
 * Returning undefined leaves the decision to observable, and returning the
 * value itself keeps it as it is even where observable would convert it.
 */
test(
  `${TEST_SUITE}: convert hook can defer or opt a value out`,
  async () =>
  {
    const model: any =
      observable(
        { converted:
            { a: 1 },
          untouched:
            { keepAsIs: true,
              b: 2 } },
        { deep: true,
          convert:
            (
          value: any
        ): unknown =>
          value.keepAsIs
            ? value
            : undefined });

    // deferred to observable, so it was converted as usual
    assert.equal(
      typeof model.converted.on,
      'function');

    // opted out, so it stayed a plain object
    assert.equal(
      model.untouched.on,
      undefined);

    assert.strictEqual(
      model.untouched.b,
      2);
  });

/**
 * Conversion grafts the Eventful API onto the target itself, so a target can
 * only belong to one observable. That has to hold across separate calls, not
 * only within one conversion.
 */
test(
  `${TEST_SUITE}: one target maps to one observable across calls`,
  async () =>
  {
    const source =
      { a: 1 };

    assert.strictEqual(
      observable(source),
      observable(source));

    const shared =
      { n: 1 };

    const left =
      observable(
        { shared },
        { deep: true });

    const right =
      observable(
        { shared },
        { deep: true });

    assert.strictEqual(
      left.shared,
      right.shared);

    const deliveries =
      record(left.shared);

    right.shared.n = 7;

    assert.equal(
      flat(deliveries).length,
      1);

    assert.strictEqual(
      left.shared.n,
      7);

    // A target reached first as a member resolves to the same observable when
    // it is later passed as a top-level target, and the other way round.
    const member =
      { m: 1 };

    const holder =
      observable(
        { member },
        { deep: true });

    assert.strictEqual(
      holder.member,
      observable(member));
  });

/**
 * A target already converted is returned as it is, so the options of a later
 * call have nothing to apply to.
 */
test(
  `${TEST_SUITE}: a later call does not reconfigure an existing observable`,
  async () =>
  {
    const source =
      { a: 1 };

    const first =
      observable(source);

    const actions: string[] = [ ];

    const second =
      observable(
        source,
        { trace:
            (
          _object: unknown,
          action: string
        ) => actions.push(action) });

    assert.strictEqual(
      second,
      first);

    second.a = 2;

    assert.deepEqual(
      actions,
      [ ]);
  });

/**
 * Observable refuses a target it cannot observe the way eventful refuses one
 * it cannot augment, naming the cause rather than failing later or handing
 * back something inert.
 */
test(
  `${TEST_SUITE}: refusal names why the target cannot be observed`,
  async () =>
  {
    assert.throws(
      () =>
        observable(
          Object.freeze(
            { a: 1 }) as any),
      { name: 'TypeError',
        message:
          'Expect an extensible object or array, but the object is frozen.' });

    assert.throws(
      () =>
        observable(
          Object.seal(
            { a: 1 }) as any),
      { name: 'TypeError',
        message:
          'Expect an extensible object or array, but the object is sealed.' });

    assert.throws(
      () =>
        observable(
          Object.preventExtensions(
            { a: 1 }) as any),
      { name: 'TypeError',
        message:
          'Expect an extensible object or array, but the object is not '
          + 'extensible.' });

    // Arrays are refused here too, rather than deeper down by eventful.
    assert.throws(
      () =>
        observable(
          Object.freeze(
            [ 1 ]) as any),
      { name: 'TypeError',
        message:
          'Expect an extensible object or array, but the object is frozen.' });

    assert.throws(
      () =>
        observable(
          new Date() as any),
      { name: 'TypeError',
        message:
          'Expect a plain object, an array, or a primitive, but the value '
          + 'is opaque. Hold it in a plain object, or take it over with the '
          + 'convert option.' });
  });
