import { createTestLoggerProvider }
  from 'asljs-testing';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createEnvironment }
  from '../environment.js';
import { tmpDirFactory }
  from '../testing/tmpDir.js';
import { execConfig }
  from './config.js';

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
            workspace.resolve('definitions'),
          plugins:
            [ 'asljs-part/plugins/npm',
              'asljs-part/plugins/git' ] });

    await execConfig(
      environment);

    assert.match(
      environment.stdout.toString(),
      /Environment:/);

    assert.match(
      environment.stdout.toString(),
      /plugins=asljs-part\/plugins\/npm,asljs-part\/plugins\/git/);

    assert.match(
      environment.stdout.toString(),
      /PART_PLUGINS=/);
  });
