import { type Context }
  from '../../context.js';
import { type Task }
  from '../../task.js';
import { GitTool }
  from './git.js';

export interface GetUntrackedFilesTaskParameters
{
  workingDirectory?: string;
}

export class GetUntrackedFilesTask implements Task<string[]>
{
  constructor(
    readonly parameters: GetUntrackedFilesTaskParameters = {}
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

    return await context.getTool<GitTool>(
      'git'
    )
      .getUntrackedFiles(
        workingDirectory);
  }
}
