import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { readLoggerOptions,
         stripLoggerOptions }
  from './logger.js';

const TEST_SUITE = 'logger';

test(
  `${TEST_SUITE}: the logging options are read from anywhere in argv`,
  (): void =>
  {
    assert.deepEqual(
      readLoggerOptions(
        [ 'fint',
          '--exclude',
          'apps',
          '--loglevel',
          'trace' ]),
      { level: 'trace' });

    assert.deepEqual(
      readLoggerOptions(
        [ '--logfile=run.log',
          'run-all' ]),
      { file: 'run.log' });

    assert.deepEqual(
      readLoggerOptions(
        [ 'clean' ]),
      {});
  });

test(
  `${TEST_SUITE}: the logging options are removed from a command's arguments`,
  (): void =>
  {
    assert.deepEqual(
      stripLoggerOptions(
        [ '--exclude',
          'apps',
          '--loglevel',
          'trace',
          '--exclude',
          'libs' ]),
      [ '--exclude',
        'apps',
        '--exclude',
        'libs' ]);

    assert.deepEqual(
      stripLoggerOptions(
        [ '--logfile=run.log',
          'docs' ]),
      [ 'docs' ]);

    assert.deepEqual(
      stripLoggerOptions(
        [ 'docs' ]),
      [ 'docs' ]);
  });
