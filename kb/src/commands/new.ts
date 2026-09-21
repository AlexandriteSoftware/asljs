import { Environment }
  from '../environment.js';
import { createNote }
  from '../notes.js';
import { resolveOutputFormat,
         writeJson,
         writeLine }
  from '../output.js';

export interface NewCommandOptions
{
  path: string;
  title?: string;
  tags?: string[];
  body?: string;
  overwrite?: boolean;
  format?: string;
}

export async function execNew(
    environment: Environment,
    options: NewCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const entry =
    await createNote(
      environment.library,
      options.path,
      { title: options.title,
        tags: options.tags,
        body: options.body,
        overwrite: options.overwrite === true });

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
