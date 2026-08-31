import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { type Context }
  from '../context.js';
import { type CopilotService }
  from '../copilot.js';
import { type Task }
  from '../task.js';
import { GitTool }
  from '../tools/git.js';

export interface GetCommitMessageTaskParameters
{
  workingDirectory?: string;
}

export class GetCommitMessageTask implements Task<string>
{
  constructor(
    readonly parameters: GetCommitMessageTaskParameters = {}
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
      'get-commit-message: starting in %s',
      workingDirectory);

    const git =
      context.getTool<GitTool>(
      'git'
    );

    if (
      !(await git.isRepository(
        workingDirectory))
    ) {
      throw new Error(
        `stop: ${workingDirectory} is not a git repository`);
    }

    const diff =
      await git.getDiff(
        workingDirectory);

    const untrackedFiles =
      await git.getUntrackedFiles(
        workingDirectory);

    const prompt =
      await buildPrompt(
        workingDirectory,
        diff,
        untrackedFiles);

    context.logger.trace(
      'get-commit-message: prompt:\n%s',
      prompt);

    const copilot =
      await context.getService<CopilotService>(
      'copilot'
    );

    const response =
      await copilot.complete(
        { prompt });

    context.logger.trace(
      'get-commit-message: response:\n%s',
      response.content);

    const message =
      response.content.trim();

    context.logger.debug(
      'get-commit-message: done');

    return message;
  }
}

async function buildPrompt(
    workingDirectory: string,
    diff: string,
    untrackedFiles: readonly string[]
  ): Promise<string>
{
  const sections: string[] =
    [ 'Diff of changes in the working folder:',
      '```diff',
      diff.trim().length > 0
      ? diff
      : '(no tracked changes)',
      '```' ];

  for (const file of untrackedFiles) {
    sections.push(
      `New file: ${file}`,
      '```',
      await readUntrackedFile(
        workingDirectory,
        file),
      '```');
  }

  sections.push(
    'Look through the attached diff and new files, then reply with only a '
      + 'commit message summarising the changes. The reply must be less than '
      + '200 characters and contain nothing else.');

  return sections.join(
    '\n\n');
}

async function readUntrackedFile(
    workingDirectory: string,
    file: string
  ): Promise<string>
{
  try {
    return await fs.readFile(
      path.resolve(
        workingDirectory,
        file),
      'utf8');
  } catch {
    return '(binary or unreadable file)';
  }
}
