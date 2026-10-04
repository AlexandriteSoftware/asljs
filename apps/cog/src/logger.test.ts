import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createLoggerProvider }
  from './logger.js';

test(
  'createLoggerProvider is silent by default',
  async () =>
  {
    const previous =
      process.env.COG_LOG_LEVEL;

    delete process.env.COG_LOG_LEVEL;

    try {
      const loggerProvider =
        createLoggerProvider();

      assert.strictEqual(
        loggerProvider.getLogger().level,
        'silent');

      await loggerProvider.dispose();
    } finally {
      if (previous !== undefined) {
        process.env.COG_LOG_LEVEL = previous;
      }
    }
  });

test(
  'createLoggerProvider logs at the level it is given',
  async () =>
  {
    const loggerProvider =
      createLoggerProvider(
        { level: 'debug',
          file: 'stderr' });

    const logger =
      loggerProvider.getLogger();

    assert.strictEqual(
      logger.isLevelEnabled('trace'),
      false);

    assert.strictEqual(
      logger.isLevelEnabled('debug'),
      true);

    await loggerProvider.dispose();
  });

test(
  'createLoggerProvider refuses stdout when the caller does not allow it',
  () =>
  {
    assert.throws(
      () =>
        createLoggerProvider(
          { level: 'debug' },
          { allowStdout: false }),
      /--logfile stderr/);
  });
