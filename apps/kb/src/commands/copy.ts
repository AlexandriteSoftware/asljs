import { TransferResult }
  from '../files.js';
import { resolveOutputFormat,
         writeResult }
  from '../output.js';
import { CommandContext }
  from './context.js';

export interface CopyCommandOptions
{
  source: string;
  target: string;
  overwrite?: boolean;
  format?: string;
}

export async function execCopy(
    context: CommandContext,
    options: CopyCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const result =
    await context.client.call(
      'kb_copy',
      { source: options.source,
        target: options.target,
        overwrite: options.overwrite }) as TransferResult;

  writeResult(
    context.environment,
    format,
    result,
    [ `${result.source} -> ${result.target}` ]);
}
