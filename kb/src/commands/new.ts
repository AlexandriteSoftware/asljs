import { LibraryEntry }
  from '../files.js';
import { resolveOutputFormat,
         writeResult }
  from '../output.js';
import { CommandContext }
  from './context.js';

export interface NewCommandOptions
{
  path: string;
  title?: string;
  tags?: string[];
  body?: string;
  overwrite?: boolean;
  format?: string;
}

export async function execNew(
    context: CommandContext,
    options: NewCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const entry =
    await context.client.call(
      'kb_new',
      { path: options.path,
        title: options.title,
        tags: options.tags,
        body: options.body,
        overwrite: options.overwrite }) as LibraryEntry;

  writeResult(
    context.environment,
    format,
    entry,
    [ entry.path ]);
}
