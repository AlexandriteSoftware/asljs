import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createLoggerProvider,
         createTestLoggerProvider,
         readLoggerOptions }
  from './create-logger-provider.js';
import { NullLoggerProvider }
  from './null-logger-provider.js';
import { PinoLoggerProvider }
  from './pino-logger-provider.js';

async function withEnv(
    updates: Record<string, string | undefined>,
    action: () => Promise<void>
  ): Promise<void>
{
  const previous = new Map<string, string | undefined>();

  for (const [name, value] of Object.entries(updates)) {
    previous.set(
      name,
      process.env[name]);

    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }

  try {
    await action();
  } finally {
    for (const [name, value] of previous) {
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  }
}

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
    await withEnv(
      { TEST_APP_LOG_LEVEL: undefined,
        TEST_APP_LOG_FILE: undefined },
      async () =>
      {
        const provider =
          createLoggerProvider('TEST_APP_LOG_');

        assert.ok(
          provider instanceof NullLoggerProvider);
      });
  });

test(
  'createLoggerProvider lets overrides win over the environment',
  async () =>
  {
    await withEnv(
      { TEST_APP_LOG_LEVEL: 'debug' },
      async () =>
      {
        const provider =
          createLoggerProvider(
            'TEST_APP_LOG_',
            { level: 'silent' });

        assert.ok(
          provider instanceof NullLoggerProvider);
      });
  });

test(
  'createLoggerProvider logs when the environment sets a level',
  async () =>
  {
    await withEnv(
      { TEST_APP_LOG_LEVEL: 'error',
        TEST_APP_LOG_FILE: 'stderr' },
      async () =>
      {
        const provider =
          createLoggerProvider('TEST_APP_LOG_');

        assert.ok(
          provider instanceof PinoLoggerProvider);

        assert.equal(
          provider.getLogger().level,
          'error');

        await provider.dispose();
      });
  });

test(
  'createLoggerProvider refuses stdout when allowStdout is false',
  async () =>
  {
    await withEnv(
      { TEST_APP_LOG_LEVEL: undefined,
        TEST_APP_LOG_FILE: undefined },
      async () =>
      {
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
  });

test(
  'createTestLoggerProvider is silent when the environment says so',
  async () =>
  {
    await withEnv(
      { TEST_SUITE_LOG_LEVEL: 'silent' },
      async () =>
      {
        assert.ok(
          createTestLoggerProvider('TEST_SUITE_LOG_')
            instanceof NullLoggerProvider);
      });
  });

test(
  'createTestLoggerProvider logs at debug by default',
  async () =>
  {
    await withEnv(
      { TEST_SUITE_LOG_LEVEL: undefined,
        TEST_SUITE_LOG_FILE: 'stderr',
        TEST_SUITE_LOG_FORMAT: undefined },
      async () =>
      {
        const provider =
          createTestLoggerProvider('TEST_SUITE_LOG_');

        assert.equal(
          provider.getLogger().level,
          'debug');

        await provider.dispose();
      });
  });
