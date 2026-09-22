import { LibraryEntry }
  from '../files.js';
import { resolveOutputFormat,
         writeResult }
  from '../output.js';
import { CommandContext }
  from './context.js';

export interface ListCommandOptions
{
  pattern?: string;
  kind?: string;
  hidden?: boolean;
  format?: string;
}

export async function execList(
    context: CommandContext,
    options: ListCommandOptions = {}
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const entries =
    await context.client.call(
      'kb_list',
      { pattern: options.pattern,
        kind: options.kind,
        hidden: options.hidden }) as LibraryEntry[];

  writeResult(
    context.environment,
    format,
    entries,
    entries.map(describe));
}

function describe(
    entry: LibraryEntry
  ): string
{
  if (entry.kind === 'folder') {
    return `${entry.path}/`;
  }

  return entry.path;
}
