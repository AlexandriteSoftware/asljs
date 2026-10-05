import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createLoggerProvider,
         readLoggerOptions }
  from './create-logger-provider.js';
import { NullLoggerProvider }
  from './null-logger-provider.js';
import { PinoLoggerProvider }
  from './pino-logger-provider.js';
import { TmpEnv }
  from './testing/tmp-env.js';

test(
  'readLoggerOptions reads the three options in both forms',
  () =>
  {
    assert.deepEqual(
      readLoggerOptions(
        [ 'node',
          'tool',
          '--loglevel',
          'debug',
          '--logfile=stderr',
          '--logformat',
          'json' ]),
      { level: 'debug',
        file: 'stderr',
        format: 'json' });

    assert.deepEqual(
      readLoggerOptions(
        [ 'list' ]),
      {});
  });

test(
  'createLoggerProvider is silent by default',
  async () =>
  {
    using env =
      new TmpEnv(
        { TEST_APP_LOG_LEVEL: undefined,
          TEST_APP_LOG_FILE: undefined });

    const provider =
      createLoggerProvider('TEST_APP_LOG_');

    assert.ok(
      provider instanceof NullLoggerProvider);
  });

test(
  'createLoggerProvider lets overrides win over the environment',
  async () =>
  {
    using env =
      new TmpEnv(
        { TEST_APP_LOG_LEVEL: 'debug' });

    const provider =
      createLoggerProvider(
        'TEST_APP_LOG_',
        { level: 'silent' });

    assert.ok(
      provider instanceof NullLoggerProvider);
  });

test(
  'createLoggerProvider logs when the environment sets a level',
  async () =>
  {
    using env =
      new TmpEnv(
        { TEST_APP_LOG_LEVEL: 'error',
          TEST_APP_LOG_FILE: 'stderr' });

    const provider =
      createLoggerProvider('TEST_APP_LOG_');

    assert.ok(
      provider instanceof PinoLoggerProvider);

    assert.equal(
      provider.getLogger().level,
      'error');

    await provider.dispose();
  });

test(
  'createLoggerProvider refuses stdout when allowStdout is false',
  async () =>
  {
    using env =
      new TmpEnv(
        { TEST_APP_LOG_LEVEL: undefined,
          TEST_APP_LOG_FILE: undefined });

    assert.throws(
      () =>
        createLoggerProvider(
          'TEST_APP_LOG_',
          { level: 'debug' },
          { allowStdout: false }),
      /--logfile stderr/);

    assert.ok(
      createLoggerProvider(
        'TEST_APP_LOG_',
        {},
        { allowStdout: false }) instanceof NullLoggerProvider);
  });
