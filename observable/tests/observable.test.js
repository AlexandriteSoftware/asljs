import test from 'node:test';
import assert from 'node:assert/strict';
import { observable } from '../observable.js';
import { trace } from 'node:console';

test(
  'observable number',
  async () => {
    const obj =
      observable(42);

    let newValue;

    obj.on(
      'set',
      v => newValue = v.value);

    obj.value = 43;

    assert.strictEqual(newValue, 43);
  });

test(
  'observable <empty>',
  async () => {
    const obj =
      observable();

    let newValue;

    obj.on(
      'set',
      v => newValue = v.value);

    obj.value = 43;

    assert.strictEqual(
      newValue,
      43);
  });

test(
  'observable object set and keyed set events',
  async () => {
    const tracer =
      createTracer();

    const obj =
      observable(
        { a: 1 },
        { eventfulOptions: { trace: tracer.trace }});

    obj.a = 2;

    assert.deepEqual(
      tracer.getFirstEventParameters('set'),
      { property: 'a', value: 2, previous: 1 });

    assert.deepEqual(
      tracer.getFirstEventParameters('set:a'),
      { property: 'a', value: 2, previous: 1 });
  });

test(
  'observable object define and keyed define events',
  async () => {
    const tracer =
      createTracer();

    const obj =
      observable(
        { a: 1 },
        { eventfulOptions: { trace: tracer.trace }});

    Object.defineProperty(
      obj,
      'a',
      { value: 3,
        writable: true,
        configurable: true,
        enumerable: true });

    const eventParameters =
      { property: 'a',
        descriptor: {
          value: 3,
          writable: true,
          enumerable: true,
          configurable: true },
        previous: {
          value: 1,
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

test(
  'observable object delete and keyed delete events',
  async () => {
    const tracer =
      createTracer();

    const obj =
      observable(
        { a: 1 },
        { eventfulOptions: { trace: tracer.trace }});

    delete obj.a;

    console.log(tracer.getFirstEventParameters('delete'));

    const eventParameters =
      { property: 'a',
        previous: 1 };

    assert.deepEqual(
      tracer.getFirstEventParameters('delete'),
      eventParameters);

    assert.deepEqual(
      tracer.getFirstEventParameters('delete:a'),
      eventParameters);
  });

test(
  'observable array index set and keyed set events',
  async () => {
    const tracer =
      createTracer();

    const arr =
      observable(
        [1, 2],
        { eventfulOptions: { trace: tracer.trace } });

    arr[1] = 42;

    assert.deepEqual(
      tracer.getFirstEventParameters('set'),
      { property: '1', value: 42, previous: 2 });

    assert.deepEqual(
      tracer.getFirstEventParameters('set:1'),
      { property: '1', value: 42, previous: 2 });
  }
);

test(
  'observable array length set event',
  async () => {
    const tracer =
      createTracer();

    const arr =
      observable(
        [1, 2],
        { eventfulOptions: { trace: tracer.trace } });

    arr.length = 1;

    assert.deepEqual(
      tracer.getFirstEventParameters('set:length'),
      { property: 'length', value: 1, previous: 2 });
  }
);

test(
  'observable array keyed delete event',
  async () => {
    const tracer =
      createTracer();

    const arr =
      observable(
        [10, 20],
        { eventfulOptions: { trace: tracer.trace } });

    delete arr[1];

    assert.deepEqual(
      tracer.getFirstEventParameters('delete:1'),
      { property: '1', previous: 20 });
  }
);

function createTracer() {
  const traces =
    [];

  return {
    trace:
      (object, action, payload) =>
        traces.push(
          { object,
            action,
            payload }),
    clear:
      () => traces.splice(0, traces.length),
    getTraces:
      () => traces,
    getTracesByAction:
      action =>
        traces.filter(
          t => t.action === action),
    getFirstTraceByAction:
      action =>
        traces.find(
          t => t.action === action),
    getFirstEventParameters:
      event =>
        traces
          .find(
            t =>
              t.action === 'emit'
              && t.payload?.event === event)
          .payload
          .args[0]
  };
}
