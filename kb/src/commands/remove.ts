import { Environment }
  from '../environment.js';
import { removeEntry }
  from '../files.js';
import { resolveOutputFormat,
         writeJson,
         writeLine }
  from '../output.js';

export interface RemoveCommandOptions
{
  path: string;
  recursive?: boolean;
  format?: string;
}

export async function execRemove(
    environment: Environment,
    options: RemoveCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const removed =
    await removeEntry(
      environment.library,
      options.path,
      { recursive: options.recursive === true });

  if (format === 'json') {
    writeJson(
      environment,
      { path: removed });

    return;
  }

  writeLine(
    environment,
    removed);
}
