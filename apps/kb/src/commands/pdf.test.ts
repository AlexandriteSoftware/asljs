import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import test
  from 'node:test';
import { printToPdf }
  from '../pdf.js';
import { createTestContext,
         withLibrary }
  from '../testing/library.js';
import { execPdf }
  from './pdf.js';

test(
  'pdf prints a document to a PDF file and prints its path',
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

        context.environment.register(
          printToPdf,
          async (
            _html,
            output
          ) =>
            await fs.writeFile(
              output,
              'PDF'));

        await execPdf(
          context,
          { path: 'one.md',
            output: 'out/one.pdf' });

        assert.equal(
          context.environment.stdout.toString(),
          'out/one.pdf\n');

        assert.equal(
          await library.readText('out/one.pdf'),
          'PDF');

        await assert.rejects(
          execPdf(
            context,
            { path: 'one.md',
              output: 'out/one.pdf' }),
          /Already exists: out\/one\.pdf/);
      });
  });
