import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createTestContext,
         withLibrary }
  from '../testing/library.js';
import { execList }
  from './list.js';

const FILES =
  { 'notes/one.md': '# One\n',
    'readme.md': '# Readme\n' };

test(
  'list prints one path per line, folders with a trailing slash',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const context =
          createTestContext(library);

        await execList(context);

        assert.equal(
          context.environment.stdout.toString(),
          'notes/\nnotes/one.md\nreadme.md\n');
      });
  });

test(
  'list prints json when requested',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const context =
          createTestContext(library);

        await execList(
          context,
          { pattern: '**/*.md',
            kind: 'file',
            format: 'json' });

        const entries =
          JSON.parse(
            context.environment.stdout.toString()) as
            { path: string; }[];

        assert.deepEqual(
          entries.map(entry => entry.path),
          [ 'notes/one.md',
            'readme.md' ]);
      });
  });

test(
  'list reports the rejection the server makes',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        await assert.rejects(
          () =>
          execList(
            createTestContext(library),
            { kind: 'document' }),
          /must be file, folder or any/);
      });
  });
