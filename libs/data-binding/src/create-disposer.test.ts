import assert
  from 'node:assert/strict';
import { test }
  from 'node:test';
import { createDisposer }
  from './create-disposer.js';

const TEST_SUITE = 'create-disposer';

test(
  `${TEST_SUITE}: runs once, returning true the first time and false after`,
  () =>
  {
    let calls = 0;

    const dispose =
      createDisposer(
        () =>
        {
        calls++;
      });

    assert.equal(
      dispose(),
      true);

    assert.equal(
      dispose(),
      false);

    assert.equal(
      calls,
      1);
  });

test(
  `${TEST_SUITE}: does not run again after the first run threw`,
  () =>
  {
    let calls = 0;

    const dispose =
      createDisposer(
        () =>
        {
        calls++;

        throw new Error('failed');
      });

    assert.throws(
      () => dispose(),
      /failed/);

    assert.equal(
      dispose(),
      false);

    assert.equal(
      calls,
      1);
  });
