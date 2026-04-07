import test
  from 'node:test';
import assert
  from 'node:assert/strict';

import {
    functionTypeGuard,
    isFunction,
    isObject,
  } from './guards.js';

test(
  'guards: isFunction detects functions',
  () => {
    assert.equal(
      isFunction(() => { }),
      true);

    assert.equal(
      isFunction({ }),
      false);
  });

test(
  'guards: isObject detects non-null objects only',
  () => {
    assert.equal(
      isObject({ a: 1 }),
      true);

    assert.equal(
      isObject(null),
      false);

    assert.equal(
      isObject(() => { }),
      false);
  });

test(
  'guards: functionTypeGuard throws for non-functions',
  () => {
    assert.doesNotThrow(
      () => functionTypeGuard(() => { }));

    assert.throws(
      () => functionTypeGuard(1),
      /Expect a function\./);
  });
