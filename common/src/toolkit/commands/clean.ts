import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { log }
  from '../api.js';

export async function clean(
    args?: string[]
  ): Promise<void>
{
  const pathsToClean =
    args && args.length > 0
      ? args
      : [ 'dist', 'build' ];

  const cwd =
    process.cwd();

  for (const pathToClean of pathsToClean) {
    const fullPathToClean =
      path.join(
        cwd,
        pathToClean);

    if (!fullPathToClean.startsWith(cwd)) {
      throw new Error(
        `Refusing to clean outside of the current working directory: ${fullPathToClean}`);
    }

    try {
      await fs.stat(
        fullPathToClean);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
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

    log(
      '[clean] removed %s',
      relativePathToClean);
  }
}
