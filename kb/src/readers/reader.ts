import path
  from 'node:path';

/**
 * Extracts plain text from one family of file types. Readers make non-markdown
 * files searchable without teaching the rest of the package about their
 * formats.
 */
export interface DocumentReader
{
  /**
   * Stable reader name, used in diagnostics and in `kb read --format text`.
   */
  readonly name: string;

  /**
   * Lowercase file extensions, including the leading dot.
   */
  readonly extensions: string[];

  /**
   * True when the reader returns the file content verbatim, so that reported
   * line numbers match the lines of the file on disk.
   */
  readonly verbatim: boolean;

  readText: (filePath: string) => Promise<string>;
}

export class ReaderRegistry
{
  private readonly readers = new Map<string, DocumentReader>();

  register(
      reader: DocumentReader
    ): void
  {
    for (const extension of reader.extensions) {
      this.readers.set(
        extension.toLowerCase(),
        reader);
    }
  }

  /**
   * Find the reader registered for the extension of the given path, or
   * `undefined` when the file type is not supported.
   */
  find(
      filePath: string
    ): DocumentReader | undefined
  {
    return this.readers.get(
      path.extname(filePath).toLowerCase());
  }

  /**
   * True when a reader is registered for the extension of the given path.
   */
  supports(
      filePath: string
    ): boolean
  {
    return this.find(filePath) !== undefined;
  }

  /**
   * All registered extensions, sorted alphabetically.
   */
  extensions(): string[]
  {
    return [ ...this.readers.keys() ].sort();
  }

  /**
   * Extract the text of a file. Throws when the file type has no reader.
   */
  async readText(
      filePath: string
    ): Promise<string>
  {
    const reader =
      this.find(filePath);

    if (!reader) {
      throw new Error(
        `Unsupported file type: ${path.extname(filePath) || filePath}`);
    }

    return await reader.readText(filePath);
  }
}
