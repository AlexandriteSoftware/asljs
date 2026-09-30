import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { functionTypeGuard,
         isFunction,
         isObject,
         isPlainObject }
  from './guards.js';

const TEST_SUITE = 'guards';

test(
  `${TEST_SUITE}: isFunction detects functions`,
  () =>
  {
    assert.equal(
      isFunction(
        () => { }),
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
        () => { }),
      false);
  });

test(
  `${TEST_SUITE}: functionTypeGuard throws for non-functions`,
  () =>
  {
    assert.doesNotThrow(
      () =>
        functionTypeGuard(
          () => { }));

    assert.throws(
      () => functionTypeGuard(1),
      /Expect a function\./);
  });

test(
  `${TEST_SUITE}: isPlainObject accepts literals and null prototypes`,
  () =>
  {
    assert.equal(
      isPlainObject({}),
      true);

    assert.equal(
      isPlainObject(
        Object.create(null)),
      true);
  });

test(
  `${TEST_SUITE}: isPlainObject rejects arrays, built-ins and instances`,
  () =>
  {
    class Instance
    {}

    for (
      const value of [ [ ],
                       new Date(),
                       new Map(),
                       new Set(),
                       /x/,
                       new Uint8Array(1),
                       new Instance(),
                       null,
                       1,
                       'a',
                       undefined ]
    ) {
      assert.equal(
        isPlainObject(value),
        false,
        `expected ${String(value)} to be rejected`);
    }
  });
