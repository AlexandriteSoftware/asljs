import { type Context }
  from '../context.js';
import { type Task }
  from '../task.js';
import { GitTool }
  from '../tools/git.js';

export interface GetChangedFilesTaskParameters
{
  workingDirectory?: string;
}

export class GetChangedFilesTask implements Task<string[]>
{
  constructor(
    readonly parameters: GetChangedFilesTaskParameters = {}
  )
  {
  }

  async run(
    context: Context
  ): Promise<string[]>
  {
    const workingDirectory =
      this.parameters.workingDirectory
      ?? process.cwd();

    context.logger.debug(
      'get-changed-files: starting in %s',
      workingDirectory);

    const git =
      context.getTool<GitTool>(
      'git'
    );

    const changedFiles =
      await git.getChangedFiles(
        workingDirectory);

    context.logger.trace(
      'get-changed-files: changed files: %o',
      changedFiles);

    context.logger.debug(
      'get-changed-files: done, found %d file(s)',
      changedFiles.length);

    return changedFiles;
  }
}
