import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createTestContext,
         withLibrary }
  from '../testing/library.js';
import { execInfo }
  from './info.js';

test(
  'info prints a summary of a markdown document',
  async () =>
  {
    await withLibrary(
      { 'one.md':
          '---\ntitle: One\n---\n# One\n\n- [ ] task\n' },
      async (
          library
        ) =>
      {
        const context =
          createTestContext(library);

        await execInfo(
          context,
          { path: 'one.md' });

        const output =
          context.environment.stdout.toString();

        assert.match(
          output,
          /^path: one\.md$/m);

        assert.match(
          output,
          /^kind: markdown$/m);

        assert.match(
          output,
          /^title: One$/m);

        assert.match(
          output,
          /^tasks: 0\/1$/m);
      });
  });

test(
  'info prints the summary as json',
  async () =>
  {
    await withLibrary(
      { 'one.md': '# One\n' },
      async (
          library
        ) =>
      {
        const context =
          createTestContext(library);

        await execInfo(
          context,
          { path: 'one.md',
            format: 'json' });

        const summary =
          JSON.parse(
            context.environment.stdout.toString()) as
            { headings: number; };

        assert.equal(
          summary.headings,
          1);
      });
  });
