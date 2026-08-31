import { spawn }
  from 'node:child_process';
import { type CommandResult,
         type CommandRunner }
  from './tool.js';

export class NodeCommandRunner implements CommandRunner
{
  async run(
    command: string,
    arguments_: readonly string[],
    workingDirectory: string
  ): Promise<CommandResult>
  {
    return await new Promise<CommandResult>(
      (
          resolve,
          reject
        ) =>
      {
        const child =
          spawn(
            command,
            arguments_,
            { cwd: workingDirectory,
              shell: false,
              stdio:
                [ 'ignore',
                  'pipe',
                  'pipe' ] });

        let stdout = '';
        let stderr = '';

        child.stdout.setEncoding(
          'utf8');

        child.stderr.setEncoding(
          'utf8');

        child.stdout.on(
          'data',
          (
              chunk
            ) =>
          {
            stdout += chunk as string;
          });

        child.stderr.on(
          'data',
          (
              chunk
            ) =>
          {
            stderr += chunk as string;
          });

        child.on(
          'error',
          reject);

        child.on(
          'close',
          (
              exitCode
            ) =>
          {
            resolve(
              { exitCode:
                  exitCode ?? -1,
                stdout,
                stderr });
          });
      }
    );
  }
}
