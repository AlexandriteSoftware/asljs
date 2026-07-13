import assert
  from 'node:assert/strict';
import test,
       { after }
  from 'node:test';
import { createEnvironment }
  from '../environment.js';
import { createPinoLoggerProvider }
  from '../logging/pino.js';
import { tmpDirFactory }
  from '../testing/tmpDir.js';
import { execVersion }
  from './version.js';

const loggerProvider =
  createPinoLoggerProvider();

after(
  () =>
  {
    loggerProvider.dispose();
  }
);

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
        {
        loggerProvider,
        cwd: workspace.path,
        definitions: workspace.resolve('definitions')
      });

    await execVersion(
      environment
    );

    assert.match(
      environment.stdout.toString(),
      /\d+\.\d+\.\d+/
    );
  }
);
