import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import test
  from 'node:test';
import { LibraryEntry }
  from '../files.js';
import { createLinkGraph }
  from '../graph.js';
import { createTestEnvironment,
         withLibrary }
  from '../testing/library.js';
import { createSinglePagePdf }
  from '../testing/pdf.js';
import { createTools,
         McpTool }
  from './tools.js';

function toolNamed(
    tools: McpTool[],
    name: string
  ): McpTool
{
  const tool =
    tools.find(
      candidate => candidate.name === name);

  assert.ok(
    tool,
    `tool ${name} is registered`);

  return tool;
}

test(
  'every tool declares a description and an object schema',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        const tools =
          createTools(
            createTestEnvironment(library));

        assert.deepEqual(
          tools.map(tool => tool.name),
          [ 'kb_list',
            'kb_read',
            'kb_write',
            'kb_new',
            'kb_mkdir',
            'kb_move',
            'kb_copy',
            'kb_remove',
            'kb_search',
            'kb_backlinks',
            'kb_graph',
            'kb_format',
            'kb_extract',
            'kb_info' ]);

        for (const tool of tools) {
          assert.notEqual(
            tool.description,
            '');

          assert.equal(
            tool.inputSchema.type,
            'object');
        }
      });
  });

test(
  'kb_list and kb_read work on library files',
  async () =>
  {
    await withLibrary(
      { 'notes/one.md': '# One\n' },
      async (
          library
        ) =>
      {
        const tools =
          createTools(
            createTestEnvironment(library));

        const entries =
          await toolNamed(
            tools,
            'kb_list')
            .invoke(
              { pattern: '**/*.md' }) as LibraryEntry[];

        assert.deepEqual(
          entries.map(entry => entry.path),
          [ 'notes/one.md' ]);

        assert.deepEqual(
          await toolNamed(
            tools,
            'kb_read')
            .invoke(
              { path: 'notes/one.md' }),
          { path: 'notes/one.md',
            reader: 'text',
            verbatim: true,
            text: '# One\n' });
      });
  });

test(
  'kb_write, kb_new, kb_move, kb_copy and kb_remove change the library',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        const tools =
          createTools(
            createTestEnvironment(library));

        await toolNamed(
          tools,
          'kb_write')
          .invoke(
            { path: 'notes/one.md',
              content: '# One\n' });

        await toolNamed(
          tools,
          'kb_new')
          .invoke(
            { path: 'notes/two',
              title: 'Two' });

        await toolNamed(
          tools,
          'kb_mkdir')
          .invoke(
            { path: 'archive' });

        assert.deepEqual(
          await toolNamed(
            tools,
            'kb_move')
            .invoke(
              { source: 'notes/one.md',
                target: 'archive/one.md' }),
          { source: 'notes/one.md',
            target: 'archive/one.md' });

        await toolNamed(
          tools,
          'kb_copy')
          .invoke(
            { source: 'archive/one.md',
              target: 'archive/copy.md' });

        assert.deepEqual(
          await toolNamed(
            tools,
            'kb_remove')
            .invoke(
              { path: 'archive/copy.md' }),
          { path: 'archive/copy.md' });

        assert.match(
          await fs.readFile(
            library.resolve('notes/two.md'),
            'utf8'),
          /# Two/);
      });
  });

test(
  'kb_search finds text in markdown and pdf files',
  async () =>
  {
    await withLibrary(
      { 'notes/one.md':
          '# One\n\nThe budget.\n' },
      async (
          library
        ) =>
      {
        await fs.writeFile(
          library.resolve('manual.pdf'),
          createSinglePagePdf('The budget manual'));

        const tools =
          createTools(
            createTestEnvironment(library));

        const report =
          await toolNamed(
            tools,
            'kb_search')
            .invoke(
              { query: 'budget' }) as
            { matches: { path: string; }[]; };

        assert.deepEqual(
          report.matches.map(match => match.path),
          [ 'manual.pdf',
            'notes/one.md' ]);
      });
  });

test(
  'kb_backlinks answers from the index when one is attached',
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
        const environment =
          createTestEnvironment(library);

        environment.graph =
          await createLinkGraph(library.path);

        const tools =
          createTools(environment);

        const fromIndex =
          await toolNamed(
            tools,
            'kb_backlinks')
            .invoke(
              { path: 'notes/budget.md' });

        // A file written behind the index is invisible until the index is
        // told, which is what proves the answer came from memory.
        await fs.writeFile(
          library.resolve('notes/later.md'),
          '# Later\n\nAlso [budget](budget.md).\n',
          'utf8');

        assert.deepEqual(
          await toolNamed(
            tools,
            'kb_backlinks')
            .invoke(
              { path: 'notes/budget.md' }),
          fromIndex);

        await environment.graph.update('notes/later.md');

        assert.deepEqual(
          (await toolNamed(
            tools,
            'kb_backlinks')
            .invoke(
              { path: 'notes/budget.md' }) as { path: string; }[])
            .map(
              backlink => backlink.path),
          [ 'notes/later.md',
            'notes/plan.md' ]);
      });
  });

test(
  'kb_backlinks scans directly when a pattern narrows the documents',
  async () =>
  {
    await withLibrary(
      { 'notes/budget.md': '# Budget\n',
        'notes/plan.md':
          '# Plan\n\nSee [budget](budget.md).\n',
        'archive/old.md':
          '# Old\n\nSee [budget](../notes/budget.md).\n' },
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        environment.graph =
          await createLinkGraph(library.path);

        const tools =
          createTools(environment);

        assert.deepEqual(
          (await toolNamed(
            tools,
            'kb_backlinks')
            .invoke(
              { path: 'notes/budget.md',
                pattern: 'archive/**/*.md' }) as { path: string; }[])
            .map(
              backlink => backlink.path),
          [ 'archive/old.md' ]);
      });
  });

test(
  'kb_graph reports the index and one article',
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
        const environment =
          createTestEnvironment(library);

        environment.graph =
          await createLinkGraph(library.path);

        const tools =
          createTools(environment);

        assert.deepEqual(
          await toolNamed(
            tools,
            'kb_graph')
            .invoke({}),
          { articles: 2,
            links: 1,
            external: 0,
            live: true });

        const article =
          await toolNamed(
            tools,
            'kb_graph')
            .invoke(
              { path: 'notes/budget.md' }) as
            { article: { title: string; };
              outgoing: unknown[];
              incoming: { from: string; }[]; };

        assert.equal(
          article.article.title,
          'Budget');

        assert.deepEqual(
          article.outgoing,
          [ ]);

        assert.deepEqual(
          article.incoming.map(link => link.from),
          [ 'notes/plan.md' ]);
      });
  });

test(
  'kb_graph builds an index on demand when none is attached',
  async () =>
  {
    await withLibrary(
      { 'notes/budget.md': '# Budget\n' },
      async (
          library
        ) =>
      {
        const tools =
          createTools(
            createTestEnvironment(library));

        assert.deepEqual(
          await toolNamed(
            tools,
            'kb_graph')
            .invoke({}),
          { articles: 1,
            links: 0,
            external: 0,
            live: false });
      });
  });

test(
  'kb_extract and kb_info describe a markdown document',
  async () =>
  {
    await withLibrary(
      { 'one.md':
          '---\ntitle: One\n---\n# One\n\n- [ ] task\n' },
      async (
          library
        ) =>
      {
        const tools =
          createTools(
            createTestEnvironment(library));

        assert.deepEqual(
          await toolNamed(
            tools,
            'kb_extract')
            .invoke(
              { path: 'one.md',
                kind: 'front-matter' }),
          { title: 'One' });

        const info =
          await toolNamed(
            tools,
            'kb_info')
            .invoke(
              { path: 'one.md' }) as
            { title: string; };

        assert.equal(
          info.title,
          'One');
      });
  });

test(
  'kb_extract rejects non-markdown files',
  async () =>
  {
    await withLibrary(
      { 'one.txt': 'text\n' },
      async (
          library
        ) =>
      {
        const tools =
          createTools(
            createTestEnvironment(library));

        await assert.rejects(
          () =>
          toolNamed(
            tools,
            'kb_extract')
            .invoke(
              { path: 'one.txt',
                kind: 'headings' }),
          /only supported for markdown/);
      });
  });

test(
  'tools validate their arguments',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        const tools =
          createTools(
            createTestEnvironment(library));

        await assert.rejects(
          () =>
          toolNamed(
            tools,
            'kb_read')
            .invoke({}),
          /'path' is required/);

        await assert.rejects(
          () =>
          toolNamed(
            tools,
            'kb_list')
            .invoke(
              { hidden: 'yes' }),
          /'hidden' must be a boolean/);

        await assert.rejects(
          () =>
          toolNamed(
            tools,
            'kb_list')
            .invoke(
              { kind: 'document' }),
          /'kind' must be file, folder or any/);

        await assert.rejects(
          () =>
          toolNamed(
            tools,
            'kb_search')
            .invoke(
              { query: 'one',
                maxResults: 0 }),
          /'maxResults' must be a positive integer/);

        await assert.rejects(
          () =>
          toolNamed(
            tools,
            'kb_new')
            .invoke(
              { path: 'one',
                tags:
                  [ 1 ] }),
          /'tags' must be an array of strings/);
      });
  });

test(
  'tools refuse paths outside of the library',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        const tools =
          createTools(
            createTestEnvironment(library));

        await assert.rejects(
          () =>
          toolNamed(
            tools,
            'kb_write')
            .invoke(
              { path: '../escaped.md',
                content: 'text' }),
          /outside of the library/);
      });
  });
