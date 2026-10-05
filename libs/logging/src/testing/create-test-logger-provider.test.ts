// Identical copies, kept in sync; everything below the imports must match:
// - libs/logging/src/testing/create-test-logger-provider.test.ts
// - libs/testing/src/create-test-logger-provider.test.ts
// Together with the copies they test, they cover asljs-testing RQ006.
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { NullLoggerProvider }
  from '../null-logger-provider.js';
import { createTestLoggerProvider }
  from './create-test-logger-provider.js';
import { TmpEnv }
  from './tmp-env.js';

test(
  'createTestLoggerProvider is silent when the environment says so',
  () =>
  {
    using env =
      new TmpEnv(
        { TEST_SUITE_LOG_LEVEL: 'silent' });

    assert.ok(
      createTestLoggerProvider('TEST_SUITE_LOG_')
        instanceof NullLoggerProvider);
  });

test(
  'createTestLoggerProvider logs at debug by default',
  async () =>
  {
    using env =
      new TmpEnv(
        { TEST_SUITE_LOG_LEVEL: undefined,
          TEST_SUITE_LOG_FILE: 'stderr',
          TEST_SUITE_LOG_FORMAT: undefined });

    const provider =
      createTestLoggerProvider('TEST_SUITE_LOG_');

    assert.equal(
      provider.getLogger().level,
      'debug');

    await provider.dispose();
  });

test(
  'createTestLoggerProvider takes the level from the environment',
  async () =>
  {
    using env =
      new TmpEnv(
        { TEST_SUITE_LOG_LEVEL: 'warning',
          TEST_SUITE_LOG_FILE: 'stderr' });

    const provider =
      createTestLoggerProvider('TEST_SUITE_LOG_');

    assert.equal(
      provider.getLogger().level,
      'warning');

    await provider.dispose();
  });
