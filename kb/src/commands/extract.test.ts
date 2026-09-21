import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createTestContext,
         withLibrary }
  from '../testing/library.js';
import { execExtract }
  from './extract.js';

const FILES =
  { 'one.md':
      [ '---',
        'title: One',
        'tags:',
        '  - a',
        '---',
        '# One',
        '',
        '- [x] done',
        '',
        'A [link](two.md).',
        '' ].join('\n') };

test(
  'extract prints json by default',
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

        await execExtract(
          context,
          { path: 'one.md',
            kind: 'headings' });

        assert.deepEqual(
          JSON.parse(
            context.environment.stdout.toString()),
          [ { level: 1,
              text: 'One',
              slug: 'one',
              line: 6 } ]);
      });
  });

test(
  'extract renders an outline as text',
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

        await execExtract(
          context,
          { path: 'one.md',
            kind: 'headings',
            format: 'text' });

        assert.equal(
          context.environment.stdout.toString(),
          '# One (line 6)\n');
      });
  });

test(
  'extract renders tasks, links and front matter as text',
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

        await execExtract(
          context,
          { path: 'one.md',
            kind: 'all',
            format: 'text' });

        assert.equal(
          context.environment.stdout.toString(),
          [ 'title: One',
            'tags: a',
            '# One (line 6)',
            'inline two.md - link (line 10)',
            '[x] done (line 8)',
            '' ].join('\n'));
      });
  });

test(
  'extract rejects unknown kinds and non-markdown files',
  async () =>
  {
    await withLibrary(
      { ...FILES,
        'notes.txt': 'text\n' },
      async (
          library
        ) =>
      {
        await assert.rejects(
          () =>
          execExtract(
            createTestContext(library),
            { path: 'one.md',
              kind: 'outline' }),
          /Unknown extraction kind/);

        await assert.rejects(
          () =>
          execExtract(
            createTestContext(library),
            { path: 'notes.txt',
              kind: 'headings' }),
          /only supported for markdown/);
      });
  });
