// Identical copies, kept in sync byte for byte:
// - libs/logging/src/testing/tmp-env.test.ts
// - libs/testing/src/tmp-env.test.ts
// Together with the copies they test, they cover asljs-testing RQ003.

import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { TmpEnv }
  from './tmp-env.js';

const NAME =
  'ASLJS_TESTING_TMP_ENV';

const OTHER =
  'ASLJS_TESTING_TMP_ENV_OTHER';

test.afterEach(
  () =>
  {
    delete process.env[NAME];
    delete process.env[OTHER];
  });

test(
  'TmpEnv sets the variables and restores their previous values',
  () =>
  {
    process.env[NAME] = 'before';

    const env =
      new TmpEnv(
        { [NAME]: 'during' });

    assert.equal(
      process.env[NAME],
      'during');

    env.restore();

    assert.equal(
      process.env[NAME],
      'before');
  });

test(
  'TmpEnv removes a variable that did not exist before',
  () =>
  {
    const env =
      new TmpEnv(
        { [NAME]: 'during' });

    env.restore();

    assert.equal(
      NAME in process.env,
      false);
  });

test(
  'TmpEnv removes a variable set to undefined, and restores it',
  () =>
  {
    process.env[NAME] = 'before';

    const env =
      new TmpEnv(
        { [NAME]: undefined });

    assert.equal(
      NAME in process.env,
      false);

    env.restore();

    assert.equal(
      process.env[NAME],
      'before');
  });

test(
  'TmpEnv restores at the end of a using block',
  () =>
  {
    {
      using env =
        new TmpEnv(
          { [NAME]: 'during' });

      assert.equal(
        process.env[NAME],
        'during');
    }

    assert.equal(
      NAME in process.env,
      false);
  });

test(
  'TmpEnv.set adds a variable that is restored with the others',
  () =>
  {
    process.env[OTHER] = 'before';

    const env =
      new TmpEnv(
        { [NAME]: 'during' });

    env.set(
      OTHER,
      'during');

    env.set(
      OTHER,
      'later');

    env.restore();

    assert.equal(
      NAME in process.env,
      false);

    assert.equal(
      process.env[OTHER],
      'before');
  });

test(
  'TmpEnv.restore reports whether it did anything',
  () =>
  {
    const env =
      new TmpEnv(
        { [NAME]: 'during' });

    assert.equal(
      env.restore(),
      true);

    process.env[NAME] = 'after';

    assert.equal(
      env.restore(),
      false);

    assert.equal(
      process.env[NAME],
      'after');
  });

test(
  'TmpEnv.set throws after restore',
  () =>
  {
    const env =
      new TmpEnv({});

    env.restore();

    assert.throws(
      () =>
        env.set(
          NAME,
          'late'),
      /already been restored/);
  });
