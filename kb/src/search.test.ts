import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import test
  from 'node:test';
import { createDefaultReaderRegistry }
  from './readers/registry.js';
import { searchLibrary }
  from './search.js';
import { withLibrary }
  from './testing/library.js';
import { createSinglePagePdf }
  from './testing/pdf.js';

const readers =
  createDefaultReaderRegistry();

const FILES =
  { 'notes/one.md':
      '# One\n\nA budget line.\n',
    'notes/two.md':
      '# Two\n\nAnother BUDGET line.\nAnd more.\n',
    'assets/logo.bin': 'budget' };

test(
  'searchLibrary matches case-insensitively by default',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const report =
          await searchLibrary(
            library.path,
            readers,
            { query: 'budget' });

        assert.deepEqual(
          report.matches.map(
            match => [ match.path,
                       match.line,
                       match.column ]),
          [ [ 'notes/one.md',
              3,
              3 ],
            [ 'notes/two.md',
              3,
              9 ] ]);

        assert.equal(
          report.searchedFiles,
          2);

        assert.equal(
          report.truncated,
          false);
      });
  });

test(
  'searchLibrary respects case sensitivity',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const report =
          await searchLibrary(
            library.path,
            readers,
            { query: 'BUDGET',
              ignoreCase: false });

        assert.deepEqual(
          report.matches.map(match => match.path),
          [ 'notes/two.md' ]);
      });
  });

test(
  'searchLibrary supports regular expressions and patterns',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const report =
          await searchLibrary(
            library.path,
            readers,
            { query: '^#\\s+\\w+',
              regex: true,
              pattern: 'notes/*.md' });

        assert.deepEqual(
          report.matches.map(match => match.text),
          [ '# One',
            '# Two' ]);
      });
  });

test(
  'searchLibrary rejects an invalid regular expression',
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
          searchLibrary(
            library.path,
            readers,
            { query: '(',
              regex: true }),
          /Invalid regular expression/);
      });
  });

test(
  'searchLibrary reports truncation when maxResults is reached',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const report =
          await searchLibrary(
            library.path,
            readers,
            { query: 'budget',
              maxResults: 1 });

        assert.equal(
          report.matches.length,
          1);

        assert.equal(
          report.truncated,
          true);
      });
  });

test(
  'searchLibrary searches the text layer of pdf files',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        await fs.writeFile(
          library.resolve('manual.pdf'),
          createSinglePagePdf('The budget manual'));

        const report =
          await searchLibrary(
            library.path,
            readers,
            { query: 'budget' });

        assert.deepEqual(
          report.matches.map(match => match.path),
          [ 'manual.pdf' ]);
      });
  });

test(
  'searchLibrary rejects an empty query',
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
          searchLibrary(
            library.path,
            readers,
            { query: '' }),
          /non-empty string/);
      });
  });
