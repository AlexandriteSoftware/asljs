import { createTestLoggerProvider }
  from 'asljs-logging';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createEnvironment }
  from '../environment.js';
import { tmpDirFactory }
  from '../testing/tmpDir.js';
import { execVersion }
  from './version.js';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async (): Promise<void> =>
  {
    await loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

test(
  'version prints the current package version',
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

    await execVersion(
      environment);

    assert.match(
      environment.stdout.toString(),
      /\d+\.\d+\.\d+/);
  });
