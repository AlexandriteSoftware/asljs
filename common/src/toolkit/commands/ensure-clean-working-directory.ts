import { ROOT_DIR }
  from '../api.js';
import { start }
  from '../lib/process.js';

export async function ensureCleanWorkingDirectory(
    args?: string[]
  ): Promise<void>
{
  const output =
    start(
      'status --porcelain',
      ROOT_DIR);

  if (output.trim() !== '') {
    throw new Error(
      'Working directory has uncommitted or untracked changes.');
  }
}