import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import test
  from 'node:test';
import { createTestEnvironment,
         withLibrary }
  from '../testing/library.js';
import { execRename }
  from './rename.js';

const FILES =
  { 'notes/budget.md': '# Budget\n',
    'notes/plan.md':
      '# Plan\n\nSee [budget](budget.md).\n',
    'inbox/quick.md':
      '# Quick\n\nSee [[budget]].\n' };

test(
  'rename reports the rename and the links it rewrote',
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

        await execRename(
          environment,
          { path: 'notes/budget.md',
            name: 'finance.md' });

        assert.equal(
          environment.stdout.toString(),
          [ 'move notes/budget.md -> notes/finance.md',
            'update inbox/quick.md:3:5 budget -> finance',
            'update notes/plan.md:3:5 budget.md -> finance.md',
            '' ].join('\n'));

        assert.equal(
          await fs.readFile(
            library.resolve('inbox/quick.md'),
            'utf8'),
          '# Quick\n\nSee [[finance]].\n');
      });
  });

test(
  'rename prints the result as json',
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

        await execRename(
          environment,
          { path: 'notes/budget.md',
            name: 'finance.md',
            format: 'json' });

        const result =
          JSON.parse(
            environment.stdout.toString()) as
            { target: string;
              files: { path: string; }[]; };

        assert.equal(
          result.target,
          'notes/finance.md');

        assert.deepEqual(
          result.files.map(file => file.path),
          [ 'inbox/quick.md',
            'notes/plan.md' ]);
      });
  });

test(
  'rename rejects a name that is a path',
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
          execRename(
            createTestEnvironment(library),
            { path: 'notes/budget.md',
              name:
                'archive/finance.md' }),
          /cannot contain a path separator/);
      });
  });
