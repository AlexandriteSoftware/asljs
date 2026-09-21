import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createTestContext,
         withLibrary }
  from '../testing/library.js';
import { execSearch }
  from './search.js';

const FILES =
  { 'notes/one.md':
      '# One\n\nThe budget line.\n',
    'notes/two.md': '# Two\n' };

test(
  'search prints path, line and column per match',
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

        await execSearch(
          context,
          { query: 'budget' });

        assert.equal(
          context.environment.stdout.toString(),
          'notes/one.md:3:5: The budget line.\n');

        assert.equal(
          context.environment.exitCode,
          undefined);
      });
  });

test(
  'search sets the exit code when nothing matches',
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

        await execSearch(
          context,
          { query: 'missing' });

        assert.equal(
          context.environment.stdout.toString(),
          '');

        assert.equal(
          context.environment.exitCode,
          1);
      });
  });

test(
  'search prints the full report as json',
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

        await execSearch(
          context,
          { query: 'one',
            format: 'json' });

        const report =
          JSON.parse(
            context.environment.stdout.toString()) as
            { searchedFiles: number; matches: unknown[]; };

        assert.equal(
          report.searchedFiles,
          2);

        assert.equal(
          report.matches.length,
          1);
      });
  });

test(
  'search matches case-sensitively when requested',
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

        await execSearch(
          context,
          { query: 'BUDGET',
            caseSensitive: true });

        assert.equal(
          context.environment.exitCode,
          1);
      });
  });
