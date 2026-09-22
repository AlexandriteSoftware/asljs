import assert
  from 'node:assert/strict';
import path
  from 'node:path';
import test
  from 'node:test';
import { isInsideLibrary,
         LibraryPathError,
         resolveLibraryPath,
         resolveLibraryRoot,
         toLibraryPath }
  from './library.js';

const root =
  path.resolve('/tmp/kb-library');

test(
  'resolveLibraryPath resolves relative paths against the root',
  () =>
  {
    assert.equal(
      resolveLibraryPath(
        root,
        'notes/today.md'),
      path.join(
        root,
        'notes',
        'today.md'));
  });

test(
  'resolveLibraryPath rejects empty paths',
  () =>
  {
    assert.throws(
      () => resolveLibraryPath(
        root,
        '   '),
      LibraryPathError);
  });

test(
  'resolveLibraryPath rejects paths outside of the library',
  () =>
  {
    assert.throws(
      () => resolveLibraryPath(
        root,
        '../secrets.md'),
      LibraryPathError);
  });

test(
  'toLibraryPath reports the root as a dot',
  () =>
  {
    assert.equal(
      toLibraryPath(
        root,
        root),
      '.');
  });

test(
  'toLibraryPath returns a posix path',
  () =>
  {
    assert.equal(
      toLibraryPath(
        root,
        path.join(
          root,
          'notes',
          'today.md')),
      'notes/today.md');
  });

test(
  'toLibraryPath rejects paths outside of the library',
  () =>
  {
    assert.throws(
      () =>
      toLibraryPath(
        root,
        path.resolve(
          '/tmp/other/today.md')),
      LibraryPathError);
  });

test(
  'isInsideLibrary accepts the root and its descendants',
  () =>
  {
    assert.equal(
      isInsideLibrary(
        root,
        root),
      true);

    assert.equal(
      isInsideLibrary(
        root,
        path.join(
          root,
          'notes')),
      true);

    assert.equal(
      isInsideLibrary(
        root,
        path.resolve(
          '/tmp/kb-library-other')),
      false);
  });

test(
  'resolveLibraryRoot prefers the explicit value over the environment',
  () =>
  {
    const previous =
      process.env.KB_LIBRARY;

    process.env.KB_LIBRARY = 'from-environment';

    try {
      assert.equal(
        resolveLibraryRoot(
          root,
          'explicit'),
        path.join(
          root,
          'explicit'));

      assert.equal(
        resolveLibraryRoot(
          root,
          ''),
        path.join(
          root,
          'from-environment'));

      delete process.env.KB_LIBRARY;

      assert.equal(
        resolveLibraryRoot(root),
        root);
    } finally {
      if (previous === undefined) {
        delete process.env.KB_LIBRARY;
      } else {
        process.env.KB_LIBRARY = previous;
      }
    }
  });
