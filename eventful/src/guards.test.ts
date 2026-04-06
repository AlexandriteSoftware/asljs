import test
  from 'node:test';
import assert
  from 'node:assert/strict';

import {
    eventNameTypeGuard,
    functionTypeGuard,
    isFunction,
    isObject,
  } from './guards.js';

test(
  'eventNameTypeGuard accepts string and symbol',
  () => {
    assert.doesNotThrow(
      () => eventNameTypeGuard('event'));

    assert.doesNotThrow(
      () => eventNameTypeGuard(Symbol('event')));
  });

test(
  'eventNameTypeGuard throws for invalid values',
  () => {
    assert.throws(
      () => eventNameTypeGuard(42),
      TypeError);

    assert.throws(
      () => eventNameTypeGuard(null),
      TypeError);
  });

test(
  'isFunction returns expected result',
  () => {
    assert.equal(
      isFunction(() => { }),
      true);

    assert.equal(
      isFunction({ }),
      false);
  });

test(
  'isObject returns expected result',
  () => {
    assert.equal(
      isObject({ key: 'value' }),
      true);

    assert.equal(
      isObject(null),
      false);

    assert.equal(
      isObject(() => { }),
      false);
  });

test(
  'functionTypeGuard validates value',
  () => {
    assert.doesNotThrow(
      () => functionTypeGuard(() => { }));

    assert.throws(
      () => functionTypeGuard('nope'),
      TypeError);
  });
