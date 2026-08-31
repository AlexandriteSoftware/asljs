import { type Context }
  from '../context.js';
import { type Task }
  from '../task.js';
import { GitTool }
  from '../tools/git.js';

export interface CommitTaskParameters
{
  workingDirectory?: string;
}

export class CommitTask implements Task<string>
{
  constructor(
    readonly parameters: CommitTaskParameters = {}
  )
  {
  }

  async run(
    context: Context
  ): Promise<string>
  {
    const workingDirectory =
      this.parameters.workingDirectory
      ?? process.cwd();

    context.logger.debug(
      'commit: starting in %s',
      workingDirectory);

    const message =
      await context.run(
        context.createTask<string>(
        'get-commit-message',
        { workingDirectory }
      ));

    await context.getTool<GitTool>(
      'git'
    )
      .commit(
        workingDirectory,
        message);

    context.logger.debug(
      'commit: done, committed with message %o',
      message);

    return message;
  }
}
