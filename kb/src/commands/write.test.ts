import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import test
  from 'node:test';
import { createTestEnvironment,
         withLibrary }
  from '../testing/library.js';
import { execWrite }
  from './write.js';

test(
  'write stores the content and prints the path',
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

        await execWrite(
          environment,
          { path: 'notes/one.md',
            content: '# One\n' });

        assert.equal(
          environment.stdout.toString(),
          'notes/one.md\n');

        assert.equal(
          await fs.readFile(
            library.resolve('notes/one.md'),
            'utf8'),
          '# One\n');
      });
  });

test(
  'write reads standard input when no content is given',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(
            library,
            { readInput:
                () => Promise.resolve('# Piped\n') });

        await execWrite(
          environment,
          { path: 'one.md' });

        assert.equal(
          await fs.readFile(
            library.resolve('one.md'),
            'utf8'),
          '# Piped\n');
      });
  });

test(
  'write reports missing content when there is no input',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        await assert.rejects(
          () =>
          execWrite(
            createTestEnvironment(library),
            { path: 'one.md' }),
          /No content provided/);
      });
  });
