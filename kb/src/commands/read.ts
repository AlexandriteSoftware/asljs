import { Environment }
  from '../environment.js';
import { statEntry }
  from '../files.js';
import { resolveLibraryPath }
  from '../library.js';
import { resolveOutputFormat,
         writeJson }
  from '../output.js';

export interface ReadCommandOptions
{
  path: string;
  format?: string;
}

/**
 * Print the text of a library document. Markdown and other text files are
 * printed verbatim; other file types are printed through their reader.
 */
export async function execRead(
    environment: Environment,
    options: ReadCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const entry =
    await statEntry(
      environment.library,
      options.path);

  if (entry.kind !== 'file') {
    throw new Error(
      `Not a file: ${entry.path}`);
  }

  const absolute =
    resolveLibraryPath(
      environment.library,
      entry.path);

  const reader =
    environment.readers.find(absolute);

  if (!reader) {
    throw new Error(
      `Unsupported file type: ${entry.path}`);
  }

  const text =
    await reader.readText(absolute);

  if (format === 'json') {
    writeJson(
      environment,
      { path: entry.path,
        reader: reader.name,
        verbatim: reader.verbatim,
        text });

    return;
  }

  environment.stdout.write(
    text.endsWith('\n')
      ? text
      : `${text}\n`);
}
