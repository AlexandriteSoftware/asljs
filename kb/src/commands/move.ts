import { Environment }
  from '../environment.js';
import { moveEntry }
  from '../files.js';
import { resolveOutputFormat,
         writeJson,
         writeLine }
  from '../output.js';

export interface MoveCommandOptions
{
  source: string;
  target: string;
  overwrite?: boolean;
  format?: string;
}

export async function execMove(
    environment: Environment,
    options: MoveCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

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

  writeLine(
    environment,
    `${result.source} -> ${result.target}`);
}
