import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createTestContext,
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
        const context =
          createTestContext(library);

        await execRemove(
          context,
          { path: 'one.md' });

        assert.equal(
          context.environment.stdout.toString(),
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
        const context =
          createTestContext(library);

        await assert.rejects(
          () =>
          execRemove(
            context,
            { path: 'notes' }),
          /not empty/);

        await execRemove(
          context,
          { path: 'notes',
            recursive: true,
            format: 'json' });

        assert.deepEqual(
          JSON.parse(
            context.environment.stdout.toString()),
          { path: 'notes' });
      });
  });
