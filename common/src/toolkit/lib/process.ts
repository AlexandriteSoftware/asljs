import { execSync,
         ExecSyncOptionsWithStringEncoding }
  from 'node:child_process';
import { log }
  from './../api.js';

export function start(
    command: string,
    cwd?: string
  ): string
{
  const currentWorkingDir =
    cwd
    ?? process.cwd();

  const options: ExecSyncOptionsWithStringEncoding =
    { cwd: currentWorkingDir,
      stdio: [ 'ignore', 'pipe', 'pipe' ],
      encoding: 'utf8' };

  log(
    'Executing command `%s` in directory `%s`.',
    command,
    currentWorkingDir);

  return execSync(
    command,
    options);
}

export function startSequence(
    commands: string[],
    cwd?: string
  ): void
{
  for (const command of commands) {
    start(
      command,
      cwd);
  }
}
