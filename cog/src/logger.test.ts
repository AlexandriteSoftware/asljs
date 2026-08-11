import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createLoggerProvider }
  from './logger.js';

test(
  'createLoggerProvider defaults to silent logger',
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
      false);

    assert.strictEqual(
      logger.isLevelEnabled('warn'),
      false);

    assert.strictEqual(
      logger.isLevelEnabled('error'),
      false);

    void loggerProvider.dispose();
  });
