import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createDefaultReaderRegistry }
  from './registry.js';

test(
  'the default registry reads markdown and pdf',
  () =>
  {
    const registry =
      createDefaultReaderRegistry();

    assert.equal(
      registry.find('notes/one.md')?.name,
      'text');

    assert.equal(
      registry.find('notes/manual.pdf')?.name,
      'pdf');
  });
