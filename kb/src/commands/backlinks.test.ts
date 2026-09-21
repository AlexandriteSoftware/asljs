import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createTestEnvironment,
         withLibrary }
  from '../testing/library.js';
import { execBacklinks }
  from './backlinks.js';

const FILES =
  { 'notes/budget.md': '# Budget\n',
    'notes/plan.md':
      '# Plan\n\nSee [the budget](budget.md).\n',
    'inbox/quick.md':
      '# Quick\n\nAlso [[budget]].\n' };

test(
  'backlinks prints path, line, column, kind and target',
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

        await execBacklinks(
          environment,
          { path: 'notes/budget.md' });

        assert.equal(
          environment.stdout.toString(),
          [ 'inbox/quick.md:3:6: wiki budget',
            'notes/plan.md:3:5: inline budget.md',
            '' ].join('\n'));

        assert.equal(
          environment.exitCode,
          undefined);
      });
  });

test(
  'backlinks sets the exit code when nothing links to the entry',
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

        await execBacklinks(
          environment,
          { path: 'notes/orphan.md' });

        assert.equal(
          environment.stdout.toString(),
          '');

        assert.equal(
          environment.exitCode,
          1);
      });
  });

test(
  'backlinks prints the links as json',
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

        await execBacklinks(
          environment,
          { path: 'notes/budget.md',
            pattern: 'notes/**/*.md',
            format: 'json' });

        assert.deepEqual(
          JSON.parse(
            environment.stdout.toString()),
          [ { path: 'notes/plan.md',
              line: 3,
              column: 5,
              kind: 'inline',
              target: 'budget.md',
              text: 'the budget' } ]);
      });
  });
