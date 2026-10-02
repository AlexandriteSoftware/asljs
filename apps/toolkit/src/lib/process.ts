import { type Logger }
  from 'asljs-logging';
import { execSync,
         ExecSyncOptionsWithStringEncoding }
  from 'node:child_process';

export interface StartOptions extends Partial<ExecSyncOptionsWithStringEncoding>
{
  /**
   * Leave the command out of the log.
   *
   * For a command whose arguments are a long file list, where the caller logs
   * something readable instead.
   */
  quiet?: boolean;

  /** Where the command is traced, when it should be. */
  logger?: Logger;
}

export function start(
    command: string,
    options: StartOptions = {}
  ): string
{
  const currentWorkingDir =
    options.cwd
    ?? process.cwd();

  const { quiet, logger, ...execOverrides } = options;

  const execOptions: ExecSyncOptionsWithStringEncoding =
    Object.assign(
      { cwd: currentWorkingDir,
        stdio: 'inherit',
        encoding: 'utf8' },
      execOverrides);

  if (
    !quiet
    && logger
  ) {
    logger.trace(
      'Run `%s` in `%s`.',
      command,
      currentWorkingDir);
  }

  return execSync(
    command,
    execOptions);
}

export function startSequence(
    commands: string[],
    cwd?: string,
    logger?: Logger
  ): void
{
  for (const command of commands) {
    start(
      command,
      { cwd,
        logger });
  }
}
