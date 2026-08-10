import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createEnvironment }
  from '../environment.js';
import { createPinoLoggerProvider }
  from '../logging/pino.js';
import { tmpDirFactory }
  from '../testing/tmpDir.js';
import { execConfig }
  from './config.js';

const loggerProvider =
  createPinoLoggerProvider();

test.after(
  (): void =>
  {
    loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

test(
  'config prints the current package configuration',
  async () =>
  {
    await using workspace =
      tmpDir();

    const environment =
      createEnvironment(
        { loggerProvider,
          cwd: workspace.path,
          definitions:
            workspace.resolve('definitions') });

    await execConfig(
      environment);

    assert.match(
      environment.stdout.toString(),
      /Environment:/);
  });
