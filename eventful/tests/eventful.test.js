import test from 'node:test';
import assert from 'node:assert/strict';
import { eventful } from '../eventful.js';

test(
  'trace is called on creation with action "new"',
  () => {
    const traces = [];

    const obj =
      eventful(
        { },
        { trace:
            (object, action, payload) =>
              traces.push({ action, payload }) });

    assert.ok(
      traces.find(t => t.action === 'new'));

    const creation =
      traces.find(t => t.action === 'new');

    assert.equal(
      typeof creation.payload.object,
      'object');
  });

test(
  'eventful creates an empty event emitter object',
  () => {
    const obj =
      eventful();

    assert.ok(obj);
    assert.equal(typeof obj.on, 'function');
    assert.equal(typeof obj.off, 'function');
    assert.equal(typeof obj.emit, 'function');
    assert.equal(typeof obj.emitAsync, 'function');
    assert.equal(typeof obj.has, 'function');
  });

test(
  'eventful throws when an object has one of the event emitter methods',
  () => {
    for (const method of ['on', 'once', 'off', 'emit', 'emitAsync', 'has']) {
      assert.throws(
        () => eventful({ [method]: () => { } }));
    }
  });

test(
  'exceptions in listeners are suppressed by default',
  async () => {
    const obj =
      eventful(
        { },
        { error: () => { } });

    obj.on(
      'test',
      () => { throw new Error('test error'); });

    await assert.doesNotReject(
      () => obj.emitAsync('test'));
  });

test(
  'strict mode propagates exceptions in listeners',
  async () => {
    const obj =
      eventful(
        { },
        { error: () => { },
          strict: true });

    obj.on(
      'test',
      () => { throw new Error('test error'); });

    await assert.rejects(
      () => obj.emitAsync('test'));
  });

test(
  'async listener rejection is suppressed by default',
  async () => {
    const obj =
      eventful(
        { },
        { error: () => {} });

    obj.on(
      'test',
      async () => { throw new Error('async fail'); });

    await assert.doesNotReject(
      () => obj.emitAsync('test'));
  });

test(
  'non-strict runs other listeners even if one fails',
  async () => {
    const obj =
      eventful(
        { },
        { error: () => {} });

    let ran = 0;

    obj.on(
      'test',
      () => { ran += 1; });

    obj.on(
      'test',
      () => { throw new Error('boom'); });

    obj.on(
      'test',
      () => { ran += 1; });

    await assert.doesNotReject(
      () => obj.emitAsync('test'));

    assert.equal(ran, 2);
  });  

test(
  'trace receives safe payload and action names',
  async () => {
    const traces = [];
    const obj =
      eventful(
        { },
        { trace:
            (object, action, payload) =>
              traces.push({ action, payload }) });

    const off = obj.on('e', () => {});
    obj.emit('e', 1, 2);
    await obj.emitAsync('e', 3, 4);
    off();

    // Expect actions at least 'on', 'emit', 'emitAsync'
    const actions = traces.map(t => t.action);
    assert.ok(actions.includes('on'));
    assert.ok(actions.includes('emit'));
    assert.ok(actions.includes('emitAsync'));

    const emitTrace = traces.find(t => t.action === 'emit');
    assert.ok(Array.isArray(emitTrace.payload.listeners));
    assert.equal(emitTrace.payload.event, 'e');
    assert.deepEqual(emitTrace.payload.args, [1, 2]);

    const emitAsyncTrace = traces.find(t => t.action === 'emitAsync');
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
        { error: () => { errors += 1; } });

    obj.on('e', async () => { throw new Error('reject'); });

    await assert.doesNotReject(() => obj.emitAsync('e'));
    assert.equal(errors, 1);
  });

test(
  'has reflects subscribe and unsubscribe',
  () => {
    const obj = eventful();
    assert.equal(obj.has('x'), false);
    const off = obj.on('x', () => {});
    assert.equal(obj.has('x'), true);
    off();
    assert.equal(obj.has('x'), false);
  });

test(
  'strict mode propagates async rejections',
  async () => {
    const obj =
      eventful(
        { },
        { error: () => { }, strict: true });

    obj.on('e', async () => { throw new Error('nope'); });
    await assert.rejects(() => obj.emitAsync('e'));
  });