import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    createRecorder
  } from './recorder.js';
import {
  eventful
} from '../eventful.js';

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
    const recorder =
      createRecorder();

    const obj =
      eventful(
        { },
        { trace: recorder.write });

    const off =
      obj.on(
        'e',
        () => { });
    obj.emit('e', 1, 2);
    await obj.emitAsync('e', 3, 4);
    off();

    assert.ok(recorder.records().find(item => item.action === 'on'));
    assert.ok(recorder.records().find(item => item.action === 'emit'));
    assert.ok(recorder.records().find(item => item.action === 'emitAsync'));

    const emitTrace =
      recorder.records().find(item => item.action === 'emit');

    assert.ok(emitTrace);

    assert.ok(Array.isArray(emitTrace.payload.listeners));
    assert.equal(emitTrace.payload.event, 'e');
    assert.deepEqual(emitTrace.payload.args, [1, 2]);

    const emitAsyncTrace =
      recorder.records().find(item => item.action === 'emitAsync');

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

      assert.equal(
        globalErrorCalls,
        1);
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
      () =>
        obj.on(
          123 as any,
          () => {}),
      TypeError);

    assert.throws(
      () =>
        obj.emit(123 as any),
      TypeError);

    const s =
      Symbol('e');

    assert.doesNotThrow(
      () =>
        obj.on(
          s,
          () => { }));

    assert.doesNotThrow(
      () =>
        obj.emit(s));
  });
