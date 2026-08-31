import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { type Context }
  from '../context.js';
import { type Task }
  from '../task.js';
import { GitTool }
  from '../tools/git.js';

export interface CleanWorkingFolderTaskParameters
{
  workingDirectory?: string;
}

interface CleanWorkingFolderEnvelope
{
  diff: string;
  untrackedFiles: { path: string; contentBase64: string; }[];
}

export class CleanWorkingFolderTask implements Task<string>
{
  constructor(
    readonly parameters: CleanWorkingFolderTaskParameters = {}
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
      'clean-working-folder: starting in %s',
      workingDirectory);

    const git =
      context.getTool<GitTool>(
      'git'
    );

    const diff =
      await git.getDiff(
        workingDirectory);

    context.logger.trace(
      'clean-working-folder: diff:\n%s',
      diff);

    const untrackedPaths =
      await git.getUntrackedFiles(
        workingDirectory);

    const untrackedFiles: CleanWorkingFolderEnvelope['untrackedFiles'] = [ ];

    for (const untrackedPath of untrackedPaths) {
      untrackedFiles.push(
        { path: untrackedPath,
          contentBase64:
            (await fs.readFile(
              path.resolve(
                workingDirectory,
                untrackedPath)))
              .toString(
                'base64') });
    }

    const envelope: CleanWorkingFolderEnvelope =
      { diff,
        untrackedFiles };

    await git.discardAllChanges(
      workingDirectory);

    const backupPath =
      path.resolve(
        workingDirectory,
        `clean.${timestamp()}.bak`);

    await fs.writeFile(
      backupPath,
      JSON.stringify(
        envelope,
        null,
        2));

    context.logger.debug(
      'clean-working-folder: saved backup to %s',
      backupPath);

    context.logger.debug(
      'clean-working-folder: done');

    return backupPath;
  }
}

function timestamp(
  ): string
{
  return new Date()
    .toISOString()
    .replace(
      /[:.]/g,
      '-');
}
