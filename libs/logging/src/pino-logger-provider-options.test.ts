import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { PinoLoggerProviderOptionsBuilder,
         resolveLogOutput }
  from './pino-logger-provider-options.js';

const noTerminals =
  { stdout: false,
    stderr: false };

const terminals =
  { stdout: true,
    stderr: true };

test(
  'PinoLoggerProviderOptionsBuilder is silent with nothing set',
  () =>
  {
    const options =
      new PinoLoggerProviderOptionsBuilder()
      .build();

    assert.equal(
      options.level,
      'silent');
  });

test(
  'PinoLoggerProviderOptionsBuilder logs at information when only a file is set',
  () =>
  {
    for (const file of [ 'app.log',
                         'stdout',
                         'stderr' ]) {
      const options =
        new PinoLoggerProviderOptionsBuilder()
        .withFile(file)
        .build();

      assert.equal(
        options.level,
        'information',
        file);
    }
  });

test(
  'PinoLoggerProviderOptionsBuilder keeps an explicit level over the file default',
  () =>
  {
    const options =
      new PinoLoggerProviderOptionsBuilder()
      .withFile('app.log')
      .withLevel('trace')
      .build();

    assert.equal(
      options.level,
      'trace');
  });

test(
  'PinoLoggerProviderOptionsBuilder rejects unknown levels and formats',
  () =>
  {
    assert.throws(
      () =>
        new PinoLoggerProviderOptionsBuilder()
          .withLevel('info'),
      /log level 'info' is invalid/);

    assert.throws(
      () =>
        new PinoLoggerProviderOptionsBuilder()
          .withFormat('colour'),
      /log format 'colour' is invalid/);
  });

test(
  'PinoLoggerProviderOptionsBuilder reads level, file and format from the environment',
  () =>
  {
    process.env.TEST_OPTIONS_LOG_LEVEL = 'debug';
    process.env.TEST_OPTIONS_LOG_FILE = 'stderr';
    process.env.TEST_OPTIONS_LOG_FORMAT = 'text';

    try {
      const options =
        new PinoLoggerProviderOptionsBuilder()
        .fromEnvironmentVariables('TEST_OPTIONS_LOG_')
        .build();

      assert.equal(
        options.level,
        'debug');

      assert.equal(
        options.file,
        'stderr');

      assert.equal(
        options.format,
        'text');
    } finally {
      delete process.env.TEST_OPTIONS_LOG_LEVEL;
      delete process.env.TEST_OPTIONS_LOG_FILE;
      delete process.env.TEST_OPTIONS_LOG_FORMAT;
    }
  });

test(
  'PinoLoggerProviderOptionsBuilder without stdout throws when a level targets stdout',
  () =>
  {
    assert.throws(
      () =>
        new PinoLoggerProviderOptionsBuilder()
          .withLevel('debug')
          .withoutStdout()
          .build(),
      /--logfile stderr/);

    assert.throws(
      () =>
        new PinoLoggerProviderOptionsBuilder()
          .withLevel('debug')
          .withFile('stdout')
          .withoutStdout()
          .build(),
      /--logfile stderr/);
  });

test(
  'PinoLoggerProviderOptionsBuilder without stdout accepts silence, stderr and files',
  () =>
  {
    new PinoLoggerProviderOptionsBuilder()
      .withoutStdout()
      .build();

    new PinoLoggerProviderOptionsBuilder()
      .withLevel('debug')
      .withFile('stderr')
      .withoutStdout()
      .build();

    new PinoLoggerProviderOptionsBuilder()
      .withLevel('debug')
      .withFile('app.log')
      .withoutStdout()
      .build();
  });

test(
  'resolveLogOutput maps stdout, stderr and paths to destinations',
  () =>
  {
    assert.equal(
      resolveLogOutput(
        {},
        noTerminals).destination,
      1);

    assert.equal(
      resolveLogOutput(
        { file: 'stdout' },
        noTerminals).destination,
      1);

    assert.equal(
      resolveLogOutput(
        { file: 'stderr' },
        noTerminals).destination,
      2);

    assert.equal(
      resolveLogOutput(
        { file: 'logs/app.log' },
        noTerminals).destination,
      'logs/app.log');
  });

test(
  'resolveLogOutput auto is pretty on a terminal and json elsewhere',
  () =>
  {
    assert.equal(
      resolveLogOutput(
        {},
        terminals).format,
      'pretty');

    assert.equal(
      resolveLogOutput(
        {},
        noTerminals).format,
      'json');

    assert.equal(
      resolveLogOutput(
        { file: 'stderr' },
        { stdout: false,
          stderr: true }).format,
      'pretty');

    assert.equal(
      resolveLogOutput(
        { file: 'stderr' },
        { stdout: true,
          stderr: false }).format,
      'json');

    assert.equal(
      resolveLogOutput(
        { file: 'app.log' },
        terminals).format,
      'json');
  });

test(
  'resolveLogOutput keeps an explicit format',
  () =>
  {
    assert.equal(
      resolveLogOutput(
        { format: 'json' },
        terminals).format,
      'json');

    assert.equal(
      resolveLogOutput(
        { format: 'text',
          file: 'app.log' },
        terminals).format,
      'text');

    assert.equal(
      resolveLogOutput(
        { format: 'pretty' },
        noTerminals).format,
      'pretty');
  });

test(
  'resolveLogOutput refuses pretty in a file',
  () =>
  {
    assert.throws(
      () =>
        resolveLogOutput(
          { format: 'pretty',
            file: 'app.log' },
          terminals),
      /Use 'text'/);
  });
