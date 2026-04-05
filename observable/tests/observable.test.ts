import { eventful } from 'asljs-eventful';
import test from 'node:test';
import assert from 'node:assert/strict';
import { observable } from '../observable.js';
import { createTracer } from './tracer.js';

const CONTEXT_NAME = 'observable.test';

/**
 * Nested object fields should be observable by default so deep listeners can
 * subscribe without manual wrapping.
 */
test(
  `${CONTEXT_NAME}: observes nested objects by default`,
  async () => {
    const object =
      { a: { b: 1 } };

    const proxy =
      observable(object);

    let seenValue =
      0;

    (proxy.a as any).on(
      'set:b',
      ({ value }: any) => {
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
  `${CONTEXT_NAME}: defineProperty converts nested value in deep mode`,
  async () => {
    const proxy =
      observable(
        {} as { x?: { y: number; }; });

    Object.defineProperty(
      proxy,
      'x',
      { value: { y: 1 },
        writable: true,
        configurable: true,
        enumerable: true });

    let seenValue =
      0;

    (proxy.x as any).on(
      'set:y',
      ({ value }: any) => {
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
  `${CONTEXT_NAME}: shallow:true keeps nested objects non-observable`,
  async () => {
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
  `${CONTEXT_NAME}: observes nested objects inside arrays by default`,
  async () => {
    const object =
      { items: [ { name: 'A' } ] };

    const proxy =
      observable(object);

    let seenValue =
      '';

    (proxy.items[0] as any).on(
      'set:name',
      ({ value }: any) => {
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
  `${CONTEXT_NAME}: shallow:true keeps nested objects inside arrays non-observable`,
  async () => {
    const object =
      { items: [ { name: 'A' } ] };

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
  `${CONTEXT_NAME}: observable object set and keyed set events`,
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

/**
 * Defining fields at runtime should emit define events for both targeted and
 * broad observers.
 */
test(
  `${CONTEXT_NAME}: observable object define and keyed define events`,
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

/**
 * Removing a field must emit delete signals so dependent consumers can drop
 * stale state immediately.
 */
test(
  `${CONTEXT_NAME}: observable object delete and keyed delete events`,
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
