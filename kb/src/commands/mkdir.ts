import { LibraryEntry }
  from '../files.js';
import { resolveOutputFormat,
         writeResult }
  from '../output.js';
import { CommandContext }
  from './context.js';

export interface MkdirCommandOptions
{
  path: string;
  format?: string;
}

export async function execMkdir(
    context: CommandContext,
    options: MkdirCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const entry =
    await context.client.call(
      'kb_mkdir',
      { path: options.path }) as LibraryEntry;

  writeResult(
    context.environment,
    format,
    entry,
    [ entry.path ]);
}
