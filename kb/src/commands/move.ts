import { TransferResult }
  from '../files.js';
import { resolveOutputFormat,
         writeResult }
  from '../output.js';
import { RelocateResult }
  from '../relocate.js';
import { CommandContext }
  from './context.js';
import { renderRelocation }
  from './rename.js';

export interface MoveCommandOptions
{
  source: string;
  target: string;
  overwrite?: boolean;

  /**
   * Rewrite the links the move would otherwise break. Defaults to `true`.
   */
  updateLinks?: boolean;

  dryRun?: boolean;
  format?: string;
}

export async function execMove(
    context: CommandContext,
    options: MoveCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const result =
    await context.client.call(
      'kb_move',
      { source: options.source,
        target: options.target,
        overwrite: options.overwrite,
        updateLinks: options.updateLinks,
        dryRun: options.dryRun });

  if (options.updateLinks === false) {
    const transfer =
      result as TransferResult;

    writeResult(
      context.environment,
      format,
      transfer,
      [ `${transfer.source} -> ${transfer.target}` ]);

    return;
  }

  const relocation =
    result as RelocateResult;

  writeResult(
    context.environment,
    format,
    relocation,
    renderRelocation(relocation));
}
