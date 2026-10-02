import { type Logger }
  from 'asljs-logging';
import fs
  from 'node:fs/promises';
import path
  from 'node:path';

/**
 * Removes a directory, refusing anything outside `baseDir`.
 *
 * The guard is what makes a path from an argument or a workspace list safe to
 * delete: a relative path that climbs out, or an absolute path elsewhere on
 * the machine, is refused rather than removed.
 *
 * A path that does not exist is not an error, because the caller is asking for
 * it to be gone rather than for it to have been there.
 *
 * Returns the path removed, relative to `baseDir`, or `null` when there was
 * nothing to remove.
 */
export async function removeDirectory(
    logger: Logger,
    baseDir: string,
    targetPath: string,
    label: string
  ): Promise<string | null>
{
  const fullPath =
    path.normalize(
      path.resolve(
        baseDir,
        targetPath));

  if (
    !fullPath.startsWith(
      baseDir + path.sep)
  ) {
    throw new Error(
      `Refusing to remove outside of ${baseDir}: ${fullPath}`);
  }

  try {
    await fs.stat(fullPath);
  } catch (error) {
    if (
      (error as NodeJS.ErrnoException).code
      !== 'ENOENT'
    ) {
      throw error;
    }

    return null;
  }

  await fs.rm(
    fullPath,
    { recursive: true,
      force: true });

  const relativePath =
    path.relative(
      baseDir,
      fullPath);

  logger.information(
    '%s: removed %s',
    label,
    relativePath);

  return relativePath;
}
