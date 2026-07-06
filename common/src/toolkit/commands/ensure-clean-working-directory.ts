import { log,
         ROOT_DIR }
  from '../api.js';
import { start }
  from '../lib/process.js';

export async function ensureCleanWorkingDirectory(
    args?: string[]
  ): Promise<void>
{
  const output =
    start(
      'git status --porcelain',
      { cwd: ROOT_DIR });

  if (
    typeof output === 'string'
    && output.trim() !== ''
  ) {
    throw new Error(
      'Working directory has uncommitted or untracked changes.');
  }

  log(
    'Working directory `%s` is clean.',
    ROOT_DIR);
}