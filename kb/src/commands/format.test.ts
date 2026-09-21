import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import test
  from 'node:test';
import { createTestEnvironment,
         withLibrary }
  from '../testing/library.js';
import { execFormat }
  from './format.js';

test(
  'format rewrites files and reports the count',
  async () =>
  {
    await withLibrary(
      { 'one.md':
          '# One\n\n* first\n' },
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        await execFormat(environment);

        assert.equal(
          environment.stdout.toString(),
          'formatted one.md\n1 of 1 file(s) formatted\n');

        assert.equal(
          await fs.readFile(
            library.resolve('one.md'),
            'utf8'),
          '# One\n\n- first\n');
      });
  });

test(
  'format --check reports without writing and sets the exit code',
  async () =>
  {
    await withLibrary(
      { 'one.md':
          '# One\n\n* first\n' },
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        await execFormat(
          environment,
          { check: true });

        assert.equal(
          environment.stdout.toString(),
          'would reformat one.md\n1 of 1 file(s) need formatting\n');

        assert.equal(
          environment.exitCode,
          1);

        assert.equal(
          await fs.readFile(
            library.resolve('one.md'),
            'utf8'),
          '# One\n\n* first\n');
      });
  });

test(
  'format prints the report as json',
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

        await execFormat(
          environment,
          { format: 'json' });

        assert.deepEqual(
          JSON.parse(
            environment.stdout.toString()),
          { files:
              [ { path: 'one.md',
                  changed: false } ],
            changed: 0,
            written: true });
      });
  });
