import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { functionTypeGuard,
         isFunction,
         isObject }
  from './guards.js';

const TEST_SUITE = 'guards';

test(
  `${TEST_SUITE}: isFunction detects functions`,
  () =>
  {
    assert.equal(
      isFunction(
        () =>
        {}),
      true);

    assert.equal(
      isFunction({}),
      false);
  });

test(
  `${TEST_SUITE}: isObject detects non-null objects only`,
  () =>
  {
    assert.equal(
      isObject(
        { a: 1 }),
      true);

    assert.equal(
      isObject(null),
      false);

    assert.equal(
      isObject(
        () =>
        {}),
      false);
  });

test(
  `${TEST_SUITE}: functionTypeGuard throws for non-functions`,
  () =>
  {
    assert.doesNotThrow(
      () =>
        functionTypeGuard(
          () =>
          {}));

    assert.throws(
      () => functionTypeGuard(1),
      /Expect a function\./);
  });
