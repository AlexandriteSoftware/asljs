import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import test
  from 'node:test';
import { createTestContext,
         withLibrary }
  from '../testing/library.js';
import { execCopy }
  from './copy.js';

test(
  'copy duplicates a file and prints the transfer',
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

        await execCopy(
          context,
          { source: 'one.md',
            target: 'archive/one.md' });

        assert.equal(
          context.environment.stdout.toString(),
          'one.md -> archive/one.md\n');

        assert.equal(
          await fs.readFile(
            library.resolve('archive/one.md'),
            'utf8'),
          '# One\n');
      });
  });

test(
  'copy prints the transfer as json',
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

        await execCopy(
          context,
          { source: 'one.md',
            target: 'two.md',
            format: 'json' });

        assert.deepEqual(
          JSON.parse(
            context.environment.stdout.toString()),
          { source: 'one.md',
            target: 'two.md' });
      });
  });
