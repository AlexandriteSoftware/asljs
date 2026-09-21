import { Environment }
  from '../environment.js';
import { moveEntry }
  from '../files.js';
import { resolveOutputFormat,
         writeJson,
         writeLines }
  from '../output.js';
import { relocateEntry }
  from '../relocate.js';
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
    environment: Environment,
    options: MoveCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  if (options.updateLinks === false) {
    const result =
      await moveEntry(
        environment.library,
        options.source,
        options.target,
        { overwrite: options.overwrite === true });

    if (format === 'json') {
      writeJson(
        environment,
        result);

      return;
    }

    writeLines(
      environment,
      [ `${result.source} -> ${result.target}` ]);

    return;
  }

  const result =
    await relocateEntry(
      environment.library,
      options.source,
      options.target,
      { overwrite: options.overwrite === true,
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
