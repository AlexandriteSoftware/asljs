import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import test
  from 'node:test';
import { createTestEnvironment,
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
        const environment =
          createTestEnvironment(library);

        await execCopy(
          environment,
          { source: 'one.md',
            target: 'archive/one.md' });

        assert.equal(
          environment.stdout.toString(),
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
        const environment =
          createTestEnvironment(library);

        await execCopy(
          environment,
          { source: 'one.md',
            target: 'two.md',
            format: 'json' });

        assert.deepEqual(
          JSON.parse(
            environment.stdout.toString()),
          { source: 'one.md',
            target: 'two.md' });
      });
  });
