import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import test
  from 'node:test';
import { createTestEnvironment,
         withLibrary }
  from '../testing/library.js';
import { execMove }
  from './move.js';

const FILES =
  { 'notes/budget.md': '# Budget\n',
    'notes/plan.md':
      '# Plan\n\nSee [budget](budget.md).\n' };

test(
  'move reports the transfer and every link it rewrote',
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

        await execMove(
          environment,
          { source: 'notes/budget.md',
            target: 'archive/budget.md' });

        assert.equal(
          environment.stdout.toString(),
          [ 'move notes/budget.md -> archive/budget.md',
            'update notes/plan.md:3:5 budget.md -> ../archive/budget.md',
            '' ].join('\n'));

        assert.equal(
          await fs.readFile(
            library.resolve('notes/plan.md'),
            'utf8'),
          '# Plan\n\nSee [budget](../archive/budget.md).\n');
      });
  });

test(
  'move leaves links alone when asked',
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

        await execMove(
          environment,
          { source: 'notes/budget.md',
            target: 'archive/budget.md',
            updateLinks: false });

        assert.equal(
          environment.stdout.toString(),
          'notes/budget.md -> archive/budget.md\n');

        assert.equal(
          await fs.readFile(
            library.resolve('notes/plan.md'),
            'utf8'),
          '# Plan\n\nSee [budget](budget.md).\n');
      });
  });

test(
  'move reports a dry run without changing anything',
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

        await execMove(
          environment,
          { source: 'notes/budget.md',
            target: 'archive/budget.md',
            dryRun: true });

        assert.equal(
          environment.stdout.toString(),
          [ 'would move notes/budget.md -> archive/budget.md',
            'would update notes/plan.md:3:5 budget.md -> '
            + '../archive/budget.md',
            '' ].join('\n'));

        assert.equal(
          await fs.readFile(
            library.resolve('notes/plan.md'),
            'utf8'),
          '# Plan\n\nSee [budget](budget.md).\n');
      });
  });

test(
  'move refuses an existing target unless overwrite is set',
  async () =>
  {
    await withLibrary(
      { 'one.md': '# One\n',
        'two.md': '# Two\n' },
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        await assert.rejects(
          () =>
          execMove(
            environment,
            { source: 'one.md',
              target: 'two.md' }),
          /Target already exists/);

        await execMove(
          environment,
          { source: 'one.md',
            target: 'two.md',
            overwrite: true,
            format: 'json' });

        assert.equal(
          JSON.parse(
            environment.stdout.toString()).target,
          'two.md');
      });
  });
