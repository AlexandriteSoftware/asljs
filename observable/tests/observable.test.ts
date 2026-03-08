import { eventful } from 'asljs-eventful';
import test from 'node:test';
import assert from 'node:assert/strict';
import { observable } from '../observable.js';

test(
  'observable number',
  async () => {
    const obj =
      observable(42);

    let newValue: number | undefined;

    obj.on(
      'set',
      (v: any) => newValue = v.value);

    obj.value = 43;

    assert.strictEqual(newValue, 43);
  });

test(
  'observable <empty>',
  async () => {
    const obj =
      observable();

    let newValue: any;

    obj.on(
      'set',
      (v: any) => newValue = v.value);

    obj.value = 43;

    assert.strictEqual(
      newValue,
      43);
  });

test(
  'not observing nested objects',
  async () => {
    const tracer =
      createTracer();

    const object =
      { a: { b: 1 } };

    const proxy =
      observable(
        object,
        { eventful:
            (value: any) =>
              eventful(value, tracer) });

    proxy.a.b = 2;

    const traces =
      tracer.getMinimalTraces();

    assert.deepEqual(
      traces,
      [ { action: 'new', payload: { object } } ]);
  });

test(
  'throws when eventful option is not a function',
  async () => {
    assert.throws(
      () =>
        observable(
          { a: 1 },
          { eventful: 123 as any }),
      /Expect a function\./);
  });

test(
  'observable object set and keyed set events',
  async () => {
    const tracer =
      createTracer();

    const object =
      { a: 1 };

    const proxy =
      observable(
        object,
        { eventful:
            (value: any) =>
              eventful(value, tracer) });

    proxy.a = 2;

    const traces =
      tracer.getMinimalTraces();

    assert.deepEqual(
      traces,
      [ { action: 'new', payload: { object } },
        { action: 'emit', payload: { object, event: 'define:a' } },
        { action: 'emit', payload: { object, event: 'define' } },
        { action: 'emit', payload: { object, event: 'set:a', args: [ { previous: 1, property: 'a', value: 2 } ] } },
        { action: 'emit', payload: { object, event: 'set', args: [ { previous: 1, property: 'a', value: 2 } ] } } ]);
  });

test(
  'observable object define and keyed define events',
  async () => {
    const tracer =
      createTracer();

    const obj =
      observable(
        { a: 1 },
        { eventful:
            (value: any) =>
              eventful(value, tracer) });

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

    const object =
      { a: 1 };

    const obj =
      observable(
        object,
        { eventful:
            (value: any) =>
              eventful(value, tracer) });

    delete (obj as any).a;

    const traces =
      tracer.getMinimalTraces();

    assert.deepEqual(
      traces,
      [ { action: 'new', payload: { object } },
        { action: 'emit', payload: { object, event: 'delete:a', args: [ { previous: 1, property: 'a' } ] } },
        { action: 'emit', payload: { object, event: 'delete', args: [ { previous: 1, property: 'a' } ] } } ]);
  });

test(
  'observable array index set, property set',
  async () => {
    const tracer =
      createTracer();

    const array = [ 1, 2 ];

    const arr =
      observable(
        array,
        { eventful:
            (value: any) =>
              eventful(value, tracer) });

    arr['0'] = 10;
    arr[1] = 20;
    (arr as any).test1 = 30;

    const traces =
      tracer.getMinimalTraces();

    assert.deepEqual(
      traces,
      [ { action: 'new', payload: { object: array } },
        { action: 'emit', payload: { object: array, event: 'set:0', args: [ { previous: 1, index: 0, value: 10 } ] } },
        { action: 'emit', payload: { object: array, event: 'set', args: [ { previous: 1, index: 0, value: 10 } ] } },
        { action: 'emit', payload: { object: array, event: 'set:1', args: [ { previous: 2, index: 1, value: 20 } ] } },
        { action: 'emit', payload: { object: array, event: 'set', args: [ { previous: 2, index: 1, value: 20 } ] } },
        { action: 'emit', payload: { object: array, event: 'define:test1' } },
        { action: 'emit', payload: { object: array, event: 'define' } },
        { action: 'emit', payload: { object: array, event: 'set:test1', args: [ { previous: undefined, property: 'test1', value: 30 } ] } },
        { action: 'emit', payload: { object: array, event: 'set', args: [ { previous: undefined, property: 'test1', value: 30 } ] } } ]);
  });

test(
  'observable array length set event',
  async () => {
    const tracer =
      createTracer();

    const array =
      [ 1, 2];

    const arr =
      observable(
        array,
        { eventful:
            (value: any) =>
              eventful(value, tracer) });

    // setting length does not delete items
    arr.length = 1;

    const traces =
      tracer.getMinimalTraces();

    assert.deepEqual(
      traces,
      [ { action: 'new', payload: { object: array } },
        { action: 'emit', payload: { object: array, event: 'set:length', args: [ { previous: 2, property: 'length', value: 1 } ] } },
        { action: 'emit', payload: { object: array, event: 'set', args: [ { previous: 2, property: 'length', value: 1 } ] } } ]);
  });

test(
  'observable array keyed delete event',
  async () => {
    const tracer =
      createTracer();

    const array =
      [ 10, 20 ];

    const arr =
      observable(
        array,
        { eventful:
            (value: any) =>
              eventful(value, tracer) });

    // deleting items does not change length
    delete arr[1];

    const traces =
      tracer.getMinimalTraces();

    assert.equal(
      arr.length,
      2);

    assert.deepEqual(
      traces,
      [ { action: 'new', payload: { object: array } },
        { action: 'emit', payload: { object: array, event: 'delete:1', args: [ { previous: 20, index: 1 } ] } },
        { action: 'emit', payload: { object: array, event: 'delete', args: [ { previous: 20, index: 1 } ] } } ]);
  });

test(
  'observable array non-canonical numeric-like key uses property payload',
  async () => {
    const tracer =
      createTracer();

    const array =
      [ 1, 2 ];

    const arr =
      observable(
        array,
        { eventful:
            (value: any) =>
              eventful(value, tracer) });

    (arr as any)['01'] = 99;

    const traces =
      tracer.getMinimalTraces();

    assert.deepEqual(
      traces,
      [ { action: 'new', payload: { object: array } },
        { action: 'emit', payload: { object: array, event: 'define:01' } },
        { action: 'emit', payload: { object: array, event: 'define' } },
        { action: 'emit', payload: { object: array, event: 'set:01', args: [ { previous: undefined, property: '01', value: 99 } ] } },
        { action: 'emit', payload: { object: array, event: 'set', args: [ { previous: undefined, property: '01', value: 99 } ] } } ]);
  });

type TraceRecord = {
  action: string;
  payload: any;
};

type Tracer =
  {
    trace:
      (action: any, payload: any) => void;
    clear:
      () => void;
    getTraces:
      () => TraceRecord[];
    getMinimalTraces:
      () => TraceRecord[];
    getFirstEventParameters:
      (action: string) => any;
  };

function createTracer(): Tracer {
  const traces: TraceRecord[] = [];

  return {
    trace:
      (action: any, payload: any): void => {
        traces.push({ action, payload });
      },
    clear:
      () => traces.splice(0, traces.length),
    getTraces:
      (): TraceRecord[] => traces,
    getMinimalTraces:
      () => {
        const result: any[] = [];
        for (const { action, payload } of traces) {
          switch (action) {
            case 'emit':
              const emitPayload =
                Object.assign({ }, payload);

              delete emitPayload.listeners;
              
              if (payload.event === 'define'
                  || payload.event.match(/^define:/))
              {
                delete emitPayload.args;
              }

              result.push({ action, payload: emitPayload });
              break;
            default:
              result.push({ action, payload });
              break;
          }
        }
        return result;
      },
    getFirstEventParameters:
      (event: string): any => {
        const found =
          traces.find(
            t =>
              t.action === 'emit'
              && t.payload?.event === event);

        assert.ok(
          found,
          `No emit trace found for event ${String(event)}`);

        return found.payload.args[0];
      }
  };
}
