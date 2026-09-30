import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { withLibrary }
  from '../testing/library.js';
import { TextReader }
  from './text-reader.js';

test(
  'TextReader returns file content verbatim',
  async () =>
  {
    await withLibrary(
      { 'one.md': '# One\n\nText.\n' },
      async (
          library
        ) =>
      {
        const reader =
          new TextReader();

        assert.equal(
          reader.verbatim,
          true);

        assert.equal(
          await reader.readText(
            library.resolve('one.md')),
          '# One\n\nText.\n');
      });
  });

test(
  'TextReader covers markdown and plain text extensions',
  () =>
  {
    const reader =
      new TextReader();

    assert.equal(
      reader.extensions.includes('.md'),
      true);

    assert.equal(
      reader.extensions.includes('.txt'),
      true);
  });
