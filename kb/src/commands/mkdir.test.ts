import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createTestContext,
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
        const context =
          createTestContext(library);

        await execMkdir(
          context,
          { path: 'archive/2026' });

        assert.equal(
          context.environment.stdout.toString(),
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
        const context =
          createTestContext(library);

        await execMkdir(
          context,
          { path: 'archive',
            format: 'json' });

        assert.equal(
          JSON.parse(
            context.environment.stdout.toString()).kind,
          'folder');
      });
  });
