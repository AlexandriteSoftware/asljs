import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { formatConfig }
  from './config.js';

test(
  'formatConfig prints current settings and environment variables',
  () =>
  {
    const output =
      formatConfig(
        { envelopePath:
            '/work/envelope.json',
          logLevel: 'debug',
          logFile: '/work/cog.log' },
        { COG_LOG_LEVEL: 'debug',
          COG_LOG_FILE: '/work/cog.log',
          COG_ENVELOPE_PATH:
            '/work/envelope.json' });

    assert.equal(
      output,
      [ 'Environment:',
        '  envelope=/work/envelope.json',
        '  logLevel=debug',
        '  logFile=/work/cog.log',
        '',
        'Environment Variables:',
        '  COG_LOG_LEVEL=debug',
        '  COG_LOG_FILE=/work/cog.log',
        '  COG_ENVELOPE_PATH=/work/envelope.json',
        '' ].join(
          '\n'));
  });

test(
  'formatConfig prints empty environment variables when not set',
  () =>
  {
    const output =
      formatConfig(
        { envelopePath: '',
          logLevel: 'silent',
          logFile: '' },
        {});

    assert.match(
      output,
      /Environment Variables:/);

    assert.match(
      output,
      /COG_ENVELOPE_PATH=/);
  });
