import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { DocumentReader,
         ReaderRegistry }
  from './reader.js';

const stubReader: DocumentReader =
  { name: 'stub',
    extensions:
      [ '.Stub' ],
    verbatim: true,
    readText:
      () => Promise.resolve('text') };

test(
  'find matches extensions case-insensitively',
  () =>
  {
    const registry =
      new ReaderRegistry();

    registry.register(stubReader);

    assert.equal(
      registry.find('notes/One.STUB')?.name,
      'stub');

    assert.equal(
      registry.supports('notes/one.other'),
      false);
  });

test(
  'extensions returns registered extensions, sorted',
  () =>
  {
    const registry =
      new ReaderRegistry();

    registry.register(stubReader);

    registry.register(
      { ...stubReader,
        name: 'another',
        extensions:
          [ '.a' ] });

    assert.deepEqual(
      registry.extensions(),
      [ '.a',
        '.stub' ]);
  });

test(
  'readText rejects unsupported file types',
  async () =>
  {
    const registry =
      new ReaderRegistry();

    await assert.rejects(
      () => registry.readText('notes/one.bin'),
      /Unsupported file type/);
  });
