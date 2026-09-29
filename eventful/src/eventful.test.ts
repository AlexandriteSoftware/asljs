import assert
  from 'node:assert/strict';
import { spawnSync }
  from 'node:child_process';
import { resolve }
  from 'node:path';
import test
  from 'node:test';
import { pathToFileURL }
  from 'node:url';
import { EventfulBase }
  from './eventful-base.js';
import { eventful }
  from './eventful.js';
import { Eventful }
  from './types.js';

const TEST_SUITE = 'eventful';

test(
  `${TEST_SUITE}: eventful extends an object`,
  () =>
  {
    const original = {};

    const enhanced =
      eventful(original);

    assert.equal(
      enhanced,
      original);

    assertEventfulMethods(
      enhanced);
  });

test(
  `${TEST_SUITE}: eventful extends a function`,
  () =>
  {
    const original =
      (): void => { };

    const enhanced =
      eventful(original);

    assert.equal(
      enhanced,
      original);

    assertEventfulMethods(
      enhanced);
  });

test(
  `${TEST_SUITE}: eventful can be called without arguments`,
  () =>
  {
    const enhanced =
      eventful();

    assert.ok(
      enhanced !== null);

    assertEventfulMethods(
      enhanced);
  });

test(
  `${TEST_SUITE}: eventful can be extended by inheritance`,
  () =>
  {
    type MyClassEvents = {
      greet: [message: string];
    };

    class MyClass extends EventfulBase<MyClassEvents>
    {
      name: string;

      constructor(
        name: string
      )
      {
        super();

        this.name = name;
      }

      greet(): void
      {
        this.emit(
          'greet',
          `Hello, ${this.name}`);
      }
    }

    const instance =
      new MyClass('Alice');

    let greeting: string | null = null;

    instance.on(
      'greet',
      message => greeting = message);

    instance.greet();

    assert.equal(
      greeting,
      'Hello, Alice');
  });

test(
  `${TEST_SUITE}: eventful can be added during construction`,
  () =>
  {
    type MyClassEvents = {
      greet: [message: string];
    };

    class MyClass implements Eventful<MyClassEvents>
    {
      name: string;

      declare on: Eventful<MyClassEvents>['on'];
      declare once: Eventful<MyClassEvents>['once'];
      declare off: Eventful<MyClassEvents>['off'];
      declare emit: Eventful<MyClassEvents>['emit'];
      declare emitAsync: Eventful<MyClassEvents>['emitAsync'];
      declare has: Eventful<MyClassEvents>['has'];
      declare removeAllListeners: Eventful<MyClassEvents>['removeAllListeners'];

      constructor(
        name: string
      )
      {
        eventful(
          this);

        this.name = name;
      }

      greet(): void
      {
        this.emit(
          'greet',
          `Hello, ${this.name}`);
      }
    }

    const instance =
      new MyClass('Alice');

    let greeting: string | null = null;

    instance.on(
      'greet',
      message => greeting = message);

    instance.greet();

    assert.equal(
      greeting,
      'Hello, Alice');
  });

test(
  `${TEST_SUITE}: trace is called on creation with action "new"`,
  () =>
  {
    const recorder =
      createRecorder();

    const object =
      eventful(
        {},
        { trace: recorder.write });

    const creation =
      recorder.records().find(
        item => item.action === 'new');

    assert.ok(creation);

    assert.equal(
      creation.payload.object,
      object);
  });

test(
  `${TEST_SUITE}: global trace is called on creation with action "new"`,
  () =>
  {
    const recorder =
      createRecorder();

    const off =
      eventful.on(
        'new',
        (...args: unknown[]) =>
        recorder.write(
          'new',
          args[0] as TraceRecord['payload']));

    try {
      const object =
        eventful(
          {},
          { trace: recorder.write });

      const creation =
        recorder.records().find(
          item => item.action === 'new');

      assert.ok(
        creation);

      assert.equal(
        creation.payload.object,
        object);
    } finally {
      off();
    }
  });

test(
  `${TEST_SUITE}: eventful throws when an object has one of the event emitter methods`,
  () =>
  {
    for (const method of [ 'on',
                           'once',
                           'off',
                           'emit',
                           'emitAsync',
                           'has' ]) {
      assert.throws(
        () =>
          eventful(
            { [method]: () => { } }));
    }
  });

test(
  `${TEST_SUITE}: exceptions in listeners are suppressed in async emit by default`,
  async () =>
  {
    const errors: unknown[] = [ ];

    const obj =
      eventful(
        {},
        { error:
            (
                args
              ) =>
            {
          errors.push(args.error);
        } });

    obj.on(
      'test',
      () =>
      {
        throw new Error('test error');
      });

    await assert.doesNotReject(
      () => obj.emitAsync('test'));

    assert.equal(
      errors.length,
      1);
  });

function assertEventfulMethods(
    object: unknown
  ): void
{
  const candidate =
    object as {
    on?: unknown;
    off?: unknown;
    emit?: unknown;
    emitAsync?: unknown;
    has?: unknown;
  };

  assert.equal(
    typeof candidate.on,
    'function');

  assert.equal(
    typeof candidate.off,
    'function');

  assert.equal(
    typeof candidate.emit,
    'function');

  assert.equal(
    typeof candidate.emitAsync,
    'function');

  assert.equal(
    typeof candidate.has,
    'function');
}

test(
  `${TEST_SUITE}: a rejected listener does not reject async emit`,
  async () =>
  {
    const errors: unknown[] = [ ];

    const obj =
      eventful(
        {},
        { error:
            (
                args
              ) =>
            {
          errors.push(args.error);
        } });

    obj.on(
      'test',
      async () =>
      {
        throw new Error('test error');
      });

    await assert.doesNotReject(
      () => obj.emitAsync('test'));

    assert.equal(
      errors.length,
      1);
  });

test(
  `${TEST_SUITE}: exceptions in listeners are suppressed in emit by default`,
  () =>
  {
    const errors: unknown[] = [ ];

    const obj =
      eventful(
        {},
        { error:
            (
                args
              ) =>
            {
          errors.push(args.error);
        } });

    obj.on(
      'test',
      () =>
      {
        throw new Error('test error');
      });

    assert.doesNotThrow(
      () => obj.emit('test'));

    assert.equal(
      errors.length,
      1);
  });

test(
  `${TEST_SUITE}: strict mode propagates exceptions in listeners in async emit`,
  async () =>
  {
    const obj =
      eventful(
        {},
        { error: () => { },
          strict: true });

    obj.on(
      'test',
      () =>
      {
        throw new Error('test error');
      });

    await assert.rejects(
      () => obj.emitAsync('test'));
  });

test(
  `${TEST_SUITE}: strict mode propagates exceptions in listeners in emit`,
  () =>
  {
    const obj =
      eventful(
        {},
        { error: () => { },
          strict: true });

    obj.on(
      'test',
      () =>
      {
        throw new Error('test error');
      });

    assert.throws(
      () => obj.emit('test'),
      Error);
  });

test(
  `${TEST_SUITE}: non-strict runs other listeners even if one fails`,
  async () =>
  {
    const obj =
      eventful(
        {},
        { error: () => { } });

    let ran = 0;

    obj.on(
      'test',
      () => ran += 1);

    obj.on(
      'test',
      () =>
      {
        throw new Error('boom');
      });

    obj.on(
      'test',
      () => ran += 1);

    await assert.doesNotReject(
      () => obj.emitAsync('test'));

    assert.equal(
      ran,
      2);
  });

test(
  `${TEST_SUITE}: trace receives safe payload and action names`,
  async () =>
  {
    const recorder =
      createRecorder();

    const obj =
      eventful(
        {},
        { trace: recorder.write });

    const off =
      obj.on(
        'e',
        () => { });

    obj.emit(
      'e',
      1,
      2);

    await obj.emitAsync(
      'e',
      3,
      4);

    off();

    assert.ok(
      recorder.records().find(
        item => item.action === 'on'));

    assert.ok(
      recorder.records().find(
        item => item.action === 'emit'));

    assert.ok(
      recorder.records().find(
        item => item.action === 'emitAsync'));

    const emitTrace =
      recorder.records().find(
        item => item.action === 'emit');

    assert.ok(emitTrace);

    assert.ok(
      Array.isArray(
        emitTrace.payload.listeners));

    assert.equal(
      emitTrace.payload.event,
      'e');

    assert.deepEqual(
      emitTrace.payload.args,
      [ 1,
        2 ]);

    const emitAsyncTrace =
      recorder.records().find(
        item => item.action === 'emitAsync');

    assert.ok(emitAsyncTrace);

    assert.ok(
      Array.isArray(
        emitAsyncTrace.payload.listeners));

    assert.equal(
      emitAsyncTrace.payload.event,
      'e');

    assert.deepEqual(
      emitAsyncTrace.payload.args,
      [ 3,
        4 ]);
  });

test(
  `${TEST_SUITE}: error hook runs for async rejection (non-strict)`,
  async () =>
  {
    let errors = 0;

    const obj =
      eventful(
        {},
        { error: () => errors += 1 });

    obj.on(
      'e',
      async () =>
      {
        throw new Error('reject');
      });

    await assert.doesNotReject(
      () => obj.emitAsync('e'));

    assert.equal(
      errors,
      1);
  });

test(
  `${TEST_SUITE}: once fires a listener only once`,
  () =>
  {
    const obj =
      eventful({});

    let calls = 0;

    obj.once(
      'e',
      () =>
      {
        calls += 1;
      });

    obj.emit('e');
    obj.emit('e');

    assert.equal(
      calls,
      1);

    assert.equal(
      obj.has('e'),
      false);
  });

test(
  `${TEST_SUITE}: off removes a once listener by its original function`,
  () =>
  {
    const obj =
      eventful({});

    let calls = 0;

    const listener =
      (): void =>
      {
      calls += 1;
    };

    obj.once(
      'e',
      listener);

    assert.equal(
      obj.off(
        'e',
        listener),
      true);

    assert.equal(
      obj.has('e'),
      false);

    obj.emit('e');

    assert.equal(
      calls,
      0);
  });

test(
  `${TEST_SUITE}: off reports false when the listener is not registered`,
  () =>
  {
    const obj =
      eventful({});

    obj.once(
      'e',
      () => { });

    assert.equal(
      obj.off(
        'e',
        () => { }),
      false);

    assert.equal(
      obj.has('e'),
      true);
  });

test(
  `${TEST_SUITE}: the unsubscribe closure of once is idempotent`,
  () =>
  {
    const obj =
      eventful({});

    const off =
      obj.once(
        'e',
        () => { });

    assert.equal(
      off(),
      true);

    assert.equal(
      off(),
      false);
  });

test(
  `${TEST_SUITE}: emit does not deliver to listeners added during dispatch`,
  () =>
  {
    const obj =
      eventful({});

    const calls: string[] = [ ];

    obj.on(
      'e',
      () =>
      {
        calls.push('first');

        obj.on(
          'e',
          () =>
          {
            calls.push('added');
          });
      });

    obj.emit('e');

    assert.deepEqual(
      calls,
      [ 'first' ]);

    obj.emit('e');

    assert.deepEqual(
      calls,
      [ 'first',
        'first',
        'added' ]);
  });

test(
  `${TEST_SUITE}: emit still delivers to a listener removed during dispatch`,
  () =>
  {
    const obj =
      eventful({});

    const calls: string[] = [ ];

    const second =
      (): void =>
      {
      calls.push('second');
    };

    obj.on(
      'e',
      () =>
      {
        calls.push('first');

        obj.off(
          'e',
          second);
      });

    obj.on(
      'e',
      second);

    obj.emit('e');

    assert.deepEqual(
      calls,
      [ 'first',
        'second' ]);

    obj.emit('e');

    assert.deepEqual(
      calls,
      [ 'first',
        'second',
        'first' ]);
  });

test(
  `${TEST_SUITE}: the global emitter observes emit on enhanced objects`,
  () =>
  {
    const seen: unknown[] = [ ];

    const off =
      eventful.on(
        'emit',
        (
            payload
          ) =>
        {
        seen.push(payload);
      });

    try {
      const obj =
        eventful({});

      obj.on(
        'e',
        () => { });

      obj.emit(
        'e',
        1);
    } finally {
      off();
    }

    assert.equal(
      seen.length > 0,
      true);
  });

test(
  `${TEST_SUITE}: emit reports whether the event had listeners`,
  () =>
  {
    const obj =
      eventful({});

    assert.equal(
      obj.emit('e'),
      false);

    const off =
      obj.on(
        'e',
        () => { });

    assert.equal(
      obj.emit('e'),
      true);

    off();

    assert.equal(
      obj.emit('e'),
      false);
  });

test(
  `${TEST_SUITE}: async emit reports whether the event had listeners`,
  async () =>
  {
    const obj =
      eventful({});

    assert.equal(
      await obj.emitAsync('e'),
      false);

    const off =
      obj.on(
        'e',
        async () => { });

    assert.equal(
      await obj.emitAsync('e'),
      true);

    off();

    assert.equal(
      await obj.emitAsync('e'),
      false);
  });

test(
  `${TEST_SUITE}: has reflects subscribe and unsubscribe`,
  () =>
  {
    const obj =
      eventful();

    assert.equal(
      obj.has('x'),
      false);

    const off =
      obj.on(
        'x',
        () => { });

    assert.equal(
      obj.has('x'),
      true);

    off();

    assert.equal(
      obj.has('x'),
      false);
  });

test(
  `${TEST_SUITE}: strict mode propagates async rejections`,
  async () =>
  {
    const obj =
      eventful(
        {},
        { error: () => { },
          strict: true });

    obj.on(
      'e',
      async () =>
      {
        throw new Error('nope');
      });

    await assert.rejects(
      () => obj.emitAsync('e'));
  });

test(
  `${TEST_SUITE}: emit does not throw when no error hook (non-strict)`,
  () =>
  {
    const off =
      eventful.on(
        'error',
        () => { });

    try {
      const obj =
        eventful();

      obj.on(
        'x',
        () =>
        {
          throw new Error('boom');
        });

      assert.doesNotThrow(
        () => obj.emit('x'));
    } finally {
      off();
    }
  });

test(
  `${TEST_SUITE}: an unconsumed listener error reaches the platform`,
  () =>
  {
    // The rethrow lands on the platform's unhandled-error channel, which in
    // node terminates the process, so it can only be observed from a child.
    const source =
      `import { eventful } from '${
      pathToFileURL(
        resolve(
          import.meta.dirname,
          'index.js')).href
    }';
       const obj = eventful({});
       obj.on('x', () => { throw new Error('unconsumed boom'); });
       obj.emit('x');
       console.log('emit returned');`;

    const result =
      spawnSync(
        process.execPath,
        [ '--input-type=module',
          '--eval',
          source ],
        { encoding: 'utf8' });

    assert.equal(
      result.stdout.includes('emit returned'),
      true);

    assert.equal(
      result.stderr.includes('unconsumed boom'),
      true);

    assert.notEqual(
      result.status,
      0);
  });

test(
  `${TEST_SUITE}: a consumed listener error does not reach the platform`,
  () =>
  {
    const source =
      `import { eventful } from '${
      pathToFileURL(
        resolve(
          import.meta.dirname,
          'index.js')).href
    }';
       const obj = eventful({}, { error: () => {} });
       obj.on('x', () => { throw new Error('consumed boom'); });
       obj.emit('x');
       console.log('emit returned');`;

    const result =
      spawnSync(
        process.execPath,
        [ '--input-type=module',
          '--eval',
          source ],
        { encoding: 'utf8' });

    assert.equal(
      result.stdout.includes('emit returned'),
      true);

    assert.equal(
      result.status,
      0);
  });

test(
  `${TEST_SUITE}: throw in global error listener does not loop`,
  () =>
  {
    let globalErrorCalls = 0;

    const off =
      eventful.on(
        'error',
        () =>
        {
        globalErrorCalls += 1;

        if (globalErrorCalls > 1) {
          throw new Error(
            'global error listener loop');
        }

        throw new Error('boom');
      });

    try {
      const obj =
        eventful();

      obj.on(
        'e',
        () =>
        {
          throw new Error('listener failed');
        });

      assert.throws(
        () => obj.emit('e'),
        Error);

      assert.equal(
        globalErrorCalls,
        1);
    } finally {
      off();
    }
  });

test(
  `${TEST_SUITE}: event must be string or symbol`,
  () =>
  {
    const obj =
      eventful();

    assert.throws(
      () =>
        obj.on(
          123 as unknown as never,
          () => { }),
      TypeError);

    assert.throws(
      () =>
        obj.emit(
          123 as unknown as never),
      TypeError);

    const s =
      Symbol('e');

    assert.doesNotThrow(
      () =>
        obj.on(
          s,
          () => { }));

    assert.doesNotThrow(
      () => obj.emit(s));
  });

type TraceRecord = {
  action: string;
  payload: {
    object: object | Function;
    event?: string | symbol;
    listener?: Function;
    listeners?: Function[];
    args?: unknown[];
  };
};

type Recorder = {
  write: (action: string, payload: TraceRecord['payload']) => void;
  records: () => TraceRecord[];
};

export function createRecorder(
  ): Recorder
{
  const records: TraceRecord[] = [ ];

  return { write:
             (
                 action: string,
                 payload: TraceRecord['payload']
               ): void =>
             {
      records.push(
        { action,
          payload });
    },
           records:
             (): TraceRecord[] => records };
}

test(
  `${TEST_SUITE}: trace reports the emitter identity and message context`,
  () =>
  {
    const traced: Array<Record<string, unknown>> = [ ];

    const cart =
      eventful(
        {},
        { trace:
            (
                action,
                payload
              ) =>
            {
          traced.push(
            { action,
              ...payload });
        } });

    cart.on(
      'checkout',
      () => { });

    cart.emit('checkout');

    const emitted =
      traced.find(
        entry => entry.action === 'emit');

    assert.ok(emitted);

    assert.equal(
      typeof emitted.id,
      'string');

    assert.equal(
      emitted.causationId,
      null);

    assert.equal(
      emitted.correlationId,
      emitted.messageId);
  });

test(
  `${TEST_SUITE}: an event emitted by a listener is caused by the first`,
  () =>
  {
    const emits: Array<Record<string, unknown>> = [ ];

    const trace =
      (
          action: string,
          payload: Record<string, unknown>
        ): void =>
      {
      if (action === 'emit') {
        emits.push(payload);
      }
    };

    const basket =
      eventful(
        {},
        { trace:
            trace as never });

    const cart =
      eventful(
        {},
        { trace:
            trace as never });

    basket.on(
      'stocked',
      () => { });

    cart.on(
      'checkout',
      () =>
      {
        basket.emit('stocked');
      });

    cart.emit('checkout');

    assert.equal(
      emits.length,
      2);

    const [first, second] = emits;

    assert.equal(
      second.causationId,
      first.messageId);

    assert.equal(
      second.correlationId,
      first.correlationId);

    assert.notEqual(
      second.id,
      first.id);
  });

test(
  `${TEST_SUITE}: a later, unrelated emit starts its own correlation`,
  () =>
  {
    const emits: Array<Record<string, unknown>> = [ ];

    const cart =
      eventful(
        {},
        { trace:
            (
                action,
                payload
              ) =>
            {
          if (action === 'emit') {
            emits.push(
              payload as unknown as Record<string, unknown>);
          }
        } });

    cart.on(
      'checkout',
      () => { });

    cart.emit('checkout');
    cart.emit('checkout');

    assert.notEqual(
      emits[1].correlationId,
      emits[0].correlationId);

    assert.equal(
      emits[1].causationId,
      null);
  });

test(
  `${TEST_SUITE}: off with no listener removes every listener of that event`,
  () =>
  {
    const calls: string[] = [ ];

    const obj =
      eventful({});

    obj.on(
      'a',
      () => calls.push('a1'));

    obj.on(
      'a',
      () => calls.push('a2'));

    obj.on(
      'b',
      () => calls.push('b1'));

    assert.equal(
      obj.off('a'),
      true);

    assert.equal(
      obj.has('a'),
      false);

    obj.emit('a');
    obj.emit('b');

    assert.deepEqual(
      calls,
      [ 'b1' ]);
  });

test(
  `${TEST_SUITE}: off with no listener is false when the event has none`,
  () =>
  {
    const obj =
      eventful({});

    assert.equal(
      obj.off('missing'),
      false);
  });

test(
  `${TEST_SUITE}: off with no listener removes a once listener`,
  () =>
  {
    let called = false;

    const obj =
      eventful({});

    obj.once(
      'a',
      () =>
      {
        called = true;
      });

    assert.equal(
      obj.off('a'),
      true);

    obj.emit('a');

    assert.equal(
      called,
      false);
  });

test(
  `${TEST_SUITE}: removeAllListeners clears every event`,
  () =>
  {
    const calls: string[] = [ ];

    const obj =
      eventful({});

    obj.on(
      'a',
      () => calls.push('a'));

    obj.on(
      'b',
      () => calls.push('b'));

    assert.equal(
      obj.removeAllListeners(),
      true);

    assert.equal(
      obj.has('a'),
      false);

    assert.equal(
      obj.has('b'),
      false);

    obj.emit('a');
    obj.emit('b');

    assert.deepEqual(
      calls,
      [ ]);
  });

test(
  `${TEST_SUITE}: removeAllListeners is false when there is nothing to remove`,
  () =>
  {
    const obj =
      eventful({});

    assert.equal(
      obj.removeAllListeners(),
      false);

    obj.on(
      'a',
      () => { });

    obj.removeAllListeners();

    assert.equal(
      obj.removeAllListeners(),
      false);
  });

test(
  `${TEST_SUITE}: an unsubscribe closure stays false after a bulk removal`,
  () =>
  {
    const obj =
      eventful({});

    const unsubscribe =
      obj.on(
        'a',
        () => { });

    obj.removeAllListeners();

    assert.equal(
      unsubscribe(),
      false);
  });

test(
  `${TEST_SUITE}: a bulk removal traces every listener it removes`,
  () =>
  {
    const offTraces: unknown[] = [ ];

    const obj =
      eventful(
        {},
        { trace:
            (
                action,
                payload
              ) =>
            {
          if (action === 'off') {
            offTraces.push(payload);
          }
        } });

    obj.on(
      'a',
      () => { });

    obj.on(
      'a',
      () => { });

    obj.removeAllListeners();

    assert.equal(
      offTraces.length,
      2);
  });

test(
  `${TEST_SUITE}: removeAllListeners cannot overwrite an existing method`,
  () =>
  {
    assert.throws(
      () =>
        eventful(
          { removeAllListeners:
              (): boolean => false }),
      /Method "removeAllListeners" already exists\./);
  });

test(
  `${TEST_SUITE}: enhancing a frozen object reports that it is frozen`,
  () =>
  {
    assert.throws(
      () =>
        eventful(
          Object.freeze(
            { name: 'x' })),
      { name: 'TypeError',
        message:
          'Expect an extensible object or function, but the object is frozen.' });
  });

test(
  `${TEST_SUITE}: enhancing a sealed object reports that it is sealed`,
  () =>
  {
    assert.throws(
      () =>
        eventful(
          Object.seal(
            { name: 'x' })),
      { name: 'TypeError',
        message:
          'Expect an extensible object or function, but the object is sealed.' });
  });

test(
  `${TEST_SUITE}: enhancing a non-extensible object says so`,
  () =>
  {
    assert.throws(
      () =>
        eventful(
          Object.preventExtensions(
            { name: 'x' })),
      { name: 'TypeError',
        message:
          'Expect an extensible object or function, but the object is not extensible.' });
  });

test(
  `${TEST_SUITE}: enhancing a frozen function reports that it is frozen`,
  () =>
  {
    assert.throws(
      () =>
        eventful(
          Object.freeze(
            function handler (): void
            {
            })),
      /but the object is frozen\./);
  });

test(
  `${TEST_SUITE}: a refused object is left untouched`,
  () =>
  {
    const frozen =
      Object.freeze(
        { name: 'x' });

    assert.throws(
      () => eventful(frozen));

    assert.deepEqual(
      Object.getOwnPropertyNames(frozen),
      [ 'name' ]);
  });

function countOffTraces(
    run: (
    obj: ReturnType<typeof eventful>
  ) => void
  ): number
{
  let offs = 0;

  const obj =
    eventful(
      {},
      { trace:
          (
              action
            ) =>
          {
        if (action === 'off') {
          offs += 1;
        }
      } });

  run(obj);

  return offs;
}

test(
  `${TEST_SUITE}: the unsubscribe closure reports the removal`,
  () =>
  {
    assert.equal(
      countOffTraces(
        (
            obj
          ) =>
        {
          const unsubscribe =
            obj.on(
              'x',
              () => { });

          unsubscribe();
        }),
      1);
  });

test(
  `${TEST_SUITE}: a once listener reports its automatic removal`,
  () =>
  {
    assert.equal(
      countOffTraces(
        (
            obj
          ) =>
        {
          obj.once(
            'x',
            () => { });

          obj.emit('x');
        }),
      1);
  });

test(
  `${TEST_SUITE}: a second unsubscribe reports nothing`,
  () =>
  {
    assert.equal(
      countOffTraces(
        (
            obj
          ) =>
        {
          const unsubscribe =
            obj.on(
              'x',
              () => { });

          unsubscribe();
          unsubscribe();
        }),
      1);
  });

test(
  `${TEST_SUITE}: removing a listener that was never added reports nothing`,
  () =>
  {
    assert.equal(
      countOffTraces(
        (
            obj
          ) =>
        {
          obj.off(
            'x',
            () => { });
        }),
      0);
  });

test(
  `${TEST_SUITE}: an unsubscribe after a bulk removal reports nothing extra`,
  () =>
  {
    assert.equal(
      countOffTraces(
        (
            obj
          ) =>
        {
          const unsubscribe =
            obj.on(
              'x',
              () => { });

          obj.off('x');
          unsubscribe();
        }),
      1);
  });

test(
  `${TEST_SUITE}: on and off balance across every removal path`,
  () =>
  {
    for (
      const [label, run] of [ [ 'method',
                                (
                                    obj: ReturnType<typeof eventful>
                                  ): void =>
                                {
          const listener =
            (): void => { };

          obj.on(
            'x',
            listener);

          obj.off(
            'x',
            listener);
        } ],
                              [ 'closure',
                                (
                                    obj: ReturnType<typeof eventful>
                                  ): void =>
                                {
          obj.on(
            'x',
            () => { })();
        } ],
                              [ 'once',
                                (
                                    obj: ReturnType<typeof eventful>
                                  ): void =>
                                {
          obj.once(
            'x',
            () => { });

          obj.emit('x');
        } ],
                              [ 'bulk',
                                (
                                    obj: ReturnType<typeof eventful>
                                  ): void =>
                                {
          obj.on(
            'x',
            () => { });

          obj.off('x');
        } ],
                              [ 'all',
                                (
                                    obj: ReturnType<typeof eventful>
                                  ): void =>
                                {
          obj.on(
            'x',
            () => { });

          obj.removeAllListeners();
        } ] ] as Array<[string, (obj: ReturnType<typeof eventful>) => void]>
    ) {
      let balance = 0;

      const obj =
        eventful(
          {},
          { trace:
              (
                  action
                ) =>
              {
            if (action === 'on') {
              balance += 1;
            } else if (action === 'off') {
              balance -= 1;
            }
          } });

      run(obj);

      assert.equal(
        balance,
        0,
        `${label} leaves the subscription count unbalanced`);
    }
  });
