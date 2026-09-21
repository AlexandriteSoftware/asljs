import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createTestEnvironment,
         withLibrary }
  from '../testing/library.js';
import { execMkdir }
  from './mkdir.js';

test(
  'mkdir creates the folder and prints its path',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        await execMkdir(
          environment,
          { path: 'archive/2026' });

        assert.equal(
          environment.stdout.toString(),
          'archive/2026\n');
      });
  });

test(
  'mkdir prints the entry as json',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        await execMkdir(
          environment,
          { path: 'archive',
            format: 'json' });

        assert.equal(
          JSON.parse(
            environment.stdout.toString()).kind,
          'folder');
      });
  });
