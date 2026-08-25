import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createPinoLoggerProvider }
  from './pino-logger-provider.js';

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
