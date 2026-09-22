import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import test
  from 'node:test';
import { withLibrary }
  from '../testing/library.js';
import { createSinglePagePdf }
  from '../testing/pdf.js';
import { PdfReader }
  from './pdf-reader.js';

test(
  'PdfReader extracts the text layer',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        const filePath =
          library.resolve('manual.pdf');

        await fs.writeFile(
          filePath,
          createSinglePagePdf(
            'Knowledge base manual'));

        const reader =
          new PdfReader();

        assert.equal(
          reader.verbatim,
          false);

        assert.match(
          await reader.readText(filePath),
          /Knowledge base manual/);
      });
  });
