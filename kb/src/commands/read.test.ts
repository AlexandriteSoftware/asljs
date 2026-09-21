import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createTestEnvironment,
         withLibrary }
  from '../testing/library.js';
import { execRead }
  from './read.js';

test(
  'read prints the document text',
  async () =>
  {
    await withLibrary(
      { 'one.md': '# One\n' },
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        await execRead(
          environment,
          { path: 'one.md' });

        assert.equal(
          environment.stdout.toString(),
          '# One\n');
      });
  });

test(
  'read reports the reader in json output',
  async () =>
  {
    await withLibrary(
      { 'one.md': '# One' },
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        await execRead(
          environment,
          { path: 'one.md',
            format: 'json' });

        assert.deepEqual(
          JSON.parse(
            environment.stdout.toString()),
          { path: 'one.md',
            reader: 'text',
            verbatim: true,
            text: '# One' });
      });
  });

test(
  'read rejects folders and unsupported file types',
  async () =>
  {
    await withLibrary(
      { 'notes/one.md': '# One\n',
        'image.bin': 'binary' },
      async (
          library
        ) =>
      {
        await assert.rejects(
          () =>
          execRead(
            createTestEnvironment(library),
            { path: 'notes' }),
          /Not a file/);

        await assert.rejects(
          () =>
          execRead(
            createTestEnvironment(library),
            { path: 'image.bin' }),
          /Unsupported file type/);
      });
  });
