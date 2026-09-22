import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import test
  from 'node:test';
import { createNote,
         isMarkdown,
         summarizeDocument }
  from './notes.js';
import { createDefaultReaderRegistry }
  from './readers/registry.js';
import { withLibrary }
  from './testing/library.js';
import { createSinglePagePdf }
  from './testing/pdf.js';

const readers =
  createDefaultReaderRegistry();

test(
  'createNote writes front matter, a heading and a body',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        const entry =
          await createNote(
            library.path,
            'notes/meeting',
            { title: 'Weekly meeting',
              tags:
                [ 'team',
                  'weekly' ],
              body: 'Agenda.',
              now:
                new Date(
                  '2026-01-02T03:04:05.000Z') });

        assert.equal(
          entry.path,
          'notes/meeting.md');

        assert.equal(
          await fs.readFile(
            library.resolve('notes/meeting.md'),
            'utf8'),
          [ '---',
            'title: Weekly meeting',
            'created: 2026-01-02T03:04:05.000Z',
            'tags:',
            '  - team',
            '  - weekly',
            '---',
            '',
            '# Weekly meeting',
            '',
            'Agenda.',
            '' ].join('\n'));
      });
  });

test(
  'createNote defaults the title to the file name',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        await createNote(
          library.path,
          'inbox/quick note.md',
          { now:
              new Date(
                '2026-01-02T03:04:05.000Z') });

        const text =
          await fs.readFile(
            library.resolve(
              'inbox/quick note.md'),
            'utf8');

        assert.match(
          text,
          /^# quick note$/m);
      });
  });

test(
  'createNote refuses to replace an existing note',
  async () =>
  {
    await withLibrary(
      { 'one.md': '# One\n' },
      async (
          library
        ) =>
      {
        await assert.rejects(
          () =>
          createNote(
            library.path,
            'one.md'),
          /already exists/);
      });
  });

test(
  'summarizeDocument reports markdown structure',
  async () =>
  {
    await withLibrary(
      { 'one.md':
          [ '---',
            'title: Sample',
            '---',
            '# Sample',
            '',
            'A [link](two.md).',
            '',
            '- [x] done',
            '- [ ] open',
            '' ].join('\n') },
      async (
          library
        ) =>
      {
        const summary =
          await summarizeDocument(
            library.path,
            readers,
            'one.md');

        assert.equal(
          summary.kind,
          'markdown');

        assert.equal(
          summary.title,
          'Sample');

        assert.equal(
          summary.headings,
          1);

        assert.equal(
          summary.links,
          1);

        assert.deepEqual(
          summary.tasks,
          { total: 2,
            done: 1 });

        assert.deepEqual(
          summary.frontMatter,
          { title: 'Sample' });
      });
  });

test(
  'summarizeDocument reports other file types through their reader',
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

        const summary =
          await summarizeDocument(
            library.path,
            readers,
            'manual.pdf');

        assert.equal(
          summary.kind,
          'other');

        assert.equal(
          summary.words,
          3);
      });
  });

test(
  'summarizeDocument rejects folders',
  async () =>
  {
    await withLibrary(
      { 'notes/one.md': '# One\n' },
      async (
          library
        ) =>
      {
        await assert.rejects(
          () =>
          summarizeDocument(
            library.path,
            readers,
            'notes'),
          /Not a file/);
      });
  });

test(
  'isMarkdown recognises markdown extensions',
  () =>
  {
    assert.equal(
      isMarkdown('notes/one.MD'),
      true);

    assert.equal(
      isMarkdown('notes/one.txt'),
      false);
  });
