import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { readLoggerOptions }
  from './logger-options.js';
import { argv }
  from './test-helpers.js';

test(
  'reads logging options from separate and inline arguments',
  () =>
  {
    assert.deepEqual(
      readLoggerOptions(
        argv(
          'find-todo',
          '--loglevel',
          'trace',
          '--logfile',
          'test.log')),
      { level: 'trace',
        file: 'test.log' });

    assert.deepEqual(
      readLoggerOptions(
        argv(
          'find-todo',
          '--loglevel=debug')),
      { level: 'debug' });
  });

test(
  'returns no options when logging arguments are absent or incomplete',
  () =>
  {
    assert.deepEqual(
      readLoggerOptions(
        argv(
          'find-todo')),
      {});

    assert.deepEqual(
      readLoggerOptions(
        argv(
          'find-todo',
          '--loglevel')),
      {});
  });
