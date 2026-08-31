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

export interface TestTaskParameters
{
  workingDirectory?: string;
}

export interface TestTaskResult
{
  tool: 'npm' | 'dotnet' | null;
  issues: string[];
}

export class TestTask implements Task<TestTaskResult>
{
  constructor(
    readonly parameters: TestTaskParameters = {}
  )
  {
  }

  async run(
    context: Context
  ): Promise<TestTaskResult>
  {
    const workingDirectory =
      this.parameters.workingDirectory
      ?? process.cwd();

    context.logger.debug(
      'test: starting in %s',
      workingDirectory);

    const project =
      await detectProjectKind(
        workingDirectory);

    if (project === null) {
      context.logger.debug(
        'test: no npm or .NET project found in %s',
        workingDirectory);

      context.logger.debug(
        'test: done, no project to test');

      return { tool: null,
               issues: [ ] };
    }

    try {
      if (project.kind === 'npm') {
        await context.getTool<NpmCliTool>(
          'npm'
        )
          .test(
            workingDirectory);
      } else {
        await context.getTool<DotnetCliTool>(
          'dotnet'
        )
          .test(
            workingDirectory,
            { target: project.target });
      }

      context.logger.debug(
        'test: done, no issues');

      return { tool: project.kind,
               issues: [ ] };
    } catch (error) {
      const issues =
        toCommandIssues(
          error);

      context.logger.debug(
        'test: done with %d issue(s)',
        issues.length);

      return { tool: project.kind,
               issues };
    }
  }
}
