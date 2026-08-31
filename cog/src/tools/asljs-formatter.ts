import { type CommandRunner,
         type Tool }
  from './tool.js';

export class AsljsFormatterTool implements Tool
{
  readonly name = 'asljs-formatter';

  constructor(
    readonly commandRunner: CommandRunner
  )
  {
  }

  async format(
    workingDirectory: string,
    configPath: string,
    files: readonly string[]
  ): Promise<void>
  {
    if (files.length === 0) {
      return;
    }

    await this.run(
      workingDirectory,
      [ 'dprint',
        'fmt',
        '--config',
        configPath,
        ...files ]);

    for (const file of files) {
      await this.run(
        workingDirectory,
        [ 'sfmt',
          'format',
          file ]);
    }
  }

  private async run(
    workingDirectory: string,
    arguments_: readonly string[]
  ): Promise<void>
  {
    const result =
      await this.commandRunner.run(
        resolveNpxCommand(),
        arguments_,
        workingDirectory);

    if (result.exitCode !== 0) {
      throw new Error(
        `${
          arguments_.slice(
            0,
            2).join(' ')
        } failed with exit code ${result.exitCode}: ${result.stderr.trim()}`);
    }
  }
}

function resolveNpxCommand(
  ): string
{
  return process.platform === 'win32'
    ? 'npx.cmd'
    : 'npx';
}
