import { Environment }
  from '../environment.js';
import { createFolder }
  from '../files.js';
import { resolveOutputFormat,
         writeJson,
         writeLine }
  from '../output.js';

export interface MkdirCommandOptions
{
  path: string;
  format?: string;
}

export async function execMkdir(
    environment: Environment,
    options: MkdirCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const entry =
    await createFolder(
      environment.library,
      options.path);

  if (format === 'json') {
    writeJson(
      environment,
      entry);

    return;
  }

  writeLine(
    environment,
    entry.path);
}
