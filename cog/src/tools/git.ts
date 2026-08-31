import { type CommandRunner,
         type Tool }
  from './tool.js';

export class GitTool implements Tool
{
  readonly name = 'git';

  constructor(
    readonly commandRunner: CommandRunner
  )
  {
  }

  async getChangedFiles(
    workingDirectory: string
  ): Promise<string[]>
  {
    const result =
      await this.commandRunner.run(
        'git',
        [ 'status',
          '--porcelain=v1',
          '-z',
          '--untracked-files=all' ],
        workingDirectory);

    if (result.exitCode !== 0) {
      throw new Error(
        `git status failed with exit code ${result.exitCode}: ${result.stderr.trim()}`);
    }

    return parsePorcelainStatus(
      result.stdout);
  }

  async getUntrackedFiles(
    workingDirectory: string
  ): Promise<string[]>
  {
    const result =
      await this.commandRunner.run(
        'git',
        [ 'status',
          '--porcelain=v1',
          '-z',
          '--untracked-files=all' ],
        workingDirectory);

    if (result.exitCode !== 0) {
      throw new Error(
        `git status failed with exit code ${result.exitCode}: ${result.stderr.trim()}`);
    }

    return parseUntrackedFiles(
      result.stdout);
  }

  async isRepository(
    workingDirectory: string
  ): Promise<boolean>
  {
    const result =
      await this.commandRunner.run(
        'git',
        [ 'rev-parse',
          '--is-inside-work-tree' ],
        workingDirectory);

    return result.exitCode === 0
      && result.stdout.trim() === 'true';
  }

  async getDiff(
    workingDirectory: string
  ): Promise<string>
  {
    const result =
      await this.commandRunner.run(
        'git',
        [ 'diff',
          'HEAD' ],
        workingDirectory);

    if (result.exitCode !== 0) {
      throw new Error(
        `git diff failed with exit code ${result.exitCode}: ${result.stderr.trim()}`);
    }

    return result.stdout;
  }

  async commit(
    workingDirectory: string,
    message: string
  ): Promise<void>
  {
    const add =
      await this.commandRunner.run(
        'git',
        [ 'add',
          '-A' ],
        workingDirectory);

    if (add.exitCode !== 0) {
      throw new Error(
        `git add failed with exit code ${add.exitCode}: ${add.stderr.trim()}`);
    }

    const commit =
      await this.commandRunner.run(
        'git',
        [ 'commit',
          '-m',
          message ],
        workingDirectory);

    if (commit.exitCode !== 0) {
      throw new Error(
        `git commit failed with exit code ${commit.exitCode}: ${commit.stderr.trim()}`);
    }
  }

  async discardAllChanges(
    workingDirectory: string
  ): Promise<void>
  {
    const checkout =
      await this.commandRunner.run(
        'git',
        [ 'checkout',
          '--',
          '.' ],
        workingDirectory);

    if (checkout.exitCode !== 0) {
      throw new Error(
        `git checkout failed with exit code ${checkout.exitCode}: ${checkout.stderr.trim()}`);
    }

    const clean =
      await this.commandRunner.run(
        'git',
        [ 'clean',
          '-fd' ],
        workingDirectory);

    if (clean.exitCode !== 0) {
      throw new Error(
        `git clean failed with exit code ${clean.exitCode}: ${clean.stderr.trim()}`);
    }
  }
}

export function parsePorcelainStatus(
    output: string
  ): string[]
{
  const entries =
    output.split(
      '\0');

  const files = new Set<string>();

  for (
    let index = 0;
    index < entries.length;
    index++
  ) {
    const entry = entries[index];

    if (entry.length < 4) {
      continue;
    }

    const status =
      entry.slice(
        0,
        2);

    files.add(
      entry.slice(
        3));

    if (
      status.includes(
        'R')
      || status.includes(
        'C')
    ) {
      index++;
    }
  }

  return [ ...files ];
}

export function parseUntrackedFiles(
    output: string
  ): string[]
{
  const entries =
    output.split(
      '\0');

  const files: string[] = [ ];

  for (const entry of entries) {
    if (entry.length < 4) {
      continue;
    }

    if (
      entry.slice(
        0,
        2)
      === '??'
    ) {
      files.push(
        entry.slice(
          3));
    }
  }

  return files;
}
