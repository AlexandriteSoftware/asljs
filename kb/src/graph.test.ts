import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import test
  from 'node:test';
import { findBacklinks }
  from './backlinks.js';
import { createLinkGraph }
  from './graph.js';
import { withLibrary }
  from './testing/library.js';

const FILES =
  { 'notes/budget.md':
      '---\ntitle: The budget\n---\n# Budget\n',
    'notes/plan.md':
      [ '# Plan',
        '',
        'See [the budget](budget.md) and [anchored](budget.md#q1).',
        'And an external [site](https://example.com).',
        '' ].join('\n'),
    'archive/old.md':
      [ '# Old',
        '',
        'Up a level: [budget](../notes/budget.md).',
        '',
        '[b]: ../notes/budget.md',
        '' ].join('\n'),
    'inbox/quick.md':
      '# Quick\n\nWiki [[budget]].\n' };

test(
  'the graph indexes articles with their titles',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const graph =
          await createLinkGraph(library.path);

        assert.deepEqual(
          graph.articles()
            .map(
              article => [ article.path,
                           article.title ]),
          [ [ 'archive/old.md',
              'Old' ],
            [ 'inbox/quick.md',
              'Quick' ],
            [ 'notes/budget.md',
              'The budget' ],
            [ 'notes/plan.md',
              'Plan' ] ]);

        assert.equal(
          graph.article('notes/budget.md')?.title,
          'The budget');
      });
  });

test(
  'the graph reports outgoing links and counts external ones',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const graph =
          await createLinkGraph(library.path);

        assert.deepEqual(
          graph.outgoing('notes/plan.md')
            .map(
              link => [ link.target,
                        link.to.length > 0 ]),
          [ [ 'budget.md',
              true ],
            [ 'budget.md#q1',
              true ],
            [ 'https://example.com',
              false ] ]);

        assert.deepEqual(
          graph.stats(),
          { articles: 4,
            links: 6,
            external: 1 });
      });
  });

test(
  'the graph answers backlinks exactly as a direct scan does',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const graph =
          await createLinkGraph(library.path);

        for (const target of [ 'notes/budget.md',
                               'notes/plan.md',
                               'notes/missing.md' ]) {
          assert.deepEqual(
            graph.backlinksTo(target),
            await findBacklinks(
              library.path,
              target),
            `backlinks to ${target}`);
        }
      });
  });

test(
  'update re-indexes one document',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const graph =
          await createLinkGraph(library.path);

        assert.equal(
          graph.backlinksTo('notes/budget.md').length,
          5);

        await fs.writeFile(
          library.resolve('notes/plan.md'),
          '# Plan\n\nNo links any more.\n',
          'utf8');

        await graph.update('notes/plan.md');

        assert.deepEqual(
          graph.backlinksTo('notes/budget.md')
            .map(
              backlink => backlink.path),
          [ 'archive/old.md',
            'archive/old.md',
            'inbox/quick.md' ]);

        assert.equal(
          graph.outgoing('notes/plan.md').length,
          0);
      });
  });

test(
  'update drops a document that is gone',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const graph =
          await createLinkGraph(library.path);

        await fs.rm(
          library.resolve('archive/old.md'));

        await graph.update('archive/old.md');

        assert.equal(
          graph.article('archive/old.md'),
          undefined);

        assert.deepEqual(
          graph.backlinksTo('notes/budget.md')
            .map(
              backlink => backlink.path),
          [ 'inbox/quick.md',
            'notes/plan.md',
            'notes/plan.md' ]);
      });
  });

test(
  'incoming links survive the removal of their target',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const graph =
          await createLinkGraph(library.path);

        await fs.rm(
          library.resolve('notes/budget.md'));

        await graph.update('notes/budget.md');

        assert.equal(
          graph.article('notes/budget.md'),
          undefined);

        assert.equal(
          graph.backlinksTo('notes/budget.md').length,
          5);
      });
  });

test(
  'backlinksTo excludes self links unless asked',
  async () =>
  {
    await withLibrary(
      { 'notes/one.md':
          '# One\n\nA self link: [one](one.md).\n' },
      async (
          library
        ) =>
      {
        const graph =
          await createLinkGraph(library.path);

        assert.deepEqual(
          graph.backlinksTo('notes/one.md'),
          [ ]);

        assert.equal(
          graph.backlinksTo(
            'notes/one.md',
            { includeSelf: true })
            .length,
          1);
      });
  });

test(
  'rebuild replaces the whole index',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const graph =
          await createLinkGraph(library.path);

        await fs.rm(
          library.resolve('archive'),
          { recursive: true });

        await library.writeText(
          'notes/extra.md',
          '# Extra\n\n[budget](budget.md)\n');

        await graph.rebuild();

        assert.deepEqual(
          graph.articles()
            .map(
              article => article.path),
          [ 'inbox/quick.md',
            'notes/budget.md',
            'notes/extra.md',
            'notes/plan.md' ]);

        assert.equal(
          graph.backlinksTo('notes/budget.md').length,
          4);
      });
  });
