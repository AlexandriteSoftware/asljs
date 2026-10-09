import { spawn }
  from 'node:child_process';

export interface CommandRun
{
  code: number;
  stdout: string;
  stderr: string;
}

/**
 * Runs a shell command line in a folder, with `input` on standard input.
 */
export function runCommand(
    command: string,
    cwd: string,
    input = ''
  ): Promise<CommandRun>
{
  return run(
    command,
    [ ],
    true,
    cwd,
    input);
}

/**
 * Runs a program with arguments, without a shell, in a folder; `env`
 * replaces the environment when given.
 */
export function runProgram(
    program: string,
    args: readonly string[],
    cwd: string,
    env?: NodeJS.ProcessEnv
  ): Promise<CommandRun>
{
  return run(
    program,
    args,
    false,
    cwd,
    '',
    env);
}

function run(
    command: string,
    args: readonly string[],
    shell: boolean,
    cwd: string,
    input: string,
    env?: NodeJS.ProcessEnv
  ): Promise<CommandRun>
{
  return new Promise(
    (
        resolve,
        reject
      ) =>
    {
      const child =
        spawn(
          command,
          args,
          { cwd,
            env,
            shell,
            windowsHide: true,
            stdio:
              [ 'pipe',
                'pipe',
                'pipe' ] });

      let stdout = '';
      let stderr = '';

      child.stdout.on(
        'data',
        (
            chunk
          ) =>
        {
          stdout += String(chunk);
        });

      child.stderr.on(
        'data',
        (
            chunk
          ) =>
        {
          stderr += String(chunk);
        });

      child.on(
        'error',
        reject);

      child.on(
        'close',
        (
            code
          ) =>
        {
          resolve(
            { code:
                code ?? -1,
              stdout,
              stderr });
        });

      child.stdin.end(
        input,
        'utf8');
    });
}
