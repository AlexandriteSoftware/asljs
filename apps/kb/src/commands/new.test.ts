import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import test
  from 'node:test';
import { createTestContext,
         withLibrary }
  from '../testing/library.js';
import { execNew }
  from './new.js';

test(
  'new creates a note and prints its path',
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

        await execNew(
          context,
          { path: 'notes/idea',
            title: 'An idea',
            tags:
              [ 'inbox' ] });

        assert.equal(
          context.environment.stdout.toString(),
          'notes/idea.md\n');

        const text =
          await fs.readFile(
            library.resolve('notes/idea.md'),
            'utf8');

        assert.match(
          text,
          /^title: An idea$/m);

        assert.match(
          text,
          /^# An idea$/m);
      });
  });

test(
  'new prints the entry as json',
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

        await execNew(
          context,
          { path: 'one.md',
            format: 'json' });

        assert.equal(
          JSON.parse(
            context.environment.stdout.toString()).path,
          'one.md');
      });
  });
