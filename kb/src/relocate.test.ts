import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import test
  from 'node:test';
import { createLinkGraph }
  from './graph.js';
import { relocateEntry,
         renameEntry }
  from './relocate.js';
import { withLibrary }
  from './testing/library.js';

function read(
    library: { resolve: (...segments: string[]) => string; },
    documentPath: string
  ): Promise<string>
{
  return fs.readFile(
    library.resolve(documentPath),
    'utf8');
}

test(
  'relocate rewrites the links that point at the moved document',
  async () =>
  {
    await withLibrary(
      { 'notes/budget.md': '# Budget\n',
        'notes/plan.md':
          '# Plan\n\nSee [budget](budget.md) and [q1](budget.md#q1).\n',
        'archive/old.md':
          '# Old\n\nSee [budget](../notes/budget.md).\n\n'
          + '[b]: ../notes/budget.md\n' },
      async (
          library
        ) =>
      {
        const result =
          await relocateEntry(
            library.path,
            'notes/budget.md',
            'archive/budget.md');

        assert.equal(
          result.target,
          'archive/budget.md');

        assert.equal(
          await read(
            library,
            'notes/plan.md'),
          '# Plan\n\nSee [budget](../archive/budget.md) and '
          + '[q1](../archive/budget.md#q1).\n');

        assert.equal(
          await read(
            library,
            'archive/old.md'),
          '# Old\n\nSee [budget](budget.md).\n\n[b]: budget.md\n');

        assert.deepEqual(
          result.files.map(
            file => [ file.path,
                      file.edits.length ]),
          [ [ 'archive/old.md',
              2 ],
            [ 'notes/plan.md',
              2 ] ]);
      });
  });

test(
  'relocate rewrites the relative links inside the moved document',
  async () =>
  {
    await withLibrary(
      { 'notes/budget.md': '# Budget\n',
        'notes/plan.md':
          '# Plan\n\nSee [budget](budget.md).\n',
        'archive/keep.md': '# Keep\n' },
      async (
          library
        ) =>
      {
        await relocateEntry(
          library.path,
          'notes/plan.md',
          'archive/plan.md');

        assert.equal(
          await read(
            library,
            'archive/plan.md'),
          '# Plan\n\nSee [budget](../notes/budget.md).\n');
      });
  });

test(
  'relocate keeps a root-absolute link root-absolute',
  async () =>
  {
    await withLibrary(
      { 'notes/budget.md': '# Budget\n',
        'notes/plan.md':
          '# Plan\n\nSee [budget](/notes/budget.md).\n' },
      async (
          library
        ) =>
      {
        await relocateEntry(
          library.path,
          'notes/budget.md',
          'archive/budget.md');

        assert.equal(
          await read(
            library,
            'notes/plan.md'),
          '# Plan\n\nSee [budget](/archive/budget.md).\n');
      });
  });

test(
  'relocate keeps an extension-less link extension-less',
  async () =>
  {
    await withLibrary(
      { 'notes/budget.md': '# Budget\n',
        'notes/plan.md':
          '# Plan\n\nSee [budget](budget).\n' },
      async (
          library
        ) =>
      {
        await relocateEntry(
          library.path,
          'notes/budget.md',
          'archive/budget.md');

        assert.equal(
          await read(
            library,
            'notes/plan.md'),
          '# Plan\n\nSee [budget](../archive/budget).\n');
      });
  });

test(
  'relocate leaves a wiki link alone when the name does not change',
  async () =>
  {
    await withLibrary(
      { 'notes/budget.md': '# Budget\n',
        'inbox/quick.md':
          '# Quick\n\nSee [[budget]].\n' },
      async (
          library
        ) =>
      {
        const result =
          await relocateEntry(
            library.path,
            'notes/budget.md',
            'archive/budget.md');

        assert.equal(
          await read(
            library,
            'inbox/quick.md'),
          '# Quick\n\nSee [[budget]].\n');

        assert.deepEqual(
          result.files,
          [ ]);
      });
  });

test(
  'rename updates wiki links and keeps their alias',
  async () =>
  {
    await withLibrary(
      { 'notes/budget.md': '# Budget\n',
        'inbox/quick.md':
          '# Quick\n\nSee [[budget]] and [[budget|the budget]].\n',
        'notes/plan.md':
          '# Plan\n\nSee [budget](budget.md).\n' },
      async (
          library
        ) =>
      {
        const result =
          await renameEntry(
            library.path,
            'notes/budget.md',
            'finance.md');

        assert.equal(
          result.target,
          'notes/finance.md');

        assert.equal(
          await read(
            library,
            'inbox/quick.md'),
          '# Quick\n\nSee [[finance]] and [[finance|the budget]].\n');

        assert.equal(
          await read(
            library,
            'notes/plan.md'),
          '# Plan\n\nSee [budget](finance.md).\n');
      });
  });

test(
  'rename refuses a name that is a path',
  async () =>
  {
    await withLibrary(
      { 'notes/budget.md': '# Budget\n' },
      async (
          library
        ) =>
      {
        await assert.rejects(
          () =>
          renameEntry(
            library.path,
            'notes/budget.md',
            'archive/budget.md'),
          /cannot contain a path separator/);
      });
  });

test(
  'relocate moves a folder and repairs links in both directions',
  async () =>
  {
    await withLibrary(
      { 'notes/budget.md':
          '# Budget\n\nSee [the plan](plan.md) and '
          + '[a note](../inbox/one.md).\n',
        'notes/plan.md': '# Plan\n',
        'inbox/one.md':
          '# One\n\nSee [budget](../notes/budget.md).\n' },
      async (
          library
        ) =>
      {
        const result =
          await relocateEntry(
            library.path,
            'notes',
            'archive/notes');

        assert.deepEqual(
          result.moved,
          [ { from: 'notes/budget.md',
              to:
                'archive/notes/budget.md' },
            { from: 'notes/plan.md',
              to:
                'archive/notes/plan.md' } ]);

        // A link between two documents that moved together is unchanged; a
        // link leaving the moved folder is repaired.
        assert.equal(
          await read(
            library,
            'archive/notes/budget.md'),
          '# Budget\n\nSee [the plan](plan.md) and '
          + '[a note](../../inbox/one.md).\n');

        assert.equal(
          await read(
            library,
            'inbox/one.md'),
          '# One\n\nSee [budget](../archive/notes/budget.md).\n');
      });
  });

test(
  'relocate leaves the library untouched on a dry run',
  async () =>
  {
    await withLibrary(
      { 'notes/budget.md': '# Budget\n',
        'notes/plan.md':
          '# Plan\n\nSee [budget](budget.md).\n' },
      async (
          library
        ) =>
      {
        const result =
          await relocateEntry(
            library.path,
            'notes/budget.md',
            'archive/budget.md',
            { dryRun: true });

        assert.equal(
          result.dryRun,
          true);

        assert.deepEqual(
          result.files.map(
            file =>
            file.edits.map(
              edit => [ edit.from,
                        edit.to ])),
          [ [ [ 'budget.md',
                '../archive/budget.md' ] ] ]);

        assert.equal(
          await read(
            library,
            'notes/plan.md'),
          '# Plan\n\nSee [budget](budget.md).\n');

        assert.equal(
          await fs.stat(
            library.resolve('notes/budget.md'))
            .then(() => true)
            .catch(() => false),
          true);
      });
  });

test(
  'relocate can move without touching any link',
  async () =>
  {
    await withLibrary(
      { 'notes/budget.md': '# Budget\n',
        'notes/plan.md':
          '# Plan\n\nSee [budget](budget.md).\n' },
      async (
          library
        ) =>
      {
        await relocateEntry(
          library.path,
          'notes/budget.md',
          'archive/budget.md',
          { updateLinks: false });

        assert.equal(
          await read(
            library,
            'notes/plan.md'),
          '# Plan\n\nSee [budget](budget.md).\n');
      });
  });

test(
  'relocate leaves links that lead nowhere alone',
  async () =>
  {
    await withLibrary(
      { 'notes/plan.md':
          '# Plan\n\nA [dangling](gone.md) link.\n',
        'notes/budget.md': '# Budget\n' },
      async (
          library
        ) =>
      {
        await relocateEntry(
          library.path,
          'notes/plan.md',
          'archive/plan.md');

        assert.equal(
          await read(
            library,
            'archive/plan.md'),
          '# Plan\n\nA [dangling](gone.md) link.\n');
      });
  });

test(
  'relocate keeps an attached index current',
  async () =>
  {
    await withLibrary(
      { 'notes/budget.md': '# Budget\n',
        'notes/plan.md':
          '# Plan\n\nSee [budget](budget.md).\n' },
      async (
          library
        ) =>
      {
        const graph =
          await createLinkGraph(library.path);

        await relocateEntry(
          library.path,
          'notes/budget.md',
          'archive/budget.md',
          { graph });

        assert.equal(
          graph.article('notes/budget.md'),
          undefined);

        assert.equal(
          graph.article('archive/budget.md')?.title,
          'Budget');

        assert.deepEqual(
          graph.backlinksTo('archive/budget.md')
            .map(
              backlink => backlink.target),
          [ '../archive/budget.md' ]);

        assert.deepEqual(
          graph.backlinksTo('notes/budget.md'),
          [ ]);
      });
  });
