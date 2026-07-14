import { execSync,
         ExecSyncOptionsWithStringEncoding }
  from 'node:child_process';
import { log }
  from './../api.js';

export function start(
    command: string,
    options: Partial<ExecSyncOptionsWithStringEncoding> = { }
  ): string
{
  const currentWorkingDir =
    options.cwd
    ?? process.cwd();

  const execOptions: ExecSyncOptionsWithStringEncoding =
    Object.assign(
      { cwd: currentWorkingDir,
        stdio: 'inherit',
        encoding: 'utf8' },
      options);

  log(
    'Run `%s` in `%s`.',
    command,
    currentWorkingDir);

  return execSync(
    command,
    execOptions);
}

export function startSequence(
    commands: string[],
    cwd?: string
  ): void
{
  for (const command of commands) {
    start(
      command,
      { cwd });
  }
}
