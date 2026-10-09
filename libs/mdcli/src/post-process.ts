import { readFile,
         stat,
         writeFile }
  from 'node:fs/promises';
import path
  from 'node:path';
import { runCommand }
  from './run-command.js';

/**
 * What a tool's configuration file, e.g. `rq.json`, says.
 */
export interface ToolConfig
{
  /**
   * A command line run, in the folder of the configuration file, with the
   * markdown files a command wrote as arguments, e.g. a project's formatter
   * and linter.
   */
  markdownPostProcessing?: string;
}

/**
 * Where `postProcess` reports a failure.
 */
export interface PostProcessIo
{
  cwd: string;
  stderr: { write(text: string): unknown; };
}

const written = new Set<string>();

/**
 * Writes a markdown file and remembers it for `postProcess`.
 */
export async function writeMarkdown(
    file: string,
    text: string
  ): Promise<void>
{
  await writeFile(
    file,
    text,
    'utf8');

  written.add(
    path.resolve(file));
}

/**
 * The markdown files written since the last call, and forgets them.
 */
export function takeWritten(
  ): string[]
{
  const files =
    [ ...written ];

  written.clear();

  return files;
}

/**
 * The nearest configuration file named `name`, e.g. `rq.json`, of `folder` or
 * a parent, and its folder; `null` when there is none.
 */
export async function findConfig(
    folder: string,
    name: string
  ): Promise<{ folder: string; config: ToolConfig; } | null>
{
  let current: string | null =
    path.resolve(folder);

  while (current !== null) {
    const file =
      path.join(
        current,
        name);

    if ((await stat(file).catch(() => null))?.isFile()) {
      return { folder: current,
               config:
                 await readConfig(file) };
    }

    const parent =
      path.dirname(current);

    current =
      parent === current
      ? null
      : parent;
  }

  return null;
}

async function readConfig(
    file: string
  ): Promise<ToolConfig>
{
  let config: unknown;

  try {
    config =
      JSON.parse(
        await readFile(
          file,
          'utf8'));
  } catch (error) {
    throw new Error(
      `${file}: not valid JSON: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`);
  }

  const command =
    (config as ToolConfig | null)?.markdownPostProcessing;

  if (
    typeof config
    !== 'object'
    || config === null
    || command !== undefined
       && typeof command
          !== 'string'
  ) {
    throw new Error(
      `${file}: "markdownPostProcessing" must be a command line.`);
  }

  return config as ToolConfig;
}

/**
 * Runs the `markdownPostProcessing` command of the nearest configuration file
 * named `config`, e.g. `rq.json`, with the markdown files a command wrote and
 * that still exist, relative to the folder of the configuration file, where it
 * runs. Returns 1 and reports the output when the command fails, 0 otherwise
 * or when there is nothing to do.
 */
export async function postProcess(
    io: PostProcessIo,
    files: readonly string[],
    config: string
  ): Promise<number>
{
  const existing: string[] = [ ];

  for (const file of files) {
    if ((await stat(file).catch(() => null))?.isFile()) {
      existing.push(file);
    }
  }

  if (existing.length === 0) {
    return 0;
  }

  const found =
    await findConfig(
      io.cwd,
      config);

  const command =
    found?.config.markdownPostProcessing?.trim();

  if (
    found === null
    || command === undefined
    || command === ''
  ) {
    return 0;
  }

  const line =
    [ command,
      ...existing.map(
        file =>
        JSON.stringify(
          path.relative(
            found.folder,
            file)
            .split(path.sep)
            .join('/'))) ]
    .join(' ');

  const run =
    await runCommand(
      line,
      found.folder)
    .catch(
      (
        error: unknown
      ) => ({ code: -1,
              stdout: '',
              stderr:
                error instanceof Error
          ? error.message
          : String(error) }));

  if (run.code === 0) {
    return 0;
  }

  io.stderr.write(
    `Post-processing failed: ${command} exited with code ${run.code}\n${
      `${run.stdout}${run.stderr}`.trimEnd()
    }\n`);

  return 1;
}
