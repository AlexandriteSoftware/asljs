import { type Logger }
  from 'asljs-logging';
import { ROOT_DIR }
  from '../api.js';
import { start }
  from '../lib/process.js';
import { report }
  from '../lib/output.js';

export async function ensureCleanWorkingDirectory(
    logger: Logger
  ): Promise<void>
{
  const output =
    start(
      'git status --porcelain',
      { cwd: ROOT_DIR,
        logger,
        stdio:
          [ 'ignore',
            'pipe',
            'inherit' ] });

  if (
    typeof output
    === 'string'
    && output.trim() !== ''
  ) {
    throw new Error(
      'Working directory has uncommitted or untracked changes.');
  }

  report(
    'Working directory `%s` is clean.',
    ROOT_DIR);
}
