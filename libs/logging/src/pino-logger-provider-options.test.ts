import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { PinoLoggerProviderOptionsBuilder }
  from './pino-logger-provider-options.js';

test(
  'PinoLoggerProviderOptionsBuilder builds options with default values',
  () =>
  {
    const builder =
      new PinoLoggerProviderOptionsBuilder();

    const options =
      builder.build();

    assert.equal(
      options.level,
      'information');
  });
