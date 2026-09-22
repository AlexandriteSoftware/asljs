import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createEnvironment }
  from '../environment.js';
import { execVersion,
         packageVersion }
  from './version.js';

test(
  'version prints the current package version',
  async () =>
  {
    const environment =
      createEnvironment();

    await execVersion(environment);

    assert.match(
      environment.stdout.toString(),
      /^\d+\.\d+\.\d+\n$/);
  });

test(
  'packageVersion reads the package manifest',
  () =>
  {
    assert.match(
      packageVersion(),
      /^\d+\.\d+\.\d+$/);
  });
