import { watch }
  from 'node:fs';
import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { compileTemplate,
         GENERATED_HEADER,
         TemplateCompileError }
  from './compile-template.js';

const TEMPLATE_SUFFIX = '.tpl.html';

const MODULE_SUFFIX = '.tpl.ts';

const SKIPPED_DIRECTORIES =
  new Set(
    [ 'node_modules',
      'dist',
      'build',
      '.git' ]);

const USAGE =
  `Usage: data-bind-compile [--watch] [path ...]

Compiles each *.tpl.html template under the given files and directories
(default: src) to the *.tpl.ts module next to it.

  --watch   compile again whenever a template changes
`;

export interface CompileTemplatesIo
{
  cwd: string;
  stdout: (text: string) => void;
  stderr: (text: string) => void;
}

/**
 * Runs `data-bind-compile` and returns its exit code: 0 when every template
 * compiled, 1 when one did not, 2 for a usage error. With `--watch` it keeps
 * compiling after it returns, until the process ends.
 */
export async function runCompileTemplatesCli(
    args: string[],
    io: CompileTemplatesIo
  ): Promise<number>
{
  let watchMode = false;

  const inputs: string[] = [ ];

  for (const arg of args) {
    if (
      arg === '--help'
      || arg === '-h'
    ) {
      io.stdout(USAGE);

      return 0;
    }

    if (arg === '--watch') {
      watchMode = true;

      continue;
    }

    if (arg.startsWith('-')) {
      io.stderr(
        `data-bind-compile: unknown option '${arg}'\n\n${USAGE}`);

      return 2;
    }

    inputs.push(
      path.resolve(
        io.cwd,
        arg));
  }

  if (inputs.length === 0) {
    inputs.push(
      path.resolve(
        io.cwd,
        'src'));
  }

  let failed = false;

  for (const input of inputs) {
    const result =
      await compileUnder(
        input,
        io);

    failed ||= !result;
  }

  if (watchMode) {
    for (const input of inputs) {
      watchTemplates(
        input,
        io);
    }
  }

  return failed
    ? 1
    : 0;
}

/**
 * Compiles every template under `input`, a template file or a directory, and
 * removes generated modules whose template is gone.
 */
async function compileUnder(
    input: string,
    io: CompileTemplatesIo
  ): Promise<boolean>
{
  const stat =
    await fs.stat(input)
    .catch(() => null);

  if (stat === null) {
    io.stderr(
      `data-bind-compile: '${
        relative(
          input,
          io)
      }' does not exist\n`);

    return false;
  }

  if (stat.isFile()) {
    return compileFile(
      input,
      io);
  }

  let ok = true;

  for (const file of await walk(input)) {
    if (file.endsWith(TEMPLATE_SUFFIX)) {
      ok =
        await compileFile(
          file,
          io)
        && ok;
    } else if (file.endsWith(MODULE_SUFFIX)) {
      await removeOrphan(
        file,
        io);
    }
  }

  return ok;
}

/**
 * Compiles one template, writing its module only when the content changed, so
 * a compiler watching the module does not rebuild for nothing.
 */
async function compileFile(
    templatePath: string,
    io: CompileTemplatesIo
  ): Promise<boolean>
{
  const source =
    await fs.readFile(
      templatePath,
      'utf8');

  let code: string;

  try {
    code =
      compileTemplate(
        source,
        { fileName:
            relative(
              templatePath,
              io) });
  } catch (error) {
    if (
      error
      instanceof TemplateCompileError
    ) {
      io.stderr(
        `${error.message}\n`);

      return false;
    }

    throw error;
  }

  const modulePath =
    toModulePath(templatePath);

  const existing =
    await fs.readFile(
      modulePath,
      'utf8')
    .catch(() => null);

  if (existing !== code) {
    await fs.writeFile(
      modulePath,
      code);

    io.stdout(
      `${
        relative(
          modulePath,
          io)
      }\n`);
  }

  return true;
}

/**
 * Removes a generated module whose template no longer exists. A `.tpl.ts` file
 * that does not start with the generated header was written by hand and is
 * left alone.
 */
async function removeOrphan(
    modulePath: string,
    io: CompileTemplatesIo
  ): Promise<void>
{
  const templatePath =
    modulePath.slice(
      0,
      -MODULE_SUFFIX.length)
    + TEMPLATE_SUFFIX;

  const templateExists =
    await fs.stat(templatePath)
    .then(
      () => true,
      () => false);

  if (templateExists) {
    return;
  }

  const content =
    await fs.readFile(
      modulePath,
      'utf8');

  if (!content.startsWith(GENERATED_HEADER)) {
    return;
  }

  await fs.rm(modulePath);

  io.stdout(
    `removed ${
      relative(
        modulePath,
        io)
    }\n`);
}

function watchTemplates(
    input: string,
    io: CompileTemplatesIo
  ): void
{
  const directory =
    input.endsWith(TEMPLATE_SUFFIX)
    ? path.dirname(input)
    : input;

  watch(
    directory,
    { recursive: true },
    (
        _event,
        fileName
      ) =>
    {
      if (
        fileName === null
        || !fileName.endsWith(TEMPLATE_SUFFIX)
      ) {
        return;
      }

      const templatePath =
        path.join(
          directory,
          fileName);

      fs.stat(templatePath)
        .then(
          () =>
            compileFile(
              templatePath,
              io),
          () =>
            removeOrphan(
              toModulePath(templatePath),
              io)
              .catch(() => { }))
        .catch(
          (error: unknown) =>
            io.stderr(
              `data-bind-compile: ${String(error)}\n`));
    });

  io.stdout(
    `watching ${
      relative(
        directory,
        io) || '.'
    }\n`);
}

/**
 * Lists the files under `directory`, skipping dependency and build output.
 */
async function walk(
    directory: string
  ): Promise<string[]>
{
  const entries =
    await fs.readdir(
      directory,
      { withFileTypes: true });

  const files: string[] = [ ];

  for (const entry of entries) {
    const entryPath =
      path.join(
        directory,
        entry.name);

    if (entry.isDirectory()) {
      if (!SKIPPED_DIRECTORIES.has(entry.name)) {
        files.push(
          ...await walk(entryPath));
      }
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function toModulePath(
    templatePath: string
  ): string
{
  return templatePath.slice(
    0,
    -TEMPLATE_SUFFIX.length)
    + MODULE_SUFFIX;
}

function relative(
    filePath: string,
    io: CompileTemplatesIo
  ): string
{
  return path.relative(
    io.cwd,
    filePath).replace(
      /\\/g,
      '/');
}
