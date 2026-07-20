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
      { a: { b: 1 } };

    const proxy =
      observable(object);

    let seenValue = 0;

    (proxy.a as any).on(
      'set:b',
      ({ value }: any) =>
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
      { value: { y: 1 }, writable: true, configurable: true, enumerable: true });

    let seenValue = 0;

    (proxy.x as any).on(
      'set:y',
      ({ value }: any) =>
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
      { a: { b: 1 } };

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
      { items: [{ name: 'A' }] };

    const proxy =
      observable(object);

    let seenValue = '';

    (proxy.items[0] as any).on(
      'set:name',
      ({ value }: any) =>
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
      { items: [{ name: 'A' }] };

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
        {
        eventful: (value: any) =>
          eventful(
            value,
            tracer)
      });

    proxy.a = 2;

    const traces =
      tracer.getMinimalTraces();

    assert.deepEqual(
      traces,
      [
        { action: 'new', payload: { object } },
        { action: 'emit', payload: { object, event: 'define:a' } },
        { action: 'emit', payload: { object, event: 'define' } },
        {
          action: 'emit',
          payload: {
            object,
            event: 'set:a',
            args: [{ previous: 1, property: 'a', value: 2 }]
          }
        },
        {
          action: 'emit',
          payload: {
            object,
            event: 'set',
            args: [{ previous: 1, property: 'a', value: 2 }]
          }
        }
      ]);
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
        {
        eventful: (value: any) =>
          eventful(
            value,
            tracer)
      });

    Object.defineProperty(
      obj,
      'a',
      { value: 3, writable: true, configurable: true, enumerable: true });

    const eventParameters =
      {
      property: 'a',
      descriptor: {
        value: 3,
        writable: true,
        enumerable: true,
        configurable: true
      },
      previous: {
        value: 1,
        writable: true,
        enumerable: true,
        configurable: true
      }
    };

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
        {
        eventful: (value: any) =>
          eventful(
            value,
            tracer)
      });

    delete (obj as any).a;

    const traces =
      tracer.getMinimalTraces();

    assert.deepEqual(
      traces,
      [{ action: 'new', payload: { object } }, {
        action: 'emit',
        payload: {
          object,
          event: 'delete:a',
          args: [{ previous: 1, property: 'a' }]
        }
      }, {
        action: 'emit',
        payload: {
          object,
          event: 'delete',
          args: [{ previous: 1, property: 'a' }]
        }
      }]);
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
      [1, 2];

    const arr =
      observable(
        array,
        {
        eventful: (value: any) =>
          eventful(
            value,
            tracer)
      });

    arr['0'] = 10;
    arr[1] = 20;
    (arr as any).test1 = 30;

    const traces =
      tracer.getMinimalTraces();

    assert.deepEqual(
      traces,
      [
        { action: 'new', payload: { object: array } },
        {
          action: 'emit',
          payload: {
            object: array,
            event: 'set:0',
            args: [{ previous: 1, index: 0, value: 10 }]
          }
        },
        {
          action: 'emit',
          payload: {
            object: array,
            event: 'set',
            args: [{ previous: 1, index: 0, value: 10 }]
          }
        },
        {
          action: 'emit',
          payload: {
            object: array,
            event: 'set:1',
            args: [{ previous: 2, index: 1, value: 20 }]
          }
        },
        {
          action: 'emit',
          payload: {
            object: array,
            event: 'set',
            args: [{ previous: 2, index: 1, value: 20 }]
          }
        },
        { action: 'emit', payload: { object: array, event: 'define:test1' } },
        { action: 'emit', payload: { object: array, event: 'define' } },
        {
          action: 'emit',
          payload: {
            object: array,
            event: 'set:test1',
            args: [{ previous: undefined, property: 'test1', value: 30 }]
          }
        },
        {
          action: 'emit',
          payload: {
            object: array,
            event: 'set',
            args: [{ previous: undefined, property: 'test1', value: 30 }]
          }
        }
      ]);
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
      [1, 2];

    const arr =
      observable(
        array,
        {
        eventful: (value: any) =>
          eventful(
            value,
            tracer)
      });

    // setting length does not delete items
    arr.length = 1;

    const traces =
      tracer.getMinimalTraces();

    assert.deepEqual(
      traces,
      [{ action: 'new', payload: { object: array } }, {
        action: 'emit',
        payload: {
          object: array,
          event: 'set:length',
          args: [{ previous: 2, property: 'length', value: 1 }]
        }
      }, {
        action: 'emit',
        payload: {
          object: array,
          event: 'set',
          args: [{ previous: 2, property: 'length', value: 1 }]
        }
      }]);
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
      [10, 20];

    const arr =
      observable(
        array,
        {
        eventful: (value: any) =>
          eventful(
            value,
            tracer)
      });

    // deleting items does not change length
    delete arr[1];

    const traces =
      tracer.getMinimalTraces();

    assert.equal(
      arr.length,
      2);

    assert.deepEqual(
      traces,
      [{ action: 'new', payload: { object: array } }, {
        action: 'emit',
        payload: {
          object: array,
          event: 'delete:1',
          args: [{ previous: 20, index: 1 }]
        }
      }, {
        action: 'emit',
        payload: {
          object: array,
          event: 'delete',
          args: [{ previous: 20, index: 1 }]
        }
      }]);
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
      [1, 2];

    const arr =
      observable(
        array,
        {
        eventful: (value: any) =>
          eventful(
            value,
            tracer)
      });

    (arr as any)['01'] = 99;

    const traces =
      tracer.getMinimalTraces();

    assert.deepEqual(
      traces,
      [
        { action: 'new', payload: { object: array } },
        { action: 'emit', payload: { object: array, event: 'define:01' } },
        { action: 'emit', payload: { object: array, event: 'define' } },
        {
          action: 'emit',
          payload: {
            object: array,
            event: 'set:01',
            args: [{ previous: undefined, property: '01', value: 99 }]
          }
        },
        {
          action: 'emit',
          payload: {
            object: array,
            event: 'set',
            args: [{ previous: undefined, property: '01', value: 99 }]
          }
        }
      ]);
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
          { eventful: 123 as any }),
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
        {
        eventful: () =>
        {
          throw new Error('should not extend');
        }
      });

    let seen: string | undefined;

    observed.on(
      'set:name',
      ({ value }: any) =>
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
    const actions: string[] = [];
    const payloads: any[] = [];

    const obj =
      observable(
        { a: 1 },
        {
        trace: (_source: unknown, action: string, payload: unknown) =>
        {
          actions.push(action);
          payloads.push(payload);
        }
      });

    obj.a = 2;

    assert.deepEqual(
      actions,
      ['new', 'define', 'set']);

    assert.deepEqual(
      payloads[payloads.length - 1],
      { property: 'a', value: 2, previous: 1 });
  });

/**
 * A global trace hook should capture lifecycle events when a local trace is
 * not supplied on the call.
 */
test(
  `${TEST_SUITE}: global trace option is used when local trace is absent`,
  async () =>
  {
    const actions: string[] = [];

    const previousTrace =
      observable.options.trace;

    observable.options.trace = (_source: unknown, action: string) =>
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
      ['new', 'define', 'set']);
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
