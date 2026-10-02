import { type Logger }
  from 'asljs-logging';
import path
  from 'node:path';
import { ROOT_DIR }
  from '../api.js';
import { removeDirectory }
  from '../lib/filesystem.js';
import { getWorkspacePackageDirs }
  from '../lib/packages.js';

/**
 * The `node_modules` of each workspace package.
 *
 * The root `node_modules` is left out: it holds the hoisted install every
 * package resolves through, so removing it is `npm ci` territory rather than
 * this command's.
 */
export function toLocalModulesPaths(
    workspaceDirs: readonly string[]
  ): string[]
{
  return workspaceDirs.map(
    workspaceDir =>
      path.join(
        workspaceDir,
        'node_modules'));
}

export async function removeLocalModules(
    logger: Logger
  ): Promise<void>
{
  const workspaceDirs =
    await getWorkspacePackageDirs();

  const paths =
    toLocalModulesPaths(workspaceDirs);

  let removed = 0;

  for (const modulesPath of paths) {
    const relativePath =
      await removeDirectory(
        logger,
        ROOT_DIR,
        modulesPath,
        'remove-local-modules');

    if (relativePath !== null) {
      removed += 1;
    }
  }

  logger.information(
    'remove-local-modules: removed %d of %d',
    removed,
    paths.length);
}
