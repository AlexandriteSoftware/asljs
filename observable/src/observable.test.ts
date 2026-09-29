import { eventful }
  from 'asljs-eventful';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { observable }
  from './observable.js';
import { createTracer }
  from './tracer.js';

const TEST_SUITE = 'observable';

/**
 * Nested object fields should be observable by default so deep listeners can
 * subscribe without manual wrapping.
 */
test(
  `${TEST_SUITE}: observes nested objects by default`,
  async () =>
  {
    const object =
      { a:
          { b: 1 } };

    const proxy =
      observable(object);

    let seenValue = 0;

    (proxy.a as any).on(
      'set:b',
      (
          { value }: any
        ) =>
      {
        seenValue = value;
      });

    proxy.a.b = 2;

    assert.equal(
      seenValue,
      2);
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
        {} as { x?: { y: number; }; });

    Object.defineProperty(
      proxy,
      'x',
      { value:
          { y: 1 },
        writable: true,
        configurable: true,
        enumerable: true });

    let seenValue = 0;

    (proxy.x as any).on(
      'set:y',
      (
          { value }: any
        ) =>
      {
        seenValue = value;
      });

    (proxy.x as any).y = 2;

    assert.equal(
      seenValue,
      2);
  });

/**
 * Shallow mode keeps child objects raw when callers need explicit control over
 * nested observability boundaries.
 */
test(
  `${TEST_SUITE}: shallow:true keeps nested objects non-observable`,
  async () =>
  {
    const object =
      { a:
          { b: 1 } };

    const proxy =
      observable(
        object,
        { shallow: true });

    assert.equal(
      typeof (proxy.a as any).on,
      'undefined');
  });

/**
 * Nested entries inside arrays remain observable by default so item-level
 * edits still notify listeners.
 */
test(
  `${TEST_SUITE}: observes nested objects inside arrays by default`,
  async () =>
  {
    const object =
      { items:
          [ { name: 'A' } ] };

    const proxy =
      observable(object);

    let seenValue = '';

    (proxy.items[0] as any).on(
      'set:name',
      (
          { value }: any
        ) =>
      {
        seenValue = value;
      });

    proxy.items[0].name = 'B';

    assert.equal(
      seenValue,
      'B');
  });

/**
 * In shallow mode, array items stay plain objects so nested wrapping is not
 * applied automatically.
 */
test(
  `${TEST_SUITE}: shallow:true keeps nested objects inside arrays non-observable`,
  async () =>
  {
    const object =
      { items:
          [ { name: 'A' } ] };

    const proxy =
      observable(
        object,
        { shallow: true });

    assert.equal(
      typeof (proxy.items[0] as any).on,
      'undefined');
  });

/**
 * Object field updates should emit both keyed and generic set events so
 * specific and aggregate subscribers stay in sync.
 */
test(
  `${TEST_SUITE}: observable object set and keyed set events`,
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

    const traces =
      tracer.getMinimalTraces();

    assert.deepEqual(
      traces,
      [ { action: 'new',
          payload:
            { object } },
        { action: 'emit',
          payload:
            { object,
              event: 'define:a' } },
        { action: 'emit',
          payload:
            { object,
              event: 'define' } },
        { action: 'emit',
          payload:
            { object,
              event: 'set:a',
              args:
                [ { previous: 1,
                    property: 'a',
                    value: 2 } ] } },
        { action: 'emit',
          payload:
            { object,
              event: 'set',
              args:
                [ { previous: 1,
                    property: 'a',
                    value: 2 } ] } } ]);
  });

/**
 * Defining fields at runtime should emit define events for both targeted and
 * broad observers.
 */
test(
  `${TEST_SUITE}: observable object define and keyed define events`,
  async () =>
  {
    const tracer =
      createTracer();

    const obj =
      observable(
        { a: 1 },
        { eventful:
            (value: any) =>
          eventful(
            value,
            tracer) });

    Object.defineProperty(
      obj,
      'a',
      { value: 3,
        writable: true,
        configurable: true,
        enumerable: true });

    const eventParameters =
      { property: 'a',
        descriptor:
          { value: 3,
            writable: true,
            enumerable: true,
            configurable: true },
        previous:
          { value: 1,
            writable: true,
            enumerable: true,
            configurable: true } };

    assert.deepEqual(
      tracer.getFirstEventParameters('define'),
      eventParameters);

    assert.deepEqual(
      tracer.getFirstEventParameters('define:a'),
      eventParameters);
  });

/**
 * Removing a field must emit delete signals so dependent consumers can drop
 * stale state immediately.
 */
test(
  `${TEST_SUITE}: observable object delete and keyed delete events`,
  async () =>
  {
    const tracer =
      createTracer();

    const object =
      { a: 1 };

    const obj =
      observable(
        object,
        { eventful:
            (value: any) =>
          eventful(
            value,
            tracer) });

    delete (obj as any).a;

    const traces =
      tracer.getMinimalTraces();

    assert.deepEqual(
      traces,
      [ { action: 'new',
          payload:
            { object } },
        { action: 'emit',
          payload:
            { object,
              event: 'delete:a',
              args:
                [ { previous: 1,
                    property: 'a' } ] } },
        { action: 'emit',
          payload:
            { object,
              event: 'delete',
              args:
                [ { previous: 1,
                    property: 'a' } ] } } ]);
  });

/**
 * Changing an item index should emit index-aware payloads so consumers can
 * update only the affected entry.
 */
test(
  `${TEST_SUITE}: observable array index set, property set`,
  async () =>
  {
    const tracer =
      createTracer();

    const array =
      [ 1,
        2 ];

    const arr =
      observable(
        array,
        { eventful:
            (value: any) =>
          eventful(
            value,
            tracer) });

    arr['0'] = 10;
    arr[1] = 20;
    (arr as any).test1 = 30;

    const traces =
      tracer.getMinimalTraces();

    assert.deepEqual(
      traces,
      [ { action: 'new',
          payload:
            { object: array } },
        { action: 'emit',
          payload:
            { object: array,
              event: 'set:0',
              args:
                [ { previous: 1,
                    index: 0,
                    value: 10 } ] } },
        { action: 'emit',
          payload:
            { object: array,
              event: 'set',
              args:
                [ { previous: 1,
                    index: 0,
                    value: 10 } ] } },
        { action: 'emit',
          payload:
            { object: array,
              event: 'set:1',
              args:
                [ { previous: 2,
                    index: 1,
                    value: 20 } ] } },
        { action: 'emit',
          payload:
            { object: array,
              event: 'set',
              args:
                [ { previous: 2,
                    index: 1,
                    value: 20 } ] } },
        { action: 'emit',
          payload:
            { object: array,
              event: 'define:test1' } },
        { action: 'emit',
          payload:
            { object: array,
              event: 'define' } },
        { action: 'emit',
          payload:
            { object: array,
              event: 'set:test1',
              args:
                [ { previous: undefined,
                    property: 'test1',
                    value: 30 } ] } },
        { action: 'emit',
          payload:
            { object: array,
              event: 'set',
              args:
                [ { previous: undefined,
                    property: 'test1',
                    value: 30 } ] } } ]);
  });

/**
 * Trimming a collection through length should emit a property payload for
 * aggregate consumers such as counters.
 */
test(
  `${TEST_SUITE}: observable array length set event`,
  async () =>
  {
    const tracer =
      createTracer();

    const array =
      [ 1,
        2 ];

    const arr =
      observable(
        array,
        { eventful:
            (value: any) =>
          eventful(
            value,
            tracer) });

    // setting length drops the tail, and each dropped item is reported
    arr.length = 1;

    const traces =
      tracer.getMinimalTraces();

    assert.deepEqual(
      traces,
      [ { action: 'new',
          payload:
            { object: array } },
        { action: 'emit',
          payload:
            { object: array,
              event: 'delete:1',
              args:
                [ { index: 1,
                    previous: 2 } ] } },
        { action: 'emit',
          payload:
            { object: array,
              event: 'delete',
              args:
                [ { index: 1,
                    previous: 2 } ] } },
        { action: 'emit',
          payload:
            { object: array,
              event: 'set:length',
              args:
                [ { previous: 2,
                    property: 'length',
                    value: 1 } ] } },
        { action: 'emit',
          payload:
            { object: array,
              event: 'set',
              args:
                [ { previous: 2,
                    property: 'length',
                    value: 1 } ] } } ]);
  });

/**
 * Deleting an item index must emit delete metadata while preserving native
 * sparse-array length behavior.
 */
test(
  `${TEST_SUITE}: observable array keyed delete event`,
  async () =>
  {
    const tracer =
      createTracer();

    const array =
      [ 10,
        20 ];

    const arr =
      observable(
        array,
        { eventful:
            (value: any) =>
          eventful(
            value,
            tracer) });

    // deleting items does not change length
    delete arr[1];

    const traces =
      tracer.getMinimalTraces();

    assert.equal(
      arr.length,
      2);

    assert.deepEqual(
      traces,
      [ { action: 'new',
          payload:
            { object: array } },
        { action: 'emit',
          payload:
            { object: array,
              event: 'delete:1',
              args:
                [ { previous: 20,
                    index: 1 } ] } },
        { action: 'emit',
          payload:
            { object: array,
              event: 'delete',
              args:
                [ { previous: 20,
                    index: 1 } ] } } ]);
  });

/**
 * Keys like '01' are metadata keys, not canonical numeric indexes, and should
 * therefore use property-style payloads.
 */
test(
  `${TEST_SUITE}: observable array non-canonical numeric-like key uses property payload`,
  async () =>
  {
    const tracer =
      createTracer();

    const array =
      [ 1,
        2 ];

    const arr =
      observable(
        array,
        { eventful:
            (value: any) =>
          eventful(
            value,
            tracer) });

    (arr as any)['01'] = 99;

    const traces =
      tracer.getMinimalTraces();

    assert.deepEqual(
      traces,
      [ { action: 'new',
          payload:
            { object: array } },
        { action: 'emit',
          payload:
            { object: array,
              event: 'define:01' } },
        { action: 'emit',
          payload:
            { object: array,
              event: 'define' } },
        { action: 'emit',
          payload:
            { object: array,
              event: 'set:01',
              args:
                [ { previous: undefined,
                    property: '01',
                    value: 99 } ] } },
        { action: 'emit',
          payload:
            { object: array,
              event: 'set',
              args:
                [ { previous: undefined,
                    property: '01',
                    value: 99 } ] } } ]);
  });

/**
 * Starting without an initial value should still allow later assignment and
 * emit the same boxed set contract.
 */
test(
  `${TEST_SUITE}: observable <empty>`,
  async () =>
  {
    const obj =
      observable<number | undefined>(undefined);

    let newValue: any;

    obj.on(
      'set',
      (v: any) => newValue = v.value);

    obj.value = 43;

    assert.strictEqual(
      newValue,
      43);
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

    let seen: string | undefined;

    observed.on(
      'set:name',
      (
          { value }: any
        ) =>
      {
        seen = value;
      });

    observed.name = 'Bob';

    assert.equal(
      seen,
      'Bob');
  });

/**
 * Passing a per-instance trace hook should capture object lifecycle actions
 * for local diagnostics.
 */
test(
  `${TEST_SUITE}: per-instance trace hook captures new and set actions`,
  async () =>
  {
    const actions: string[] = [ ];
    const payloads: any[] = [ ];

    const obj =
      observable(
        { a: 1 },
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

    obj.a = 2;

    assert.deepEqual(
      actions,
      [ 'new',
        'define',
        'set' ]);

    assert.deepEqual(
      payloads[payloads.length - 1],
      { property: 'a',
        value: 2,
        previous: 1 });
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
      const obj =
        observable(
          { a: 1 });

      obj.a = 2;
    } finally {
      observable.options.trace = previousTrace;
    }

    assert.deepEqual(
      actions,
      [ 'new',
        'define',
        'set' ]);
  });

/**
 * Telemetry gauge S5.1: a primitive reading wrapped as observable should emit
 * value transitions through the same event pipeline as object state.
 */
test(
  `${TEST_SUITE}: observable number`,
  async () =>
  {
    const obj =
      observable(42);

    let newValue: number | undefined;

    obj.on(
      'set',
      (v: any) => newValue = v.value);

    obj.value = 43;

    assert.strictEqual(
      newValue,
      43);
  });

/**
 * Values that rely on internal slots or private fields cannot survive being
 * proxied, so nested conversion must leave them untouched and keep their
 * identity intact.
 */
test(
  `${TEST_SUITE}: nested built-ins and class instances are kept as values`,
  async () =>
  {
    class Instance
    {
      #secret = 7;

      get secret(): number {
        return this.#secret;
      }
    }

    const date =
      new Date(5);

    const map =
      new Map(
        [ [ 'k',
            1 ] ]);

    const set =
      new Set(
        [ 1 ]);

    const bytes =
      new Uint8Array(2);

    const instance =
      new Instance();

    const object =
      observable(
        { date,
          map,
          set,
          pattern: /x/,
          bytes,
          instance });

    assert.strictEqual(
      object.date,
      date);

    assert.strictEqual(
      object.date.getTime(),
      5);

    assert.strictEqual(
      object.map.get('k'),
      1);

    assert.strictEqual(
      object.set.has(1),
      true);

    assert.strictEqual(
      object.pattern.test('x'),
      true);

    assert.strictEqual(
      object.bytes.length,
      2);

    assert.strictEqual(
      object.instance.secret,
      7);
  });

/**
 * Opaque values are still ordinary properties: replacing one has to emit the
 * usual set events even though its contents are not observed.
 */
test(
  `${TEST_SUITE}: replacing an opaque value emits set events`,
  async () =>
  {
    const object =
      observable(
        { date:
            new Date(1) });

    const seen: string[] = [ ];

    object.on(
      'set:date',
      () => seen.push('set:date'));

    object.on(
      'set',
      () => seen.push('set'));

    object.date =
      new Date(2);

    assert.deepEqual(
      seen,
      [ 'set:date',
        'set' ]);
  });

/**
 * A null-prototype object is still a plain object, so it has to be converted
 * like an object literal.
 */
test(
  `${TEST_SUITE}: null prototype objects are converted`,
  async () =>
  {
    const bare: any =
      Object.create(null);

    bare.a = 1;

    const object =
      observable(bare);

    let seen: number | undefined;

    object.on(
      'set:a',
      (
        { value }: any
      ) => seen = value);

    object.a = 2;

    assert.strictEqual(
      seen,
      2);
  });

/**
 * Passing an opaque value as the top-level target boxes it the same way a
 * primitive is boxed, so the returned value always carries the eventful API.
 */
test(
  `${TEST_SUITE}: top-level opaque value is boxed`,
  async () =>
  {
    const date =
      new Date(9);

    const boxed =
      observable(date);

    assert.strictEqual(
      boxed.value,
      date);

    let seen: unknown;

    boxed.on(
      'set',
      (
        { value }: any
      ) => seen = value);

    const next =
      new Date(10);

    boxed.value = next;

    assert.strictEqual(
      seen,
      next);
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

    const object =
      observable(
        { a: shared,
          b: shared });

    assert.strictEqual(
      object.a,
      object.b);

    let viaA = 0;
    let viaB = 0;

    (object.a as any).on(
      'set:s',
      () => viaA++);

    (object.b as any).on(
      'set:s',
      () => viaB++);

    object.b.s = 3;

    assert.strictEqual(
      viaA,
      1);

    assert.strictEqual(
      viaB,
      1);

    assert.strictEqual(
      object.a.s,
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

    const object =
      observable(
        { x:
            { deep },
          y:
            { deep } });

    assert.strictEqual(
      object.x.deep,
      object.y.deep);
  });

/**
 * A cyclic model must converge: the wrapper is registered before its members
 * are converted, so a self reference resolves to the wrapper itself.
 */
test(
  `${TEST_SUITE}: cyclic references converge`,
  async () =>
  {
    const source: any =
      { n: 1 };

    source.self = source;

    const object =
      observable(source);

    assert.strictEqual(
      object.self,
      object);

    let seen = 0;

    object.on(
      'set:n',
      () => seen++);

    object.self.n = 5;

    assert.strictEqual(
      seen,
      1);

    assert.strictEqual(
      object.n,
      5);
  });

/**
 * Watching through one handle has to observe writes made through any other
 * handle on the same target.
 */
test(
  `${TEST_SUITE}: watch observes writes through a shared reference`,
  async () =>
  {
    const shared =
      { n: 1 };

    const object =
      observable(
        { a: shared,
          b: shared });

    let seen: unknown;

    (object as any).watch(
      'a.n',
      (
        value: unknown
      ) => seen = value);

    object.b.n = 9;

    assert.strictEqual(
      seen,
      9);
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

    const object =
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

    const descriptor =
      Object.getOwnPropertyDescriptor(
        object,
        'computed');

    assert.equal(
      typeof descriptor?.get,
      'function');

    let seen = 0;

    object.on(
      'set:pair',
      () => seen++);

    object.pair = 7;

    assert.strictEqual(
      backing,
      7);

    assert.strictEqual(
      object.pair,
      7);

    assert.strictEqual(
      seen,
      1);
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

    const object =
      observable(source);

    assert.strictEqual(
      object.readonly.a,
      1);

    assert.equal(
      (object.readonly as any).on,
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
 * The eventful API cannot be attached to a non-extensible value, and a frozen
 * value has no changes to report, so such values stay opaque.
 */
test(
  `${TEST_SUITE}: non-extensible values are opaque`,
  async () =>
  {
    const frozen =
      Object.freeze(
        { a: 1 });

    const object =
      observable(
        { frozen,
          sealed:
            Object.seal(
              { b: 2 }) });

    assert.strictEqual(
      object.frozen,
      frozen);

    assert.strictEqual(
      object.frozen.a,
      1);

    assert.strictEqual(
      object.sealed.b,
      2);

    // Extensibility is a runtime property, so the static type still resolves
    // to an observable object even though the value is boxed.
    const boxed: any =
      observable(frozen);

    assert.strictEqual(
      boxed.value,
      frozen);
  });

/**
 * Shortening an array drops elements without going through the delete trap,
 * so the truncation has to report them itself, furthest index first and
 * before the length change.
 */
test(
  `${TEST_SUITE}: truncating an array emits delete events`,
  async () =>
  {
    const array =
      observable(
        [ 'a',
          'b',
          'c' ]);

    const events: string[] = [ ];

    array.on(
      'delete',
      (
        { index, previous }: any
      ) =>
        events.push(
          `delete ${index} ${previous}`));

    array.on(
      'set',
      (
        payload: any
      ) =>
        events.push(
          `set ${payload.property} ${payload.value}`));

    let keyed: any;

    array.on(
      'delete:2',
      (
        payload: any
      ) => keyed = payload);

    array.length = 1;

    assert.deepEqual(
      events,
      [ 'delete 2 c',
        'delete 1 b',
        'set length 1' ]);

    assert.deepEqual(
      keyed,
      { index: 2,
        previous: 'c' });

    assert.deepEqual(
      Array.from(array),
      [ 'a' ]);
  });

/**
 * Truncation reports only elements that are actually there: holes have
 * nothing to report, and `pop`, `shift` and `splice` delete the tail
 * themselves before assigning `length`, so nothing is reported twice.
 */
test(
  `${TEST_SUITE}: truncation skips holes and does not double report`,
  async () =>
  {
    const source: any[] =
      [ 1,
        2,
        3 ];

    delete source[1];

    const sparse =
      observable(source);

    const dropped: number[] = [ ];

    sparse.on(
      'delete',
      (
        { index }: any
      ) => dropped.push(index));

    sparse.length = 0;

    assert.deepEqual(
      dropped,
      [ 2,
        0 ]);

    const popped =
      observable(
        [ 1,
          2,
          3 ]);

    const poppedIndices: number[] = [ ];

    popped.on(
      'delete',
      (
        { index }: any
      ) => poppedIndices.push(index));

    popped.pop();

    assert.deepEqual(
      poppedIndices,
      [ 2 ]);
  });

/**
 * A length assignment that removes nothing must stay silent, and growing an
 * array only reports the length itself.
 */
test(
  `${TEST_SUITE}: growing or keeping array length emits no deletes`,
  async () =>
  {
    const array =
      observable(
        [ 1 ]);

    const events: string[] = [ ];

    array.on(
      'delete',
      () => events.push('delete'));

    array.on(
      'set',
      (
        payload: any
      ) =>
        events.push(
          `set ${payload.property}`));

    array.length = 1;

    assert.deepEqual(
      events,
      [ ]);

    array.length = 4;

    assert.deepEqual(
      events,
      [ 'set length' ]);
  });
