import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import os
  from 'node:os';
import path
  from 'node:path';
import test
  from 'node:test';
import { NullLogger }
  from './null-logger.js';
import { PinoLoggerProvider }
  from './pino-logger-provider.js';

async function withDirectory(
    action: (directory: string) => Promise<void>
  ): Promise<void>
{
  const directory =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        'asljs-logging-'));

  try {
    await action(directory);
  } finally {
    await fs.rm(
      directory,
      { recursive: true,
        force: true });
  }
}

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

test(
  'PinoLoggerProvider starts no transport when silent',
  async () =>
  {
    const loggerProvider =
      new PinoLoggerProvider(
        { level: 'silent' });

    assert.ok(
      loggerProvider.getLogger('x') instanceof NullLogger);

    await loggerProvider.dispose();
  });

test(
  'PinoLoggerProvider writes json lines with context and base fields to a file',
  async () =>
  {
    await withDirectory(
      async (
          directory
        ) =>
      {
        const file =
          path.join(
            directory,
            'logs',
            'app.log');

        const loggerProvider =
          new PinoLoggerProvider(
            { level: 'information',
              file,
              base:
                { service: 'test' } });

        loggerProvider
          .getLogger('http')
          .information(
            { port: 8080 },
            'listening');

        loggerProvider
          .getLogger('http')
          .debug('hidden');

        await loggerProvider.dispose();

        const lines =
          (await fs.readFile(
            file,
            'utf8'))
          .trim()
          .split('\n');

        assert.equal(
          lines.length,
          1);

        const record =
          JSON.parse(lines[0]);

        assert.equal(
          record.service,
          'test');

        assert.equal(
          record.context,
          'http');

        assert.equal(
          record.port,
          8080);

        assert.equal(
          record.msg,
          'listening');
      });
  });

test(
  'PinoLoggerProvider writes plain text lines without colour codes',
  async () =>
  {
    await withDirectory(
      async (
          directory
        ) =>
      {
        const file =
          path.join(
            directory,
            'app.log');

        const loggerProvider =
          new PinoLoggerProvider(
            { level: 'information',
              file,
              format: 'text' });

        loggerProvider
          .getLogger('http')
          .information('listening');

        await loggerProvider.dispose();

        const content =
          await fs.readFile(
            file,
            'utf8');

        assert.match(
          content,
          /INFO.*http: listening/);

        assert.doesNotMatch(
          content,
          /\u001b\[/);
      });
  });

test(
  'PinoLoggerProvider refuses pretty in a file',
  () =>
  {
    assert.throws(
      () =>
        new PinoLoggerProvider(
          { level: 'information',
            file: 'app.log',
            format: 'pretty' }),
      /Use 'text'/);
  });

test(
  'PinoLoggerProvider refuses stdout when allowStdout is false',
  () =>
  {
    assert.throws(
      () =>
        new PinoLoggerProvider(
          { level: 'debug',
            allowStdout: false }),
      /--logfile stderr/);
  });

test(
  'PinoLoggerProvider dispose can be called twice',
  async () =>
  {
    await withDirectory(
      async (
          directory
        ) =>
      {
        const loggerProvider =
          new PinoLoggerProvider(
            { level: 'information',
              file:
                path.join(
                  directory,
                  'app.log') });

        await loggerProvider.dispose();
        await loggerProvider.dispose();
      });
  });
