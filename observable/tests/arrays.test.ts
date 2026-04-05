import { eventful } from 'asljs-eventful';
import test from 'node:test';
import assert from 'node:assert/strict';
import { observable } from '../observable.js';
import { createTracer } from './tracer.js';

const CONTEXT_NAME = 'arrays.test';

/**
 * Changing an item index should emit index-aware payloads so consumers can
 * update only the affected entry.
 */
test(
  `${CONTEXT_NAME}: observable array index set, property set`,
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

/**
 * Trimming a collection through length should emit a property payload for
 * aggregate consumers such as counters.
 */
test(
  `${CONTEXT_NAME}: observable array length set event`,
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

/**
 * Deleting an item index must emit delete metadata while preserving native
 * sparse-array length behavior.
 */
test(
  `${CONTEXT_NAME}: observable array keyed delete event`,
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

/**
 * Keys like '01' are metadata keys, not canonical numeric indexes, and should
 * therefore use property-style payloads.
 */
test(
  `${CONTEXT_NAME}: observable array non-canonical numeric-like key uses property payload`,
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

