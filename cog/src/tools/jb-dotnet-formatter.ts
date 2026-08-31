import path
  from 'node:path';
import { type CommandRunner,
         type Tool }
  from './tool.js';

export interface JbDotnetFormatOptions
{
  target: string;
  files: readonly string[];
  profile?: string;
}

export class JbDotnetFormatterTool implements Tool
{
  readonly name = 'jb-dotnet-formatter';

  constructor(
    readonly commandRunner: CommandRunner
  )
  {
  }

  async format(
    workingDirectory: string,
    options: JbDotnetFormatOptions
  ): Promise<void>
  {
    if (options.files.length === 0) {
      return;
    }

    const includes =
      options.files
      .map(
        file =>
          path.relative(
            workingDirectory,
            path.resolve(
              workingDirectory,
              file))
            .replace(
              /\\/g,
              '/'))
      .join(
        ';');

    const result =
      await this.commandRunner.run(
        'jb',
        [ 'cleanupcode',
          `--include=${includes}`,
          ...(options.profile
          ? [ `--profile=${options.profile}` ]
          : [ ]),
          options.target ],
        workingDirectory);

    if (result.exitCode !== 0) {
      throw new Error(
        `jb cleanupcode failed with exit code ${result.exitCode}: ${result.stderr.trim()}`);
    }
  }
}
