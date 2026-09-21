import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createTestEnvironment,
         withLibrary }
  from '../testing/library.js';
import { execMove }
  from './move.js';

test(
  'move prints the source and the target',
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

        await execMove(
          environment,
          { source: 'one.md',
            target: 'notes/one.md' });

        assert.equal(
          environment.stdout.toString(),
          'one.md -> notes/one.md\n');
      });
  });

test(
  'move refuses an existing target unless overwrite is set',
  async () =>
  {
    await withLibrary(
      { 'one.md': '# One\n',
        'two.md': '# Two\n' },
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        await assert.rejects(
          () =>
          execMove(
            environment,
            { source: 'one.md',
              target: 'two.md' }),
          /Target already exists/);

        await execMove(
          environment,
          { source: 'one.md',
            target: 'two.md',
            overwrite: true,
            format: 'json' });

        assert.equal(
          JSON.parse(
            environment.stdout.toString()).target,
          'two.md');
      });
  });
