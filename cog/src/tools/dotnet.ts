import { type Logger,
         NullLogger }
  from 'asljs-logging';
import { type CommandRunner,
         type Tool }
  from './tool.js';

export interface DotnetCommandOptions
{
  target?: string;
  arguments?: readonly string[];
}

export class DotnetCliTool implements Tool
{
  readonly name = 'dotnet';

  constructor(
    readonly commandRunner: CommandRunner,
    readonly logger: Logger = new NullLogger()
  )
  {
  }

  async build(
    workingDirectory: string,
    options: DotnetCommandOptions = {}
  ): Promise<void>
  {
    await this.run(
      'build',
      workingDirectory,
      options);
  }

  async test(
    workingDirectory: string,
    options: DotnetCommandOptions = {}
  ): Promise<void>
  {
    await this.run(
      'test',
      workingDirectory,
      options);
  }

  private async run(
    command: string,
    workingDirectory: string,
    options: DotnetCommandOptions
  ): Promise<void>
  {
    const commandArguments =
      [ command,
        ...(options.target
        ? [ options.target ]
        : [ ]),
        ...options.arguments ?? [ ] ];

    this.logger.trace(
      'dotnet: running dotnet %o in %s',
      commandArguments,
      workingDirectory);

    const result =
      await this.commandRunner.run(
        'dotnet',
        commandArguments,
        workingDirectory);

    this.logger.trace(
      'dotnet: exit code %d\nstdout: %s\nstderr: %s',
      result.exitCode,
      result.stdout,
      result.stderr);

    if (result.exitCode !== 0) {
      const output =
        [ result.stdout.trim(),
          result.stderr.trim() ]
        .filter(
          line => line.length > 0)
        .join(
          '\n');

      throw new Error(
        `dotnet ${command} failed with exit code ${result.exitCode}`
          + (output.length > 0
            ? `: ${output}`
            : ''));
    }
  }
}
