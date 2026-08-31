import { type Context }
  from '../context.js';
import { type Task }
  from '../task.js';
import { GitTool }
  from '../tools/git.js';

export interface CommitIfChangedTaskParameters
{
  workingDirectory?: string;
}

export class CommitIfChangedTask implements Task<string | null>
{
  constructor(
    readonly parameters: CommitIfChangedTaskParameters = {}
  )
  {
  }

  async run(
    context: Context
  ): Promise<string | null>
  {
    const workingDirectory =
      this.parameters.workingDirectory
      ?? process.cwd();

    context.logger.debug(
      'commit-if-changed: starting in %s',
      workingDirectory);

    const changedFiles =
      await context.getTool<GitTool>(
      'git'
    )
      .getChangedFiles(
        workingDirectory);

    context.logger.trace(
      'commit-if-changed: changed files: %o',
      changedFiles);

    if (changedFiles.length === 0) {
      context.logger.debug(
        'commit-if-changed: no changes to commit');

      context.logger.debug(
        'commit-if-changed: done');

      return null;
    }

    const message =
      await context.run(
        context.createTask<string>(
          'commit',
          { workingDirectory }));

    context.logger.debug(
      'commit-if-changed: done');

    return message;
  }
}
