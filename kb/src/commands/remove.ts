import { resolveOutputFormat,
         writeResult }
  from '../output.js';
import { CommandContext }
  from './context.js';

export interface RemoveCommandOptions
{
  path: string;
  recursive?: boolean;
  format?: string;
}

export async function execRemove(
    context: CommandContext,
    options: RemoveCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const removed =
    await context.client.call(
      'kb_remove',
      { path: options.path,
        recursive: options.recursive }) as { path: string; };

  writeResult(
    context.environment,
    format,
    removed,
    [ removed.path ]);
}
