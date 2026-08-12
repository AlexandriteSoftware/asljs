import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createPinoLoggerProvider,
         NullLogger }
  from './logging.js';

test(
  'null logger enables only silent level',
  () =>
  {
    const logger =
      new NullLogger();

    assert.equal(
      logger.isLevelEnabled(
        'silent'),
      true);

    assert.equal(
      logger.isLevelEnabled(
        'trace'),
      false);
  });

test(
  'factory returns null provider for silent level',
  () =>
  {
    const loggerProvider =
      createPinoLoggerProvider(
        { level: 'silent' });

    const logger =
      loggerProvider.getLogger();

    assert.equal(
      logger.level,
      'silent');
  });
