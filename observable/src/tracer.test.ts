import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    createTracer,
  } from './tracer.js';

const TEST_SUITE =
  'tracer';

test(
  `${TEST_SUITE}: stores and clears traces`,
  () => {
    const tracer =
      createTracer();

    tracer.trace(
      'new',
      { object: { id: 1 } });

    assert.equal(
      tracer.getTraces().length,
      1);

    tracer.clear();

    assert.equal(
      tracer.getTraces().length,
      0);
  });

test(
  `${TEST_SUITE}: getMinimalTraces strips listeners and define args`,
  () => {
    const tracer =
      createTracer();

    tracer.trace(
      'emit',
      { event: 'set:a',
        listeners: [() => { }],
        args: [ { value: 2 } ] });

    tracer.trace(
      'emit',
      { event: 'define:a',
        listeners: [() => { }],
        args: [ { value: 3 } ] });

    const minimal =
      tracer.getMinimalTraces();

    assert.equal(
      Object.prototype
        .hasOwnProperty
        .call(
          minimal[0].payload,
          'listeners'),
      false);

    assert.equal(
      Object.prototype
        .hasOwnProperty
        .call(
          minimal[1].payload,
          'listeners'),
      false);

    assert.equal(
      Object.prototype
        .hasOwnProperty
        .call(
          minimal[1].payload,
          'args'),
      false);
  });

test(
  `${TEST_SUITE}: getFirstEventParameters returns first emit arg`,
  () => {
    const tracer =
      createTracer();

    tracer.trace(
      'emit',
      { event: 'set:a',
        args: [ { value: 42 } ] });

    assert.deepEqual(
      tracer.getFirstEventParameters('set:a'),
      { value: 42 });

    assert.throws(
      () => tracer.getFirstEventParameters('set:b'),
      /No emit trace found/);
  });
