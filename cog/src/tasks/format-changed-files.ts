import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { type Context }
  from '../context.js';
import { type Task }
  from '../task.js';
import { AsljsFormatterTool }
  from '../tools/asljs-formatter.js';
import { DprintFormatterTool }
  from '../tools/dprint-formatter.js';
import { JbDotnetFormatterTool }
  from '../tools/jb-dotnet-formatter.js';

export interface FormatChangedFilesTaskParameters
{
  workingDirectory?: string;
  asljsConfigPath?: string;
  markdownConfigPath?: string;
  dotnetTarget?: string;
  dotnetProfile?: string;
}

export class FormatChangedFilesTask implements Task<string[]>
{
  constructor(
    readonly parameters: FormatChangedFilesTaskParameters = {}
  )
  {
  }

  async run(
    context: Context
  ): Promise<string[]>
  {
    const workingDirectory =
      this.parameters.workingDirectory
      ?? process.cwd();

    context.logger.debug(
      'format-changed-files: starting in %s',
      workingDirectory);

    const changedFiles =
      await context.run(
        context.createTask<string[]>(
        'get-changed-files',
        { workingDirectory }
      ));

    const files =
      await existingFiles(
        workingDirectory,
        changedFiles);

    const typeScriptFiles =
      files.filter(
        file =>
        hasExtension(
          file,
          [ '.ts',
            '.tsx' ]));

    const markdownFiles =
      files.filter(
        file =>
        hasExtension(
          file,
          [ '.md' ]));

    const csharpFiles =
      files.filter(
        file =>
        hasExtension(
          file,
          [ '.cs' ]));

    context.logger.trace(
      'format-changed-files: typescript %o, markdown %o, csharp %o',
      typeScriptFiles,
      markdownFiles,
      csharpFiles);

    await context.getTool<AsljsFormatterTool>(
      'asljs-formatter'
    )
      .format(
        workingDirectory,
        this.parameters.asljsConfigPath
          ?? 'dprint.json',
        typeScriptFiles);

    await context.getTool<DprintFormatterTool>(
      'dprint-formatter'
    )
      .format(
        workingDirectory,
        this.parameters.markdownConfigPath
          ?? 'dprint.md.json',
        markdownFiles);

    if (csharpFiles.length > 0) {
      const target =
        this.parameters.dotnetTarget
        ?? await findDotnetTarget(
          workingDirectory);

      await context.getTool<JbDotnetFormatterTool>(
        'jb-dotnet-formatter'
      )
        .format(
          workingDirectory,
          { target,
            files: csharpFiles,
            profile:
              this.parameters.dotnetProfile });
    }

    const formattedFiles =
      files.filter(
        file =>
        typeScriptFiles.includes(
          file)
        || markdownFiles.includes(
          file)
        || csharpFiles.includes(
          file));

    context.logger.debug(
      'format-changed-files: done, formatted %d file(s)',
      formattedFiles.length);

    return formattedFiles;
  }
}

async function existingFiles(
    workingDirectory: string,
    files: readonly string[]
  ): Promise<string[]>
{
  const existing: string[] = [ ];

  for (const file of files) {
    try {
      const stats =
        await fs.stat(
          path.resolve(
            workingDirectory,
            file));

      if (stats.isFile()) {
        existing.push(
          file);
      }
    } catch (error) {
      if (
        (error as NodeJS.ErrnoException).code
        !== 'ENOENT'
      ) {
        throw error;
      }
    }
  }

  return existing;
}

function hasExtension(
    file: string,
    extensions: readonly string[]
  ): boolean
{
  return extensions.includes(
    path.extname(
      file)
      .toLowerCase());
}

async function findDotnetTarget(
    workingDirectory: string
  ): Promise<string>
{
  const entries =
    await fs.readdir(
      workingDirectory,
      { withFileTypes: true });

  for (const extension of [ '.slnx',
                            '.sln',
                            '.csproj' ]) {
    const target =
      entries.find(
        entry =>
        entry.isFile()
        && path.extname(
          entry.name)
            .toLowerCase()
          === extension);

    if (target) {
      return target.name;
    }
  }

  throw new Error(
    'A .NET solution or project is required to format C# files');
}
