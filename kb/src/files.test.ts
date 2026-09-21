import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import test
  from 'node:test';
import { copyEntry,
         createFolder,
         listEntries,
         moveEntry,
         readTextFile,
         removeEntry,
         statEntry,
         writeTextFile }
  from './files.js';
import { LibraryPathError }
  from './library.js';
import { withLibrary }
  from './testing/library.js';

test(
  'listEntries lists files and folders, sorted by path',
  async () =>
  {
    await withLibrary(
      { 'notes/one.md': '# One\n',
        'notes/two.md': '# Two\n',
        'readme.md': '# Readme\n' },
      async (
          library
        ) =>
      {
        const entries =
          await listEntries(library.path);

        assert.deepEqual(
          entries.map(entry => entry.path),
          [ 'notes',
            'notes/one.md',
            'notes/two.md',
            'readme.md' ]);

        assert.equal(
          entries[0]?.kind,
          'folder');

        assert.equal(
          entries[0]?.size,
          0);
      });
  });

test(
  'listEntries honours the pattern and the kind filter',
  async () =>
  {
    await withLibrary(
      { 'notes/one.md': '# One\n',
        'notes/one.txt': 'one\n' },
      async (
          library
        ) =>
      {
        const entries =
          await listEntries(
            library.path,
            { pattern: 'notes/*.md',
              kind: 'file' });

        assert.deepEqual(
          entries.map(entry => entry.path),
          [ 'notes/one.md' ]);
      });
  });

test(
  'listEntries skips dot entries unless hidden is set',
  async () =>
  {
    await withLibrary(
      { '.hidden/secret.md': '# Secret\n',
        'visible.md': '# Visible\n' },
      async (
          library
        ) =>
      {
        assert.deepEqual(
          (await listEntries(library.path))
            .map(entry => entry.path),
          [ 'visible.md' ]);

        assert.equal(
          (await listEntries(
            library.path,
            { hidden: true }))
            .some(
              entry => entry.path === '.hidden/secret.md'),
          true);
      });
  });

test(
  'listEntries excludes node_modules and .git',
  async () =>
  {
    await withLibrary(
      { 'node_modules/package/readme.md': '# Package\n',
        'notes/one.md': '# One\n' },
      async (
          library
        ) =>
      {
        assert.deepEqual(
          (await listEntries(
            library.path,
            { pattern: '**/*.md' }))
            .map(entry => entry.path),
          [ 'notes/one.md' ]);
      });
  });

test(
  'writeTextFile creates missing folders and refuses to overwrite',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        const entry =
          await writeTextFile(
            library.path,
            'notes/deep/one.md',
            '# One\n');

        assert.equal(
          entry.path,
          'notes/deep/one.md');

        assert.equal(
          await readTextFile(
            library.path,
            'notes/deep/one.md'),
          '# One\n');

        await assert.rejects(
          () =>
          writeTextFile(
            library.path,
            'notes/deep/one.md',
            '# Other\n'),
          /already exists/);

        await writeTextFile(
          library.path,
          'notes/deep/one.md',
          '# Other\n',
          { overwrite: true });

        assert.equal(
          await readTextFile(
            library.path,
            'notes/deep/one.md'),
          '# Other\n');
      });
  });

test(
  'writeTextFile rejects paths outside of the library',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        await assert.rejects(
          () =>
          writeTextFile(
            library.path,
            '../escaped.md',
            'text'),
          LibraryPathError);
      });
  });

test(
  'createFolder creates missing parents',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        const entry =
          await createFolder(
            library.path,
            'a/b/c');

        assert.equal(
          entry.kind,
          'folder');

        assert.equal(
          entry.path,
          'a/b/c');
      });
  });

test(
  'moveEntry renames a file',
  async () =>
  {
    await withLibrary(
      { 'one.md': '# One\n' },
      async (
          library
        ) =>
      {
        const result =
          await moveEntry(
            library.path,
            'one.md',
            'notes/renamed.md');

        assert.deepEqual(
          result,
          { source: 'one.md',
            target: 'notes/renamed.md' });

        assert.equal(
          await readTextFile(
            library.path,
            'notes/renamed.md'),
          '# One\n');
      });
  });

test(
  'moveEntry places the source inside an existing target folder',
  async () =>
  {
    await withLibrary(
      { 'one.md': '# One\n',
        'archive/keep.md': '# Keep\n' },
      async (
          library
        ) =>
      {
        const result =
          await moveEntry(
            library.path,
            'one.md',
            'archive');

        assert.equal(
          result.target,
          'archive/one.md');
      });
  });

test(
  'moveEntry refuses an existing target unless overwrite is set',
  async () =>
  {
    await withLibrary(
      { 'one.md': '# One\n',
        'two.md': '# Two\n' },
      async (
          library
        ) =>
      {
        await assert.rejects(
          () =>
          moveEntry(
            library.path,
            'one.md',
            'two.md'),
          /Target already exists/);

        await moveEntry(
          library.path,
          'one.md',
          'two.md',
          { overwrite: true });

        assert.equal(
          await readTextFile(
            library.path,
            'two.md'),
          '# One\n');
      });
  });

test(
  'moveEntry refuses to move a folder into itself',
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
          moveEntry(
            library.path,
            'notes',
            'notes/inner'),
          LibraryPathError);
      });
  });

test(
  'copyEntry copies a folder recursively',
  async () =>
  {
    await withLibrary(
      { 'notes/one.md': '# One\n' },
      async (
          library
        ) =>
      {
        const result =
          await copyEntry(
            library.path,
            'notes',
            'archive');

        assert.equal(
          result.target,
          'archive');

        assert.equal(
          await readTextFile(
            library.path,
            'archive/one.md'),
          '# One\n');
      });
  });

test(
  'removeEntry removes a file and refuses a non-empty folder',
  async () =>
  {
    await withLibrary(
      { 'notes/one.md': '# One\n' },
      async (
          library
        ) =>
      {
        assert.equal(
          await removeEntry(
            library.path,
            'notes/one.md'),
          'notes/one.md');

        await library.writeText(
          'notes/two.md',
          '# Two\n');

        await assert.rejects(
          () => removeEntry(
            library.path,
            'notes'),
          /not empty/);

        assert.equal(
          await removeEntry(
            library.path,
            'notes',
            { recursive: true }),
          'notes');

        assert.equal(
          await fs.stat(
            library.resolve('notes'))
            .then(() => true)
            .catch(() => false),
          false);
      });
  });

test(
  'removeEntry refuses to remove the library root',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        await assert.rejects(
          () => removeEntry(
            library.path,
            '.'),
          LibraryPathError);
      });
  });

test(
  'statEntry reports a missing entry',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        await assert.rejects(
          () => statEntry(
            library.path,
            'missing.md'),
          /does not exist/);
      });
  });
