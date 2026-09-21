import { Environment }
  from '../environment.js';
import { writeTextFile }
  from '../files.js';
import { resolveOutputFormat,
         writeJson,
         writeLine }
  from '../output.js';

export interface WriteCommandOptions
{
  path: string;

  /**
   * Text to write. When omitted, the content is read from standard input.
   */
  content?: string;

  overwrite?: boolean;
  format?: string;
}

export async function execWrite(
    environment: Environment,
    options: WriteCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const content =
    typeof options.content === 'string'
      ? options.content
      : await readInput(environment);

  const entry =
    await writeTextFile(
      environment.library,
      options.path,
      content,
      { overwrite: options.overwrite === true });

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

async function readInput(
    environment: Environment
  ): Promise<string>
{
  if (!environment.readInput) {
    throw new Error(
      'No content provided. Use --content or pipe the text into stdin.');
  }

  return await environment.readInput();
}
