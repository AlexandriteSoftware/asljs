import { ROOT_DIR }
  from '../api.js';
import { startGit }
  from '../lib/process.js';

export async function ensureCleanWorkingFolder(
    args?: string[]
  ): Promise<void>
{
  const output =
    startGit(
      'git status --porcelain',
      ROOT_DIR);

  if (output.trim() !== '') {
    throw new Error(
      'Refusing publish: working tree has uncommitted or untracked changes.');
  }
}