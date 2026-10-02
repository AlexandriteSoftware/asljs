import { type Logger }
  from 'asljs-logging';
import fs
  from 'node:fs/promises';
import path
  from 'node:path';

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
    const fullPathToClean =
      path.normalize(
        path.resolve(
          cwd,
          pathToClean));

    const isPathToCleanInsideCwd =
      fullPathToClean.startsWith(
        cwd + path.sep);

    if (!isPathToCleanInsideCwd) {
      throw new Error(
        `Refusing to clean outside of the current working directory: ${fullPathToClean}`);
    }

    try {
      await fs.stat(
        fullPathToClean);
    } catch (err) {
      if (
        (err as NodeJS.ErrnoException).code
        !== 'ENOENT'
      ) {
        throw err;
      }

      continue;
    }

    await fs.rm(
      fullPathToClean,
      { recursive: true,
        force: true });

    const relativePathToClean =
      path.relative(
        cwd,
        fullPathToClean);

    logger.information(
      'clean: removed %s',
      relativePathToClean);
  }
}
