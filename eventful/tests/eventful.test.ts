import test from 'node:test';
import assert from 'node:assert/strict';

import {
  eventful
} from '../eventful.js';

test(
  'eventful extends an object',
  () => {
    const original = { };

    const enhanced =
      eventful(original);

    assert.equal(
      enhanced,
      original);

    assert.equal(typeof enhanced.on, 'function');
    assert.equal(typeof enhanced.off, 'function');
    assert.equal(typeof enhanced.emit, 'function');
    assert.equal(typeof enhanced.emitAsync, 'function');
    assert.equal(typeof enhanced.has, 'function');
  });

test(
  'eventful extends a function',
  () => {
    const original =
      (): void => { };

    const enhanced =
      eventful(original);

    assert.equal(
      enhanced,
      original);

    assert.equal(typeof enhanced.on, 'function');
    assert.equal(typeof enhanced.off, 'function');
    assert.equal(typeof enhanced.emit, 'function');
    assert.equal(typeof enhanced.emitAsync, 'function');
    assert.equal(typeof enhanced.has, 'function');
  });

test(
  'eventful can be called without arguments',
  () => {
    const enhanced =
      eventful();

    assert.ok(enhanced !== null);

    assert.equal(typeof enhanced.on, 'function');
    assert.equal(typeof enhanced.off, 'function');
    assert.equal(typeof enhanced.emit, 'function');
    assert.equal(typeof enhanced.emitAsync, 'function');
    assert.equal(typeof enhanced.has, 'function');
  });

test(
  'trace is called on creation with action "new"',
  () => {
    const tracer =
      createTracer();

    const object =
      eventful(
        { },
        tracer);

    const creation =
      tracer.getFirstTraceByAction('new');

    assert.ok(creation);

    assert.equal(
      creation.payload.object,
      object);
  });

test(
  'global trace is called on creation with action "new"',
  () => {
    const tracer =
      createTracer();

    const off =
      eventful.on(
        'new',
        args => tracer.trace('new', args));

    try {
      const object =
        eventful(
          { },
          tracer);

      const creation =
        tracer.getFirstTraceByAction('new');

      assert.ok(creation);

      assert.equal(
        creation.payload.object,
        object);
    } finally {
      off();
    }
  });

test(
  'eventful throws when an object has one of the event emitter methods',
  () => {
    for (const method of [ 'on', 'once', 'off', 'emit', 'emitAsync', 'has']) {
      assert.throws(
        () =>
          eventful({
            [method]: () => { }
          }));
    }
  });

test(
  'exceptions in listeners are suppressed in async emit by default',
  async () => {
    const obj =
      eventful();

    obj.on(
      'test',
      () => { throw new Error('test error'); });

    await assert.doesNotReject(
      () => obj.emitAsync('test'));
  });

test(
  'exceptions in listeners are suppressed in emit by default',
  () => {
    const obj =
      eventful();

    obj.on(
      'test',
      () => { throw new Error('test error'); });

    assert.doesNotThrow(
      () => obj.emit('test'));
  });

test(
  'strict mode propagates exceptions in listeners in async emit',
  async () => {
    const obj =
      eventful(
        { },
        { error: () => { },
          strict: true });

    obj.on(
      'test',
      () => { throw new Error('test error'); });

    await assert.rejects(() => obj.emitAsync('test'));
  });

test(
  'strict mode propagates exceptions in listeners in emit',
  () => {
    const obj =
      eventful(
        { },
        { error: () => { },
          strict: true });

    obj.on(
      'test',
      () => { throw new Error('test error'); });

    assert.throws(
      () => obj.emit('test'),
      Error);
  });

test(
  'non-strict runs other listeners even if one fails',
  async () => {
    const obj =
      eventful(
        { },
        { error: () => { } });

    let ran = 0;

    obj.on(
      'test',
      () => ran += 1);

    obj.on(
      'test',
      () => { throw new Error('boom'); });

    obj.on(
      'test',
      () => ran += 1);

    await assert.doesNotReject(
      () => obj.emitAsync('test'));

    assert.equal(ran, 2);
  });

test(
  'trace receives safe payload and action names',
  async () => {
    const tracer =
      createTracer();

    const obj =
      eventful(
        { },
        tracer);

    const off =
      obj.on(
        'e',
        () => { });
    obj.emit('e', 1, 2);
    await obj.emitAsync('e', 3, 4);
    off();

    assert.ok(tracer.getFirstTraceByAction('on'));
    assert.ok(tracer.getFirstTraceByAction('emit'));
    assert.ok(tracer.getFirstTraceByAction('emitAsync'));

    const emitTrace =
      tracer.getFirstTraceByAction('emit');

    assert.ok(emitTrace);

    assert.ok(Array.isArray(emitTrace.payload.listeners));
    assert.equal(emitTrace.payload.event, 'e');
    assert.deepEqual(emitTrace.payload.args, [1, 2]);

    const emitAsyncTrace =
      tracer.getFirstTraceByAction('emitAsync');

    assert.ok(emitAsyncTrace);

    assert.ok(Array.isArray(emitAsyncTrace.payload.listeners));
    assert.equal(emitAsyncTrace.payload.event, 'e');
    assert.deepEqual(emitAsyncTrace.payload.args, [3, 4]);
  });

test(
  'error hook runs for async rejection (non-strict)',
  async () => {
    let errors = 0;

    const obj =
      eventful(
        { },
        { error: () => errors += 1 });

    obj.on(
      'e',
      async () => { throw new Error('reject'); });

    await assert.doesNotReject(
      () => obj.emitAsync('e'));

    assert.equal(errors, 1);
  });

test(
  'has reflects subscribe and unsubscribe',
  () =>  {
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
  'strict mode propagates async rejections',
  async () => {
    const obj =
      eventful(
        { },
        { error: () => { },
          strict: true });

    obj.on(
      'e',
      async () => { throw new Error('nope'); });

    await assert.rejects(
      () => obj.emitAsync('e'));
  });

test(
  'emit ignores errors when no error hook (non-strict)',
  () => {
    const obj =
      eventful();

    obj.on(
      'x',
      () => { throw new Error('boom'); });

    assert.doesNotThrow(
      () => obj.emit('x'));
  });

test(
  'throw in global error listener does not loop',
  () => {
    let globalErrorCalls = 0;

    const off =
      eventful.on(
        'error',
        () => {
          globalErrorCalls += 1;
          if (globalErrorCalls > 1)
            throw new Error('global error listener loop');
          throw new Error('boom');
        });

    try {
      const obj =
        eventful();

      obj.on(
        'e',
        () => { throw new Error('listener failed'); });

      assert.throws(
        () => obj.emit('e'),
        Error);

      assert.equal(globalErrorCalls, 1);
    } finally {
      off();
    }
  });

test(
  'event must be string or symbol',
  () => {
    const obj =
      eventful();

    assert.throws(
      () => obj.on(123 as any, () => {}),
      TypeError);

    assert.throws(
      () => obj.emit(123 as any),
      TypeError);

    const s =
      Symbol('e');

    assert.doesNotThrow(
      () => obj.on(s, () => { }));

    assert.doesNotThrow(
      () => obj.emit(s));
  });

type TraceRecord = {
  action: string;
  payload: any;
};

type Tracer = {
  trace: (action: any, payload: any) => void;
  getTraces: () => TraceRecord[];
  getTracesByAction: (action: string) => TraceRecord[];
  getFirstTraceByAction: (action: string) => TraceRecord | undefined;
};

function createTracer(): Tracer {
  const traces: TraceRecord[] = [];

  return {
    trace:
      (action: any, payload: any): void => {
        traces.push({ action, payload });
      },
    getTraces:
      (): TraceRecord[] => traces,
    getTracesByAction:
      (action: string): TraceRecord[] =>
        traces.filter(t => t.action === action),
    getFirstTraceByAction:
      (action: string): TraceRecord | undefined =>
        traces.find(t => t.action === action),
  };
}
