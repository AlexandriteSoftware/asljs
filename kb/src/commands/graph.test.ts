import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createLinkGraph }
  from '../graph.js';
import { createTestContext,
         withLibrary }
  from '../testing/library.js';
import { execGraph }
  from './graph.js';

const FILES =
  { 'notes/budget.md':
      '---\ntitle: The budget\n---\n# Budget\n',
    'notes/plan.md':
      '# Plan\n\nSee [budget](budget.md) and a '
      + '[site](https://example.com).\n' };

test(
  'graph reports the collection sizes',
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

        await execGraph(context);

        assert.equal(
          context.environment.stdout.toString(),
          'articles: 2\nlinks: 2\nexternal: 1\n');
      });
  });

test(
  'graph describes one article in both directions',
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

        await execGraph(
          context,
          { path: 'notes/budget.md' });

        assert.equal(
          context.environment.stdout.toString(),
          [ 'path: notes/budget.md',
            'title: The budget',
            'outgoing: 0',
            'incoming: 1',
            '  <- notes/plan.md:3:5 budget.md',
            '' ].join('\n'));
      });
  });

test(
  'graph prints the collections as json',
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

        await execGraph(
          context,
          { path: 'notes/plan.md',
            format: 'json' });

        const report =
          JSON.parse(
            context.environment.stdout.toString()) as
            { article: { title: string; };
              outgoing: { target: string; to: string[]; }[]; };

        assert.equal(
          report.article.title,
          'Plan');

        assert.deepEqual(
          report.outgoing.map(
            link => [ link.target,
                      link.to ]),
          [ [ 'budget.md',
              [ 'notes/budget.md' ] ],
            [ 'https://example.com',
              [ ] ] ]);
      });
  });

test(
  'graph reuses the index the host keeps current',
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

        context.environment.graph =
          await createLinkGraph(library.path);

        await library.writeText(
          'notes/extra.md',
          '# Extra\n');

        await execGraph(context);

        assert.match(
          context.environment.stdout.toString(),
          /^articles: 2$/m);
      });
  });
