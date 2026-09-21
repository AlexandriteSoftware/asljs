import { LibraryEntry }
  from '../files.js';
import { resolveOutputFormat,
         writeResult }
  from '../output.js';
import { CommandContext }
  from './context.js';

export interface WriteCommandOptions
{
  path: string;

  /**
   * Text to write. Read from standard input when absent.
   */
  content?: string;

  overwrite?: boolean;
  format?: string;
}

export async function execWrite(
    context: CommandContext,
    options: WriteCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const content =
    await contentOf(
      context,
      options);

  const entry =
    await context.client.call(
      'kb_write',
      { path: options.path,
        content,
        overwrite: options.overwrite }) as LibraryEntry;

  writeResult(
    context.environment,
    format,
    entry,
    [ entry.path ]);
}

async function contentOf(
    context: CommandContext,
    options: WriteCommandOptions
  ): Promise<string>
{
  if (
    typeof options.content
    === 'string'
  ) {
    return options.content;
  }

  const readInput =
    context.environment.readInput;

  if (!readInput) {
    throw new Error(
      'No content provided. Use --content or pipe the text into stdin.');
  }

  return await readInput();
}
