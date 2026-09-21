import { Environment }
  from '../environment.js';
import { resolveOutputFormat,
         writeJson,
         writeLines }
  from '../output.js';
import { RelocateResult,
         renameEntry }
  from '../relocate.js';

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
    environment: Environment,
    options: RenameCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const result =
    await renameEntry(
      environment.library,
      options.path,
      options.name,
      { overwrite: options.overwrite === true,
        updateLinks: options.updateLinks !== false,
        dryRun: options.dryRun === true,
        graph: environment.graph });

  if (format === 'json') {
    writeJson(
      environment,
      result);

    return;
  }

  writeLines(
    environment,
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
    result.dryRun
      ? 'would '
      : '';

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
