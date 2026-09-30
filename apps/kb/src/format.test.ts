import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import test
  from 'node:test';
import { formatLibrary }
  from './format.js';
import { withLibrary }
  from './testing/library.js';

test(
  'formatLibrary rewrites markdown files that need formatting',
  async () =>
  {
    await withLibrary(
      { 'notes/one.md':
          '# One\n\n* first\n',
        'notes/two.md': '# Two\n' },
      async (
          library
        ) =>
      {
        const report =
          await formatLibrary(library.path);

        assert.equal(
          report.changed,
          1);

        assert.equal(
          report.written,
          true);

        assert.deepEqual(
          report.files,
          [ { path: 'notes/one.md',
              changed: true },
            { path: 'notes/two.md',
              changed: false } ]);

        assert.equal(
          await fs.readFile(
            library.resolve('notes/one.md'),
            'utf8'),
          '# One\n\n- first\n');
      });
  });

test(
  'formatLibrary leaves files untouched when write is false',
  async () =>
  {
    await withLibrary(
      { 'one.md':
          '# One\n\n* first\n' },
      async (
          library
        ) =>
      {
        const report =
          await formatLibrary(
            library.path,
            { write: false });

        assert.equal(
          report.changed,
          1);

        assert.equal(
          report.written,
          false);

        assert.equal(
          await fs.readFile(
            library.resolve('one.md'),
            'utf8'),
          '# One\n\n* first\n');
      });
  });

test(
  'formatLibrary only visits the requested pattern',
  async () =>
  {
    await withLibrary(
      { 'notes/one.md': '* first\n',
        'archive/two.md': '* second\n' },
      async (
          library
        ) =>
      {
        const report =
          await formatLibrary(
            library.path,
            { pattern: 'notes/**/*.md' });

        assert.deepEqual(
          report.files.map(file => file.path),
          [ 'notes/one.md' ]);
      });
  });
