import fs
  from 'node:fs/promises';
import { DocumentReader }
  from './reader.js';

/**
 * Extracts the text layer of a PDF file, one page per line group.
 *
 * `unpdf` is imported lazily, so that the PDF engine is only loaded when a PDF
 * is actually read. Scanned PDFs without a text layer produce empty text; this
 * reader does not perform OCR.
 */
export class PdfReader
  implements DocumentReader
{
  readonly name = 'pdf';

  readonly extensions = [ '.pdf' ];

  readonly verbatim = false;

  async readText(
      filePath: string
    ): Promise<string>
  {
    const { extractText,
            getDocumentProxy } =
      await import('unpdf');

    const data =
      await fs.readFile(filePath);

    const document =
      await getDocumentProxy(
        new Uint8Array(data));

    const { text } =
      await extractText(
        document,
        { mergePages: false });

    const pages =
      Array.isArray(text)
        ? text
        : [ text ];

    return pages
      .map(page => page.trim())
      .join('\n');
  }
}
