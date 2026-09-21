import { resolveOutputFormat,
         writeResult }
  from '../output.js';
import { RelocateResult }
  from '../relocate.js';
import { CommandContext }
  from './context.js';

export interface RenameCommandOptions
{
  path: string;
  name: string;
  overwrite?: boolean;
  updateLinks?: boolean;
  dryRun?: boolean;
  format?: string;
}

export async function execRename(
    context: CommandContext,
    options: RenameCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const result =
    await context.client.call(
      'kb_rename',
      { path: options.path,
        name: options.name,
        overwrite: options.overwrite,
        updateLinks: options.updateLinks,
        dryRun: options.dryRun }) as RelocateResult;

  writeResult(
    context.environment,
    format,
    result,
    renderRelocation(result));
}

/**
 * Render a move or a rename: the transfer itself, then one line per rewritten
 * link, then anything that was left alone.
 */
export function renderRelocation(
    result: RelocateResult
  ): string[]
{
  const prefix =
    prefixFor(result.dryRun);

  const lines =
    [ `${prefix}move ${result.source} -> ${result.target}` ];

  for (const file of result.files) {
    for (const edit of file.edits) {
      lines.push(
        `${prefix}update ${file.path}:${edit.line}:${edit.column} ${
          edit.from} -> ${edit.to}`);
    }

    for (const skipped of file.skipped) {
      lines.push(
        `skipped ${file.path}:${skipped.line}:${skipped.column} ${
          skipped.from}: ${skipped.reason}`);
    }
  }

  return lines;
}

function prefixFor(
    dryRun: boolean
  ): string
{
  if (dryRun) {
    return 'would ';
  }

  return '';
}
