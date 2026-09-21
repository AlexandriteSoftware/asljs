import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createTestEnvironment,
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
        const environment =
          createTestEnvironment(library);

        await execSearch(
          environment,
          { query: 'budget' });

        assert.equal(
          environment.stdout.toString(),
          'notes/one.md:3:5: The budget line.\n');

        assert.equal(
          environment.exitCode,
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
        const environment =
          createTestEnvironment(library);

        await execSearch(
          environment,
          { query: 'missing' });

        assert.equal(
          environment.stdout.toString(),
          '');

        assert.equal(
          environment.exitCode,
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
        const environment =
          createTestEnvironment(library);

        await execSearch(
          environment,
          { query: 'one',
            format: 'json' });

        const report =
          JSON.parse(
            environment.stdout.toString()) as
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
        const environment =
          createTestEnvironment(library);

        await execSearch(
          environment,
          { query: 'BUDGET',
            caseSensitive: true });

        assert.equal(
          environment.exitCode,
          1);
      });
  });
