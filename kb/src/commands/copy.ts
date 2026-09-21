import { Environment }
  from '../environment.js';
import { copyEntry }
  from '../files.js';
import { resolveOutputFormat,
         writeJson,
         writeLine }
  from '../output.js';

export interface CopyCommandOptions
{
  source: string;
  target: string;
  overwrite?: boolean;
  format?: string;
}

export async function execCopy(
    environment: Environment,
    options: CopyCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const result =
    await copyEntry(
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
