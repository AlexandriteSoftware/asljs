import { execSync,
         ExecSyncOptionsWithStringEncoding }
  from 'node:child_process';

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
      stdio: 'inherit',
      encoding: 'utf8' };

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

export function startGit(
    command: string,
    cwd?: string
  ): string
{
  const currentWorkingDir =
    cwd ?? process.cwd();

  const options: ExecSyncOptionsWithStringEncoding =
    { cwd: currentWorkingDir,
      stdio: [ 'ignore', 'pipe', 'pipe' ],
      encoding: 'utf8' };

  return execSync(
    command,
    options);
}
