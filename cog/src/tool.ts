export interface Tool
{
  readonly name: string;
}

export interface CommandResult
{
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface CommandRunner
{
  run(
    command: string,
    arguments_: readonly string[],
    workingDirectory: string
  ): Promise<CommandResult>;
}
