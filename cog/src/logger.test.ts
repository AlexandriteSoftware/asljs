import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createLoggerProvider }
  from './logger.js';

test(
  'createLoggerProvider defaults to information',
  () =>
  {
    const loggerProvider =
      createLoggerProvider();

    const logger =
      loggerProvider.getLogger();

    assert.strictEqual(
      logger.isLevelEnabled('trace'),
      false);

    assert.strictEqual(
      logger.isLevelEnabled('debug'),
      false);

    assert.strictEqual(
      logger.isLevelEnabled('info'),
      true);

    assert.strictEqual(
      logger.isLevelEnabled('warn'),
      true);

    assert.strictEqual(
      logger.isLevelEnabled('error'),
      true);

    void loggerProvider.dispose();
  });
