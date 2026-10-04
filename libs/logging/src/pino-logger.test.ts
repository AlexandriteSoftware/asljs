import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import pino
  from 'pino';
import { PinoLogger }
  from './pino-logger.js';

function createLogger(
    level: string = 'trace'
  ): { logger: PinoLogger; records: Record<string, unknown>[]; }
{
  const records: Record<string, unknown>[] = [ ];

  const stream =
    { write(
        line: string
      ): void
      {
        records.push(
          JSON.parse(line));
      } };

  const pinoLevel =
    level === 'information'
    ? 'info'
    : level;

  const logger =
    new PinoLogger(
      pino(
        { base: null,
          timestamp: false,
          level: pinoLevel },
        stream),
      level);

  return { logger,
           records };
}

test(
  'PinoLogger writes a message on its own',
  () =>
  {
    const { logger, records } =
      createLogger();

    logger.information('started');

    assert.deepEqual(
      records,
      [ { level: 30,
          msg: 'started' } ]);
  });

test(
  'PinoLogger interpolates printf values',
  () =>
  {
    const { logger, records } =
      createLogger();

    logger.debug(
      'found %d file(s) in %s',
      3,
      '/work');

    assert.deepEqual(
      records,
      [ { level: 20,
          msg:
            'found 3 file(s) in /work' } ]);
  });

test(
  'PinoLogger writes leading fields into the record',
  () =>
  {
    const { logger, records } =
      createLogger();

    logger.information(
      { port: 8080,
        env: 'test' },
      'listening on %s',
      'http://localhost:8080');

    assert.deepEqual(
      records,
      [ { level: 30,
          port: 8080,
          env: 'test',
          msg:
            'listening on http://localhost:8080' } ]);
  });

test(
  'PinoLogger writes fields without a message',
  () =>
  {
    const { logger, records } =
      createLogger();

    logger.trace(
      { step: 'scan' });

    assert.deepEqual(
      records,
      [ { level: 10,
          step: 'scan' } ]);
  });

test(
  'PinoLogger serializes a leading Error as err',
  () =>
  {
    const { logger, records } =
      createLogger();

    logger.error(
      new TypeError('boom'),
      'request failed');

    const [ record ] = records;

    assert.equal(
      record.msg,
      'request failed');

    const err =
      record.err as Record<string, unknown>;

    assert.equal(
      err.type,
      'TypeError');

    assert.equal(
      err.message,
      'boom');

    assert.match(
      String(err.stack),
      /TypeError: boom/);
  });

test(
  'PinoLogger keeps a trailing object that no placeholder consumes',
  () =>
  {
    const { logger, records } =
      createLogger();

    logger.information(
      'started',
      { port: 1 });

    assert.deepEqual(
      records,
      [ { level: 30,
          port: 1,
          msg: 'started' } ]);
  });

test(
  'PinoLogger keeps a trailing Error as err',
  () =>
  {
    const { logger, records } =
      createLogger();

    logger.warning(
      'retrying %s',
      'upload',
      new Error('timeout'));

    const [ record ] = records;

    assert.equal(
      record.msg,
      'retrying upload');

    assert.equal(
      (record.err as Record<string, unknown>).message,
      'timeout');
  });

test(
  'PinoLogger leaves an object consumed by a placeholder in the message',
  () =>
  {
    const { logger, records } =
      createLogger();

    logger.debug(
      'files: %o',
      { count: 2 });

    assert.deepEqual(
      records,
      [ { level: 20,
          msg:
            'files: {"count":2}' } ]);
  });

test(
  'PinoLogger does not count an escaped %% as a placeholder',
  () =>
  {
    const { logger, records } =
      createLogger();

    logger.information(
      '100%% done',
      { task: 'build' });

    // pino unescapes %% only when it has values to interpolate.
    assert.deepEqual(
      records,
      [ { level: 30,
          task: 'build',
          msg: '100%% done' } ]);
  });

test(
  'PinoLogger writes nothing below its level',
  () =>
  {
    const { logger, records } =
      createLogger('information');

    logger.debug(
      'hidden',
      { port: 1 });

    assert.deepEqual(
      records,
      [ ]);
  });
