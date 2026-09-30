import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import * as logging
  from './index.js';

test(
  'package root exposes the supported public API',
  () =>
  {
    assert.deepEqual(
      Object.keys(logging).sort(),
      [ 'NullLogger',
        'NullLoggerProvider',
        'PinoLoggerProvider',
        'PinoLoggerProviderOptionsBuilder' ]);
  });
