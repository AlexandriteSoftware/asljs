import { type Logger }
  from 'asljs-logging';
import { removeDirectory }
  from '../lib/filesystem.js';

export async function clean(
    logger: Logger,
    args?: string[]
  ): Promise<void>
{
  const pathsToClean =
    args && args.length > 0
    ? args
    : [ 'dist',
        'build' ];

  const cwd =
    process.cwd();

  for (const pathToClean of pathsToClean) {
    await removeDirectory(
      logger,
      cwd,
      pathToClean,
      'clean');
  }
}
