import { eventful }
  from 'asljs-eventful';
import assert
  from 'node:assert/strict';
import { EventEmitter }
  from 'node:events';
import test
  from 'node:test';
import vm
  from 'node:vm';
import { batch,
         Change,
         isObservable }
  from './contract.js';
import { observable }
  from './observable.js';
import { observe }
  from './observe.js';
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

class Point
{
  constructor(
    public x: number,
    public y: number
  )
  {}
}

// D1, D3, D6: an observable version is a new object, independent of the
// original in its own properties.

test(
  `${TEST_SUITE}: the result is a new object and the original is untouched`,
  () =>
  {
    const original =
      { a: 1 };

    const result =
      observable(original);

    assert.notStrictEqual(
      result,
      original);

    assert.equal(
      'on' in original,
      false);

    result.a = 2;

    assert.equal(
      original.a,
      1);

    original.a = 3;

    assert.equal(
      result.a,
      2);
  });

test(
  `${TEST_SUITE}: an array is copied too`,
  () =>
  {
    const original =
      [ 1,
        2 ];

    const result =
      observable(original);

    result.push(3);

    assert.deepEqual(
      original,
      [ 1,
        2 ]);

    assert.deepEqual(
      [ ...result ],
      [ 1,
        2,
        3 ]);
  });

test(
  `${TEST_SUITE}: values held by reference are shared with the original`,
  () =>
  {
    const original =
      { nested:
          { x: 0 } };

    const result =
      observable(original);

    assert.strictEqual(
      result.nested,
      original.nested);

    result.nested.x = 1;

    assert.equal(
      original.nested.x,
      1);

    result.nested =
      null as any;

    assert.deepEqual(
      original.nested,
      { x: 1 });
  });

// D2, D14: the methods and the payload.

test(
  `${TEST_SUITE}: a listener receives the list of modifications`,
  () =>
  {
    const model =
      observable(
        { a: 1 });

    const deliveries =
      record(model);

    model.a = 2;

    assert.deepEqual(
      deliveries,
      [ [ { kind: 'set',
            property: 'a',
            value: 2,
            previous: 1 } ] ]);
  });

test(
  `${TEST_SUITE}: the default factory's methods are hidden from the data`,
  () =>
  {
    const model =
      observable(
        { a: 1 });

    for (
      const name of [ 'on',
                      'once',
                      'off',
                      'emit',
                      'emitAsync',
                      'has',
                      'removeAllListeners',
                      'getListeners' ]
    ) {
      assert.equal(
        typeof (model as any)[name],
        'function',
        name);
    }

    assert.deepEqual(
      Object.keys(model),
      [ 'a' ]);

    assert.equal(
      JSON.stringify(model),
      '{"a":1}');

    assert.deepEqual(
      { ...model },
      { a: 1 });
  });

test(
  `${TEST_SUITE}: an observable array is an array`,
  () =>
  {
    const list =
      observable(
        [ 1,
          2,
          3 ]);

    assert.ok(
      Array.isArray(list));

    assert.equal(
      JSON.stringify(list),
      '[1,2,3]');

    assert.deepEqual(
      [ ...list ],
      [ 1,
        2,
        3 ]);

    const doubled =
      list.map(
        n => n * 2);

    // A method that returns a new array returns a plain one.
    assert.equal(
      isObservable(doubled),
      false);

    assert.deepEqual(
      doubled,
      [ 2,
        4,
        6 ]);
  });

// D4, D10 rule 1: values.

test(
  `${TEST_SUITE}: a primitive is boxed as { value }`,
  () =>
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

test(
  `${TEST_SUITE}: observable with no argument boxes undefined`,
  () =>
  {
    const boxed =
      observable();

    const deliveries =
      record(boxed);

    (boxed as any).value = 1;

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: 'value',
          value: 1,
          previous: undefined } ]);
  });

test(
  `${TEST_SUITE}: a date, regular expression or function is boxed at the top`,
  () =>
  {
    const date =
      new Date(1);

    const pattern = /x/;

    const fn = (): number => 1;

    assert.strictEqual(
      observable(date).value,
      date);

    assert.strictEqual(
      observable(pattern).value,
      pattern);

    assert.strictEqual(
      observable(fn).value,
      fn);
  });

test(
  `${TEST_SUITE}: nested values are kept by reference and never converted`,
  () =>
  {
    const date =
      new Date(1);

    const pattern = /x/;

    const fn = (): number => 1;

    const config =
      Object.freeze(
        { theme: 'dark' });

    const list =
      Object.freeze(
        [ 1 ]);

    const asked: unknown[] = [ ];

    const model: any =
      observable(
        { date,
          pattern,
          fn,
          config,
          list,
          text: 'a',
          nothing: null,
          big: 1n },
        { deep: true,
          convert:
            (
                value
              ) =>
            {
          asked.push(value);

          return undefined;
        } });

    assert.strictEqual(
      model.date,
      date);

    assert.strictEqual(
      model.pattern,
      pattern);

    assert.strictEqual(
      model.fn,
      fn);

    assert.strictEqual(
      model.config,
      config);

    assert.strictEqual(
      model.list,
      list);

    // Only the top-level object was asked about.
    assert.equal(
      asked.length,
      1);
  });

test(
  `${TEST_SUITE}: a cycle inside a value is not traversed`,
  () =>
  {
    const date: any =
      new Date(1);

    date.self = date;

    const model =
      observable(
        { date },
        { deep: true });

    assert.strictEqual(
      model.date,
      date);
  });

test(
  `${TEST_SUITE}: a frozen object at the top level throws`,
  () =>
  {
    assert.throws(
      () =>
        observable(
          Object.freeze(
            { a: 1 })),
      { name: 'TypeError',
        message:
          'at value: a frozen object cannot change, so there is nothing to '
          + 'observe' });

    assert.throws(
      () =>
        observable(
          Object.freeze(
            [ 1 ])),
      /^TypeError: at value: a frozen object/);
  });

test(
  `${TEST_SUITE}: convert can take over a frozen object at the top level`,
  () =>
  {
    const replacement =
      observable(
        { a: 1 });

    assert.strictEqual(
      observable(
        Object.freeze(
          { a: 1 }),
        { convert: () => replacement }),
      replacement);
  });

test(
  `${TEST_SUITE}: a frozen object with internal state is not a value`,
  () =>
  {
    assert.throws(
      () =>
        observable(
          { map:
              Object.freeze(
                new Map()) },
          { deep: true }),
      /^TypeError: at value\.map: Map is not supported/);
  });

// D5: each observable reports changes to its own properties only.

test(
  `${TEST_SUITE}: a nested change is reported by the nested observable only`,
  () =>
  {
    const model =
      observable(
        { user:
            { name: 'Ann' } },
        { deep: true });

    const top =
      record(model);

    const user =
      record(model.user);

    model.user.name = 'Bob';

    assert.equal(
      top.length,
      0);

    assert.deepEqual(
      flat(user),
      [ { kind: 'set',
          property: 'name',
          value: 'Bob',
          previous: 'Ann' } ]);
  });

// D5, D11 rule 3: deep.

test(
  `${TEST_SUITE}: without deep, nested objects and arrays are kept by reference`,
  () =>
  {
    const user =
      { name: 'Ann' };

    const items =
      [ { title: 'A' } ];

    const model =
      observable(
        { user,
          items });

    assert.strictEqual(
      model.user,
      user);

    assert.strictEqual(
      model.items,
      items);

    assert.equal(
      isObservable(model.user),
      false);
  });

test(
  `${TEST_SUITE}: with deep, nested plain objects and arrays are converted`,
  () =>
  {
    const user =
      { name: 'Ann' };

    const model =
      observable(
        { user,
          items:
            [ { title: 'A' } ] },
        { deep: true });

    assert.notStrictEqual(
      model.user,
      user);

    assert.ok(
      isObservable(model.user));

    assert.ok(
      isObservable(model.items));

    assert.ok(
      isObservable(model.items[0]));

    const deliveries =
      record(model.items[0]);

    model.items[0].title = 'B';

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: 'title',
          value: 'B',
          previous: 'A' } ]);

    assert.equal(
      user.name,
      'Ann');
  });

test(
  `${TEST_SUITE}: without deep, nested values that would be refused are kept`,
  () =>
  {
    const point =
      new Point(
        1,
        2);

    const model: any =
      observable(
        { point,
          map: new Map(),
          frozenless:
            Object.seal(
              { a: 1 }) });

    assert.strictEqual(
      model.point,
      point);
  });

// D7: circular references.

test(
  `${TEST_SUITE}: a circular reference throws, naming both ends`,
  () =>
  {
    const obj: any = {};

    obj.self = obj;

    assert.throws(
      () =>
        observable(
          obj,
          { deep: true }),
      { name: 'TypeError',
        message:
          'at value.self: circular reference to value' });

    const a: any =
      { b: {} };

    a.b.back = a;

    assert.throws(
      () =>
        observable(
          { a },
          { deep: true }),
      { message:
          'at value.a.b.back: circular reference to value.a' });

    // Without deep nothing nested is traversed, so the cycle is kept.
    assert.strictEqual(
      observable(obj).self,
      obj);
  });

// D8: repeated references.

test(
  `${TEST_SUITE}: an object reached twice in one call becomes one observable`,
  () =>
  {
    const shared =
      { n: 1 };

    const result: any =
      observable(
        { value1: shared,
          value2: shared,
          list:
            [ shared ] },
        { deep: true });

    assert.strictEqual(
      result.value1,
      result.value2);

    assert.strictEqual(
      result.list[0],
      result.value1);

    result.value1.n = 2;

    assert.equal(
      result.value2.n,
      2);
  });

test(
  `${TEST_SUITE}: separate calls produce separate observables`,
  () =>
  {
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

    assert.notStrictEqual(
      left.shared,
      right.shared);

    assert.notStrictEqual(
      observable(shared),
      observable(shared));
  });

// D9: the convert hook.

test(
  `${TEST_SUITE}: convert is asked once without deep, for an object only`,
  () =>
  {
    const asked: unknown[] = [ ];

    const convert =
      (
          value: object
        ): undefined =>
      {
      asked.push(value);

      return undefined;
    };

    observable(
      false,
      { convert });

    assert.equal(
      asked.length,
      0);

    const top =
      { a: new Map() };

    observable(
      top,
      { convert });

    assert.deepEqual(
      asked,
      [ top ]);
  });

test(
  `${TEST_SUITE}: convert can take over a value observable would refuse`,
  () =>
  {
    const tags =
      new Set(
        [ 'a' ]);

    const wrapper =
      observable(
        { size: 1 });

    const model: any =
      observable(
        { tags },
        { deep: true,
          convert:
            value =>
          value instanceof Set
            ? wrapper
            : undefined });

    assert.strictEqual(
      model.tags,
      wrapper);
  });

test(
  `${TEST_SUITE}: convert returning null or undefined leaves the decision`,
  () =>
  {
    const model: any =
      observable(
        { a:
            { b: 1 },
          c:
            { d: 2 } },
        { deep: true,
          convert:
            value =>
          'b' in value
            ? null
            : undefined });

    assert.ok(
      isObservable(model.a));

    assert.ok(
      isObservable(model.c));
  });

test(
  `${TEST_SUITE}: a nested convert result is used as it is`,
  () =>
  {
    const point =
      new Point(
        1,
        2);

    // Returning the object itself keeps it by reference; a nested result is
    // not checked.
    const model: any =
      observable(
        { point,
          other:
            { n: 1 } },
        { deep: true,
          convert:
            value =>
          value instanceof Point
            ? value
            : 'b' in value
            ? 42
            : undefined });

    assert.strictEqual(
      model.point,
      point);
  });

test(
  `${TEST_SUITE}: a nested convert result is not traversed`,
  () =>
  {
    const replacement: any =
      { self: null };

    replacement.self = replacement;

    const model: any =
      observable(
        { a:
            new Point(
              1,
              2) },
        { deep: true,
          convert:
            value =>
          value instanceof Point
            ? replacement
            : undefined });

    assert.strictEqual(
      model.a,
      replacement);
  });

test(
  `${TEST_SUITE}: convert is asked once for an object reached twice`,
  () =>
  {
    const point =
      new Point(
        1,
        2);

    let calls = 0;

    const model: any =
      observable(
        { a: point,
          b: point },
        { deep: true,
          convert:
            (
                value
              ) =>
            {
          if (value instanceof Point) {
            calls++;

            return { wrapped: value };
          }

          return undefined;
        } });

    assert.equal(
      calls,
      1);

    assert.strictEqual(
      model.a,
      model.b);
  });

test(
  `${TEST_SUITE}: a top-level convert result must be a new observable`,
  () =>
  {
    const map = new Map();

    assert.throws(
      () =>
        observable(
          map,
          { convert: value => value }),
      { message:
          'at value: convert must return a new observable, with on and off, '
          + 'for the top-level value' });

    assert.throws(
      () =>
        observable(
          map,
          { convert: () => 42 }),
      /^TypeError: at value: convert must return a new observable/);

    const emitter =
      new EventEmitter();

    // Returning the given emitter is returning the original itself.
    assert.throws(
      () =>
        observable(
          emitter,
          { convert: value => value }),
      /^TypeError: at value: convert must return a new observable/);

    const replacement =
      observable(
        { size: 0 });

    assert.strictEqual(
      observable(
        map,
        { convert: () => replacement }),
      replacement);
  });

test(
  `${TEST_SUITE}: convert must be a function`,
  () =>
  {
    assert.throws(
      () =>
        observable(
          { a: 1 },
          { convert:
              123 as any }),
      /Expect a function\./);
  });

// D10, D11: the rules, in order.

test(
  `${TEST_SUITE}: an observable or emitter at the top level throws`,
  () =>
  {
    assert.throws(
      () =>
        observable(
          new EventEmitter()),
      /^TypeError: at value: the value is already observable/);

    assert.throws(
      () =>
        observable(
          observable(
            { a: 1 })),
      /^TypeError: at value: the value is already observable/);
  });

test(
  `${TEST_SUITE}: a nested observable or emitter is kept by reference`,
  () =>
  {
    const emitter =
      new EventEmitter();

    const inner =
      observable(
        { n: 1 });

    const model: any =
      observable(
        { emitter,
          inner },
        { deep: true });

    assert.strictEqual(
      model.emitter,
      emitter);

    assert.strictEqual(
      model.inner,
      inner);
  });

test(
  `${TEST_SUITE}: a name the factory adds is reserved`,
  () =>
  {
    assert.throws(
      () =>
        observable(
          { on: null }),
      { message:
          'at value: the property "on" has the name of a method the '
          + 'observable adds' });

    assert.throws(
      () =>
        observable(
          { a:
              { emit: 1 } },
          { deep: true }),
      /^TypeError: at value\.a: the property "emit"/);

    // Without deep the nested object is kept, so its names do not matter.
    assert.doesNotThrow(
      () =>
        observable(
          { a:
              { on: null } }));

    // Both on and off as functions make an object already observable, kept.
    const handlers =
      { on: () => { },
        off: () => { } };

    assert.strictEqual(
      observable(
        { a: handlers },
        { deep: true }).a,
      handlers);
  });

test(
  `${TEST_SUITE}: a custom factory reserves on and off only`,
  () =>
  {
    const factory =
      (
          target: object
        ): any =>
      {
      const listeners = new Set<Function>();

      Object.defineProperties(
        target,
        { on:
            { value:
                (
              _event: string,
              listener: Function
            ) => listeners.add(listener) },
          off:
            { value:
                (
              _event: string,
              listener: Function
            ) => listeners.delete(listener) },
          emit:
            { value:
                (
                    _event: string,
                    payload: unknown
                  ) =>
                {
              for (const listener of listeners) {
                listener(payload);
              }
            } } });

      return target;
    };

    const model: any =
      observable(
        { has: true,
          a: 1 },
        { eventful: factory });

    const deliveries =
      record(model);

    model.a = 2;

    assert.equal(
      flat(deliveries).length,
      1);

    assert.throws(
      () =>
        observable(
          { off: 1 },
          { eventful: factory }),
      /^TypeError: at value: the property "off"/);
  });

test(
  `${TEST_SUITE}: a class instance or unsupported value throws`,
  () =>
  {
    assert.throws(
      () =>
        observable(
          new Point(
            1,
            2)),
      { message:
          'at value: Point is not supported. Hold it in a plain object, or '
          + 'take it over with the convert option.' });

    assert.throws(
      () =>
        observable(
          new Map()),
      /^TypeError: at value: Map is not supported/);

    assert.throws(
      () =>
        observable(
          { orders:
              [ { meta: new Map() } ] },
          { deep: true }),
      /^TypeError: at value\.orders\[0\]\.meta: Map is not supported/);
  });

// D12: plain objects and arrays.

test(
  `${TEST_SUITE}: a null-prototype object is converted`,
  () =>
  {
    const source =
      Object.create(null);

    source.a = 1;

    const model =
      observable(source);

    assert.equal(
      model.a,
      1);

    assert.ok(
      isObservable(model));
  });

test(
  `${TEST_SUITE}: plain data from another realm is converted`,
  () =>
  {
    const foreign =
      vm.runInNewContext(
        '({ a: { b: 1 }, list: [ 1 ], when: new Date(1) })');

    const model: any =
      observable(
        foreign,
        { deep: true });

    assert.ok(
      isObservable(model.a));

    assert.ok(
      isObservable(model.list));

    // A date from another realm is a value too.
    assert.strictEqual(
      model.when,
      foreign.when);
  });

test(
  `${TEST_SUITE}: an array subclass is a class instance`,
  () =>
  {
    class List extends Array<number>
    {}

    assert.throws(
      () =>
        observable(
          List.from(
            [ 1 ])),
      /^TypeError: at value: List is not supported/);
  });

test(
  `${TEST_SUITE}: a look-alike prototype is not plain`,
  () =>
  {
    const fake =
      Object.create(
        Object.create(null));

    assert.throws(
      () => observable(fake),
      /^TypeError: at value: .* is not supported/);
  });

// D13: writes after creation.

test(
  `${TEST_SUITE}: a written value is stored as it is`,
  () =>
  {
    const model: any =
      observable(
        { user:
            { name: 'Ann' } },
        { deep: true });

    const user =
      { name: 'Bob' };

    const deliveries =
      record(model);

    model.user = user;

    assert.strictEqual(
      model.user,
      user);

    // Not converted, so its own changes are not reported.
    assert.equal(
      isObservable(model.user),
      false);

    // Not checked either: what conversion refuses can be written.
    const point =
      new Point(
        1,
        2);

    model.point = point;

    model.self = model;

    assert.strictEqual(
      model.point,
      point);

    assert.equal(
      flat(deliveries).length,
      3);
  });

test(
  `${TEST_SUITE}: a pushed object is stored as it is`,
  () =>
  {
    const list: any =
      observable(
        [ ] as Array<{ n: number; }>,
        { deep: true });

    const deliveries =
      record(list);

    const item =
      { n: 1 };

    list.push(item);

    assert.strictEqual(
      list[0],
      item);

    const entry =
      flat(deliveries)[0] as Extract<Change, { kind: 'splice'; }>;

    assert.strictEqual(
      entry.added[0],
      item);
  });

// D15: the modifications.

/**
 * One event, one payload shape. A plain assignment trips both the `set` and the
 * `defineProperty` trap, and the re-entrancy guard is what stops it being
 * reported twice.
 */
test(
  `${TEST_SUITE}: an object assignment is one change`,
  () =>
  {
    const tracer =
      createTracer();

    const model =
      observable(
        { a: 1 },
        { eventful:
            (value: any) =>
          eventful(
            value,
            tracer) });

    model.a = 2;

    assert.deepEqual(
      tracer.getMinimalTraces(),
      [ { action: 'new',
          payload:
            { object: model } },
        { action: 'emit',
          payload:
            { object: model,
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
  () =>
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
 * the descriptor says.
 */
test(
  `${TEST_SUITE}: a definition is reported as a value change or not at all`,
  () =>
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

test(
  `${TEST_SUITE}: only a write that changes the value is reported`,
  () =>
  {
    const model: any =
      observable(
        { a: 1 });

    const deliveries =
      record(model);

    model.a = 1;
    model.a = Number.NaN;
    model.a = Number.NaN;
    model.a = 0;
    model.a = -0;

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: 'a',
          value: Number.NaN,
          previous: 1 },
        { kind: 'set',
          property: 'a',
          value: 0,
          previous: Number.NaN },
        { kind: 'set',
          property: 'a',
          value: -0,
          previous: 0 } ]);
  });

test(
  `${TEST_SUITE}: a write under a symbol key is stored and not reported`,
  () =>
  {
    const model: any =
      observable(
        { a: 1 });

    const deliveries =
      record(model);

    const meta =
      Symbol('meta');

    model[meta] = 1;

    assert.equal(
      model[meta],
      1);

    delete model[meta];

    assert.equal(
      deliveries.length,
      0);
  });

/**
 * An array index is an ordinary string property, so there is no numeric `index`
 * field on a `set` and no separate array change type.
 */
test(
  `${TEST_SUITE}: array index and property writes are set entries`,
  () =>
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

/** Deleting an index is a set to undefined, and it does not change length. */
test(
  `${TEST_SUITE}: deleting an array index is a set to undefined`,
  () =>
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
  () =>
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
  () =>
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
  () =>
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
  () =>
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

/**
 * `sort` and `reverse` are permutations and `fill` is a range overwrite: the
 * producer does not have a splice for them, so it reports the `set` entries it
 * does have, batched into one notification.
 */
test(
  `${TEST_SUITE}: permutations and range writes report batched set entries`,
  () =>
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

    // The middle element did not move, so it is absent.
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
 * That is consistent with the contract, since `splice` is optional. The index
 * written past the end grows the array, so `length` is reported too.
 */
test(
  `${TEST_SUITE}: a borrowed array method reports set entries`,
  () =>
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
          previous: undefined },
        { kind: 'set',
          property: 'length',
          value: 2,
          previous: 1 } ]);
  });

/** An own override of a mutating method, written later, is left alone. */
test(
  `${TEST_SUITE}: an own array method override is not wrapped`,
  () =>
  {
    const arr: any =
      observable(
        [ 'a' ]);

    const calls: unknown[] = [ ];

    arr.push =
      (
          ...items: unknown[]
        ): number =>
      {
      calls.push(items);

      return 0;
    };

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

// D16: plain data.

test(
  `${TEST_SUITE}: data that is not plain throws, naming where`,
  () =>
  {
    const cases: Array<[string, () => unknown, string]> =
      [ [ 'accessor',
          () =>
        observable(
          { get full() {
              return 'Ann';
            } }),
          'at value.full: an accessor property is not supported' ],
        [ 'symbol key',
          () =>
      observable(
        { [Symbol('meta')]: 1 }),
          'at value: the symbol key Symbol(meta) is not supported' ],
        [ 'read-only',
          () =>
        observable(
          Object.defineProperty(
            {},
            'a',
            { value: 1,
              enumerable: true,
              configurable: true })),
          'at value.a: a read-only property is not supported' ],
        [ 'non-enumerable',
          () =>
      observable(
        Object.defineProperty(
          {},
          'a',
          { value: 1,
            writable: true,
            configurable: true })),
          'at value.a: a non-enumerable property is not supported' ],
        [ 'non-configurable',
          () =>
        observable(
          Object.defineProperty(
            {},
            'a',
            { value: 1,
              writable: true,
              enumerable: true })),
          'at value.a: a non-configurable property is not supported' ],
        [ 'sealed',
          () =>
      observable(
        Object.seal(
          { a: 1 })),
          'at value: a sealed object is not supported' ],
        [ 'non-extensible',
          () =>
        observable(
          Object.preventExtensions(
            { a: 1 })),
          'at value: a non-extensible object is not supported' ],
        [ 'hole',
          () =>
      observable(
        { list:
            [1, , 3] },
        { deep: true }),
          'at value.list: an array with holes is not supported' ],
        [ 'extra array property',
          () =>
        observable(
          Object.assign(
            [ 1 ],
            { total: 1 })),
          'at value.total: an array property other than an index is not '
      + 'supported' ],
        [ 'nested sealed',
          () =>
      observable(
        { a:
            Object.seal(
              { b: 1 }) },
        { deep: true }),
          'at value.a: a sealed object is not supported' ] ];

    for (const [name, call, message] of cases) {
      assert.throws(
        call,
        { name: 'TypeError',
          message },
        name);
    }
  });

test(
  `${TEST_SUITE}: a sparse array is refused without visiting every index`,
  () =>
  {
    const sparse: number[] = [ ];

    sparse[1e9] = 1;

    assert.throws(
      () => observable(sparse),
      /an array with holes is not supported/);
  });

test(
  `${TEST_SUITE}: a __proto__ key is an ordinary property of the copy`,
  () =>
  {
    const source =
      JSON.parse(
        '{"__proto__":{"polluted":true},"a":1}');

    const model: any =
      observable(source);

    assert.deepEqual(
      model.__proto__,
      { polluted: true });

    assert.equal(
      ({} as any).polluted,
      undefined);

    assert.equal(
      model.polluted,
      undefined);
  });

// D17: error paths.

test(
  `${TEST_SUITE}: a path names a key that is not an identifier in brackets`,
  () =>
  {
    assert.throws(
      () =>
        observable(
          { 'first name':
              { meta: new Map() } },
          { deep: true }),
      /^TypeError: at value\["first name"\]\.meta: Map is not supported/);
  });

// D18: options.

test(
  `${TEST_SUITE}: throws when the eventful option is not a function`,
  () =>
  {
    assert.throws(
      () =>
        observable(
          { a: 1 },
          { eventful:
              123 as any }),
      /Expect a function\./);
  });

test(
  `${TEST_SUITE}: the eventful factory carries eventful's own options`,
  () =>
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

test(
  `${TEST_SUITE}: the factory is used for every observable a call creates`,
  () =>
  {
    let calls = 0;

    observable(
      { a:
          { b:
              [ 1 ] } },
      { deep: true,
        eventful:
          (
              value: any
            ) =>
          {
          calls++;

          return eventful(value);
        } });

    assert.equal(
      calls,
      3);
  });

test(
  `${TEST_SUITE}: a factory that adds no emit throws`,
  () =>
  {
    assert.throws(
      () =>
        observable(
          { a: 1 },
          { eventful:
              (value: any) =>
              Object.assign(
                value,
                { on: () => { },
                  off: () => { } }) }),
      { message:
          'at value: the eventful factory must add on, off and emit' });
  });

test(
  `${TEST_SUITE}: an error from the factory names the path`,
  () =>
  {
    assert.throws(
      () =>
        observable(
          { a:
              { b: 1 } },
          { deep: true,
            eventful:
              (
                  value: any
                ) =>
              {
              if ('b' in value) {
                throw new Error('no');
              }

              return eventful(value);
            } }),
      { message: 'at value.a: no' });
  });

test(
  `${TEST_SUITE}: the trace hook reports new and change`,
  () =>
  {
    const actions: string[] = [ ];
    const payloads: any[] = [ ];

    const model =
      observable(
        { a: 1,
          b: 2,
          c:
            { d: 1 } },
        { deep: true,
          trace:
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

    // One new for the nested observable and one for the top level.
    assert.deepEqual(
      actions,
      [ 'new',
        'new',
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

test(
  `${TEST_SUITE}: the global trace is used when a call passes none`,
  () =>
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

// D19: batching.

test(
  `${TEST_SUITE}: a batch delivers every write in order, unmerged`,
  () =>
  {
    const model =
      observable(
        { n: 1 });

    const deliveries =
      record(model);

    batch(
      () =>
      {
        model.n = 2;
        model.n = 3;
      });

    assert.deepEqual(
      deliveries,
      [ [ { kind: 'set',
            property: 'n',
            value: 2,
            previous: 1 },
          { kind: 'set',
            property: 'n',
            value: 3,
            previous: 2 } ] ]);
  });

test(
  `${TEST_SUITE}: a batched list applies in order across a splice`,
  () =>
  {
    const list =
      observable(
        [ 'a',
          'b' ]);

    const deliveries =
      record(list);

    batch(
      () =>
      {
        list[0] = 'x';
        list.shift();
        list[0] = 'y';
      });

    // Replaying the entries on a copy of the original gives the result.
    const replay: unknown[] =
      [ 'a',
        'b' ];

    for (const change of flat(deliveries)) {
      if (change.kind === 'set') {
        replay[Number(change.property)] = change.value;
      } else if (change.kind === 'splice') {
        replay.splice(
          change.index,
          change.removed.length,
          ...change.added);
      }
    }

    assert.deepEqual(
      replay,
      [ ...list ]);

    assert.deepEqual(
      [ ...list ],
      [ 'y' ]);
  });

// Edge cases: the order of the rules.

test(
  `${TEST_SUITE}: convert is asked about arrays too`,
  () =>
  {
    const asked: boolean[] = [ ];

    const convert =
      (
          value: object
        ): undefined =>
      {
      asked.push(
        Array.isArray(value));

      return undefined;
    };

    observable(
      [ 1 ],
      { convert });

    observable(
      { list:
          [ 1 ] },
      { deep: true,
        convert });

    assert.deepEqual(
      asked,
      [ true,
        false,
        true ]);
  });

test(
  `${TEST_SUITE}: convert is asked once for an emitter reached twice`,
  () =>
  {
    const emitter =
      new EventEmitter();

    let calls = 0;

    const model: any =
      observable(
        { a: emitter,
          b: emitter },
        { deep: true,
          convert:
            (
                value
              ) =>
            {
          if (value === emitter) {
            calls++;
          }

          return undefined;
        } });

    assert.equal(
      calls,
      1);

    assert.strictEqual(
      model.a,
      model.b);
  });

test(
  `${TEST_SUITE}: convert comes before the checks for on, off and reserved names`,
  () =>
  {
    const emitter =
      new EventEmitter();

    const replacement =
      observable(
        { source: 'emitter' });

    // At the top level, before the already-observable refusal.
    assert.strictEqual(
      observable(
        emitter,
        { convert: () => replacement }),
      replacement);

    // Nested, before keeping by reference and before the reserved names.
    const model: any =
      observable(
        { e: emitter,
          x:
            { on: null } },
        { deep: true,
          convert:
            value =>
          value === emitter
            || 'on' in value
            ? 'replaced'
            : undefined });

    assert.equal(
      model.e,
      'replaced');

    assert.equal(
      model.x,
      'replaced');
  });

test(
  `${TEST_SUITE}: a reserved name is refused before a frozen object`,
  () =>
  {
    assert.throws(
      () =>
        observable(
          Object.freeze(
            { on: null })),
      /^TypeError: at value: the property "on"/);
  });

test(
  `${TEST_SUITE}: a frozen nested value is kept whatever it holds`,
  () =>
  {
    const frozen =
      Object.freeze(
        { get x() {
          return 1;
        },
          [Symbol('meta')]: 1 });

    const model: any =
      observable(
        { frozen },
        { deep: true });

    assert.strictEqual(
      model.frozen,
      frozen);
  });

test(
  `${TEST_SUITE}: cycles and repeated objects through arrays`,
  () =>
  {
    const list: any[] = [ ];

    list.push(list);

    assert.throws(
      () =>
        observable(
          list,
          { deep: true }),
      { message:
          'at value[0]: circular reference to value' });

    const node: any = {};

    node.next = node;

    assert.throws(
      () =>
        observable(
          { list:
              [ node ] },
          { deep: true }),
      { message:
          'at value.list[0].next: circular reference to value.list[0]' });

    const shared =
      { n: 1 };

    const model: any =
      observable(
        [ shared,
          [ shared ] ],
        { deep: true });

    assert.strictEqual(
      model[0],
      model[1][0]);
  });

test(
  `${TEST_SUITE}: a numeric key of a plain object is not written as an index`,
  () =>
  {
    assert.throws(
      () =>
        observable(
          { 0:
              { m: new Map() } },
          { deep: true }),
      /^TypeError: at value\["0"\]\.m: Map is not supported/);
  });

test(
  `${TEST_SUITE}: holes are refused at the top level too`,
  () =>
  {
    assert.throws(
      () =>
        observable(
          [1, , 3]),
      { message:
          'at value: an array with holes is not supported' });
  });

test(
  `${TEST_SUITE}: a top-level array from another realm reports splices`,
  () =>
  {
    const list: any =
      observable(
        vm.runInNewContext('[ 1 ]'));

    const deliveries =
      record(list);

    list.push(2);

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'splice',
          index: 1,
          removed: [ ],
          added:
            [ 2 ] } ]);
  });

// Edge cases: the box and the reports.

test(
  `${TEST_SUITE}: a definition or deletion of a box's value is reported`,
  () =>
  {
    const boxed: any =
      observable(1);

    const deliveries =
      record(boxed);

    Object.defineProperty(
      boxed,
      'value',
      { value: 5,
        writable: true,
        enumerable: true,
        configurable: true });

    boxed.value = 6;

    delete boxed.value;

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: 'value',
          value: 5,
          previous: 1 },
        { kind: 'set',
          property: 'value',
          value: 6,
          previous: 5 },
        { kind: 'set',
          property: 'value',
          value: undefined,
          previous: 6 } ]);
  });

test(
  `${TEST_SUITE}: defining a shorter length is a splice`,
  () =>
  {
    const list =
      observable(
        [ 1,
          2,
          3 ]);

    const deliveries =
      record(list);

    Object.defineProperty(
      list,
      'length',
      { value: 1 });

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'splice',
          index: 1,
          removed:
            [ 2,
              3 ],
          added: [ ] } ]);
  });

test(
  `${TEST_SUITE}: deleting a missing property reports nothing`,
  () =>
  {
    const model: any =
      observable(
        { a: 1 });

    const deliveries =
      record(model);

    delete model.missing;

    assert.equal(
      deliveries.length,
      0);
  });

test(
  `${TEST_SUITE}: the methods exist but are not data`,
  () =>
  {
    const model =
      observable(
        { a: 1 });

    const keys: string[] = [ ];

    for (const key in model) {
      keys.push(key);
    }

    assert.ok(
      'on' in model);

    assert.deepEqual(
      keys,
      [ 'a' ]);
  });

// Edge cases: options.

test(
  `${TEST_SUITE}: the factory's return value is ignored`,
  () =>
  {
    const model: any =
      observable(
        { a: 1 },
        { eventful:
            (
                value: any
              ) =>
            {
          eventful(value);

          return { other: true };
        } });

    const deliveries =
      record(model);

    model.a = 2;

    assert.equal(
      model.other,
      undefined);

    assert.equal(
      flat(deliveries).length,
      1);
  });

test(
  `${TEST_SUITE}: trace must be a function, and options may be null`,
  () =>
  {
    assert.throws(
      () =>
        observable(
          { a: 1 },
          { trace:
              123 as any }),
      /Expect a function\./);

    assert.equal(
      observable(
        { a: 1 },
        null as any).a,
      1);
  });

test(
  `${TEST_SUITE}: trace reports new for a box, with the observable itself`,
  () =>
  {
    const seen: unknown[] = [ ];

    const boxed =
      observable(
        1,
        { trace:
            (
                object: unknown,
                action: string,
                payload: any
              ) =>
            {
          seen.push(
            [ action,
              object === payload?.object ]);
        } });

    assert.deepEqual(
      seen,
      [ [ 'new',
          true ] ]);

    assert.ok(
      isObservable(boxed));
  });

test(
  `${TEST_SUITE}: an index written past the end also reports length`,
  () =>
  {
    const list: any =
      observable(
        [ 1 ]);

    const deliveries =
      record(list);

    const lengths: unknown[] = [ ];

    observe(list)
      .at('length')
      .subscribe(
        length => lengths.push(length));

    list[1] = 2;

    list[5] = 3;

    // Writing inside the array does not change its length.
    list[0] = 9;

    assert.deepEqual(
      flat(deliveries),
      [ { kind: 'set',
          property: '1',
          value: 2,
          previous: undefined },
        { kind: 'set',
          property: 'length',
          value: 2,
          previous: 1 },
        { kind: 'set',
          property: '5',
          value: 3,
          previous: undefined },
        { kind: 'set',
          property: 'length',
          value: 6,
          previous: 2 },
        { kind: 'set',
          property: '0',
          value: 9,
          previous: 1 } ]);

    assert.deepEqual(
      lengths,
      [ 1,
        2,
        6 ]);
  });

test(
  `${TEST_SUITE}: an error from convert names the path`,
  () =>
  {
    const failure =
      new Error('hook failed');

    assert.throws(
      () =>
        observable(
          { a:
              { b: new Map() } },
          { deep: true,
            convert:
              (
                  value
                ) =>
              {
              if (value instanceof Map) {
                throw failure;
              }

              return undefined;
            } }),
      (error: any) =>
        error instanceof TypeError
        && error.message === 'at value.a.b: hook failed'
        && error.cause === failure);
  });
