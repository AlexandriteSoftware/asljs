import { PdfReader }
  from './pdf-reader.js';
import { ReaderRegistry }
  from './reader.js';
import { TextReader }
  from './text-reader.js';

/**
 * Create the registry used by the CLI and the MCP server: text files are read
 * verbatim, PDF files are read through their text layer.
 */
export function createDefaultReaderRegistry(
  ): ReaderRegistry
{
  const registry =
    new ReaderRegistry();

  registry.register(
    new TextReader());

  registry.register(
    new PdfReader());

  return registry;
}
