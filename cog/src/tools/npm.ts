import { type Logger,
         NullLogger }
  from 'asljs-logging';
import { type CommandRunner,
         type Tool }
  from './tool.js';

export interface NpmCommandOptions
{
  arguments?: readonly string[];
}

export interface ResolvedNpmCommand
{
  command: string;
  prefixArguments: string[];
}

/**
 * Node refuses to spawn npm.cmd directly without a shell (CVE-2024-27980), so
 * on Windows npm is run through cmd.exe /c instead of spawning it directly.
 */
export function resolveNpmCommand(
  ): ResolvedNpmCommand
{
  return process.platform === 'win32'
    ? { command: 'cmd.exe',
        prefixArguments:
          [ '/d',
            '/s',
            '/c',
            'npm' ] }
    : { command: 'npm',
        prefixArguments: [ ] };
}

export class NpmCliTool implements Tool
{
  readonly name = 'npm';

  constructor(
    readonly commandRunner: CommandRunner,
    readonly logger: Logger = new NullLogger()
  )
  {
  }

  async build(
    workingDirectory: string,
    options: NpmCommandOptions = {}
  ): Promise<void>
  {
    await this.run(
      'build',
      workingDirectory,
      options);
  }

  async test(
    workingDirectory: string,
    options: NpmCommandOptions = {}
  ): Promise<void>
  {
    await this.run(
      'test',
      workingDirectory,
      options);
  }

  private async run(
    script: string,
    workingDirectory: string,
    options: NpmCommandOptions
  ): Promise<void>
  {
    const { command, prefixArguments } =
      resolveNpmCommand();

    const commandArguments =
      [ ...prefixArguments,
        'run',
        script,
        ...options.arguments ?? [ ] ];

    this.logger.trace(
      'npm: running %s %o in %s',
      command,
      commandArguments,
      workingDirectory);

    const result =
      await this.commandRunner.run(
        command,
        commandArguments,
        workingDirectory);

    this.logger.trace(
      'npm: exit code %d\nstdout: %s\nstderr: %s',
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
        `npm run ${script} failed with exit code ${result.exitCode}`
          + (output.length > 0
            ? `: ${output}`
            : ''));
    }
  }
}
