import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { extractCodeBlocks,
         extractData,
         extractHeadings,
         extractLinks,
         extractTables,
         extractTasks,
         toExtractionKind,
         toPlainText,
         toSlug }
  from './extract.js';
import { parseMarkdown }
  from './markdown.js';

const DOCUMENT =
  [ '---',
    'title: Sample',
    '---',
    '# Sample',
    '',
    'Text with [a link](one.md), an ![image](picture.png) and a',
    '[[wiki link|alias]].',
    '',
    '## Tasks',
    '',
    '- [x] done',
    '- [ ] open',
    '',
    '## Data',
    '',
    '| Name | Size |',
    '| ---- | ---- |',
    '| One  | 1    |',
    '',
    '```ts',
    'const value = 1;',
    '```',
    '' ].join('\n');

const document =
  parseMarkdown(
    DOCUMENT,
    'sample.md');

test(
  'extractHeadings reports level, text and document line',
  () =>
  {
    assert.deepEqual(
      extractHeadings(document),
      [ { level: 1,
          text: 'Sample',
          slug: 'sample',
          line: 4 },
        { level: 2,
          text: 'Tasks',
          slug: 'tasks',
          line: 9 },
        { level: 2,
          text: 'Data',
          slug: 'data',
          line: 14 } ]);
  });

test(
  'extractLinks reports inline, image and wiki links',
  () =>
  {
    const links =
      extractLinks(document);

    assert.deepEqual(
      links.map(
        link => [ link.kind,
                  link.target ]),
      [ [ 'inline',
          'one.md' ],
        [ 'image',
          'picture.png' ],
        [ 'wiki',
          'wiki link' ] ]);

    assert.equal(
      links[2]?.text,
      'alias');
  });

test(
  'extractTasks reports checked state',
  () =>
  {
    assert.deepEqual(
      extractTasks(document),
      [ { checked: true,
          text: 'done',
          line: 11 },
        { checked: false,
          text: 'open',
          line: 12 } ]);
  });

test(
  'extractTables reports headers and rows',
  () =>
  {
    assert.deepEqual(
      extractTables(document),
      [ { headers:
            [ 'Name',
              'Size' ],
          rows:
            [ [ 'One',
                '1' ] ],
          line: 16 } ]);
  });

test(
  'extractCodeBlocks reports language and content',
  () =>
  {
    assert.deepEqual(
      extractCodeBlocks(document),
      [ { language: 'ts',
          value: 'const value = 1;',
          line: 20 } ]);
  });

test(
  'extractData returns every kind for all',
  () =>
  {
    const data =
      extractData(
        document,
        'all') as Record<string, unknown>;

    assert.deepEqual(
      data.frontMatter,
      { title: 'Sample' });

    assert.equal(
      Array.isArray(data.headings),
      true);

    assert.deepEqual(
      extractData(
        document,
        'front-matter'),
      { title: 'Sample' });
  });

test(
  'toExtractionKind rejects unknown kinds',
  () =>
  {
    assert.equal(
      toExtractionKind('Headings'),
      'headings');

    assert.throws(
      () => toExtractionKind('outline'),
      /Unknown extraction kind/);
  });

test(
  'toPlainText flattens inline formatting',
  () =>
  {
    const inline =
      parseMarkdown(
        'A **bold** and `code` value.\n');

    assert.equal(
      toPlainText(inline.root),
      'A bold and code value.');
  });

test(
  'toSlug builds a GitHub-style anchor',
  () =>
  {
    assert.equal(
      toSlug(
        'Release Notes: 1.0!'),
      'release-notes-10');
  });
