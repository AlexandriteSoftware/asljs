import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createTestEnvironment,
         withLibrary }
  from '../testing/library.js';
import { execRemove }
  from './remove.js';

test(
  'remove deletes a file and prints its path',
  async () =>
  {
    await withLibrary(
      { 'one.md': '# One\n' },
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        await execRemove(
          environment,
          { path: 'one.md' });

        assert.equal(
          environment.stdout.toString(),
          'one.md\n');
      });
  });

test(
  'remove requires recursive for a non-empty folder',
  async () =>
  {
    await withLibrary(
      { 'notes/one.md': '# One\n' },
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        await assert.rejects(
          () =>
          execRemove(
            environment,
            { path: 'notes' }),
          /not empty/);

        await execRemove(
          environment,
          { path: 'notes',
            recursive: true,
            format: 'json' });

        assert.deepEqual(
          JSON.parse(
            environment.stdout.toString()),
          { path: 'notes' });
      });
  });
