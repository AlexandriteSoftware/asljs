import { eventful } from 'asljs-eventful';
import test from 'node:test';
import assert from 'node:assert/strict';
import { observable } from '../observable.js';
import { createTracer } from './tracer.js';

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
