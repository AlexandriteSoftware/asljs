import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createLoggerProvider }
  from './logger.js';

test(
  'createLoggerProvider returns a provider that yields loggers',
  async () =>
  {
    const provider =
      createLoggerProvider(
        { level: 'silent' });

    const logger =
      provider.getLogger();

    assert.equal(
      typeof logger.trace,
      'function');

    await provider.dispose();
  });
