import { type CommandRunner,
         type Tool }
  from './tool.js';

export class DprintFormatterTool implements Tool
{
  readonly name = 'dprint-formatter';

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

    const result =
      await this.commandRunner.run(
        resolveNpxCommand(),
        [ 'dprint',
          'fmt',
          '--config',
          configPath,
          ...files ],
        workingDirectory);

    if (result.exitCode !== 0) {
      throw new Error(
        `dprint fmt failed with exit code ${result.exitCode}: ${result.stderr.trim()}`);
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
