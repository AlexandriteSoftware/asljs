import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { PinoLoggerProvider }
  from './pino-logger-provider.js';

test(
  'PinoLoggerProvider returns logger with silent level',
  () =>
  {
    const loggerProvider =
      new PinoLoggerProvider(
        { level: 'silent' });

    const logger =
      loggerProvider.getLogger();

    assert.equal(
      logger.level,
      'silent');
  });
