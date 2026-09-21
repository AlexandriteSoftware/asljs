import fs
  from 'node:fs/promises';
import { DocumentReader }
  from './reader.js';

export const TEXT_EXTENSIONS =
  [ '.md',
    '.markdown',
    '.mdx',
    '.txt',
    '.text',
    '.csv',
    '.json',
    '.yml',
    '.yaml' ];

/**
 * Reads UTF-8 text files verbatim. This is the reader used for markdown, the
 * base file type of a knowledge base.
 */
export class TextReader
  implements DocumentReader
{
  readonly name = 'text';

  readonly extensions = TEXT_EXTENSIONS;

  readonly verbatim = true;

  async readText(
      filePath: string
    ): Promise<string>
  {
    return await fs.readFile(
      filePath,
      'utf8');
  }
}
