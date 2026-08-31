import { type Context }
  from '../context.js';
import { type Task }
  from '../task.js';
import { DotnetCliTool }
  from '../tools/dotnet.js';
import { NpmCliTool }
  from '../tools/npm.js';
import { detectProjectKind,
         toCommandIssues }
  from '../tools/project-detection.js';

export interface BuildTaskParameters
{
  workingDirectory?: string;
}

export interface BuildTaskResult
{
  tool: 'npm' | 'dotnet' | null;
  issues: string[];
}

export class BuildTask implements Task<BuildTaskResult>
{
  constructor(
    readonly parameters: BuildTaskParameters = {}
  )
  {
  }

  async run(
    context: Context
  ): Promise<BuildTaskResult>
  {
    const workingDirectory =
      this.parameters.workingDirectory
      ?? process.cwd();

    context.logger.debug(
      'build: starting in %s',
      workingDirectory);

    const project =
      await detectProjectKind(
        workingDirectory);

    if (project === null) {
      context.logger.debug(
        'build: no npm or .NET project found in %s',
        workingDirectory);

      context.logger.debug(
        'build: done, no project to build');

      return { tool: null,
               issues: [ ] };
    }

    try {
      if (project.kind === 'npm') {
        await context.getTool<NpmCliTool>(
          'npm'
        )
          .build(
            workingDirectory);
      } else {
        await context.getTool<DotnetCliTool>(
          'dotnet'
        )
          .build(
            workingDirectory,
            { target: project.target });
      }

      context.logger.debug(
        'build: done, no issues');

      return { tool: project.kind,
               issues: [ ] };
    } catch (error) {
      const issues =
        toCommandIssues(
          error);

      context.logger.debug(
        'build: done with %d issue(s)',
        issues.length);

      return { tool: project.kind,
               issues };
    }
  }
}
