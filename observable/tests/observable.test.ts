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
      observable<number>();

    let newValue: number | undefined;

    obj.on(
      'set',
      (v: any) => newValue = v.value);

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
        { eventful:
            (value: any) =>
              eventful(value, tracer) });

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

    const obj =
      observable(
        { a: 1 },
        { eventful:
            (value: any) =>
              eventful(value, tracer) });

    delete (obj as any).a;

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
        [ 1, 2 ],
        { eventful:
            (value: any) =>
              eventful(value, tracer) });

    arr[1] = 42;

    assert.deepEqual(
      tracer.getFirstEventParameters('set'),
      { property: '1', value: 42, previous: 2 });

    assert.deepEqual(
      tracer.getFirstEventParameters('set:1'),
      { property: '1', value: 42, previous: 2 });
  });

test(
  'observable array length set event',
  async () => {
    const tracer =
      createTracer();

    const arr =
      observable(
        [ 1, 2 ],
        { eventful:
            (value: any) =>
              eventful(value, tracer) });

    arr.length = 1;

    assert.deepEqual(
      tracer.getFirstEventParameters('set:length'),
      { property: 'length', value: 1, previous: 2 });
  });

test(
  'observable array keyed delete event',
  async () => {
    const tracer =
      createTracer();

    const arr =
      observable(
        [ 10, 20 ],
        { eventful:
            (value: any) =>
              eventful(value, tracer) });

    delete arr[1];

    assert.deepEqual(
      tracer.getFirstEventParameters('delete:1'),
      { property: '1', previous: 20 });
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
    getTracesByAction:
      (action: string) => TraceRecord[];
    getFirstTraceByAction:
      (action: string) => TraceRecord | undefined;
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
    getTracesByAction:
      (action: string): TraceRecord[] =>
        traces.filter(t => t.action === action),
    getFirstTraceByAction:
      (action: string): TraceRecord | undefined =>
        traces.find(t => t.action === action),
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
