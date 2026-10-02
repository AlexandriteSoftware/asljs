import fs
  from 'node:fs';
import path
  from 'node:path';
import { fileURLToPath }
  from 'node:url';

/**
 * Path to the compiled script file, which is supposed to be located in
 * common/dist.
 */
const SCRIPT_FILE_PATH =
  fileURLToPath(
    import.meta.url);

/**
 * Path to the common package directory, which is supposed to be the parent of
 * this script's directory.
 */
export const PKG_COMMON_DIR =
  path.dirname(
    path.dirname(
      SCRIPT_FILE_PATH));

/**
 * Whether the directory holds the package.json of a workspace root.
 */
function hasWorkspaces(
    dir: string
  ): boolean
{
  const packageJsonPath =
    path.join(
      dir,
      'package.json');

  if (
    !fs.existsSync(
      packageJsonPath)
  ) {
    return false;
  }

  try {
    const packageJson =
      JSON.parse(
        fs.readFileSync(
          packageJsonPath,
          'utf8'));

    return Array.isArray(
      packageJson.workspaces);
  } catch {
    // A package.json that does not parse cannot be the root.
    return false;
  }
}

/**
 * The nearest ancestor of `startDir` whose package.json declares workspaces.
 *
 * The root is found by what defines it rather than by counting directories, so
 * a package may sit at any depth beneath it.
 */
function findRootDir(
    startDir: string
  ): string
{
  let current = startDir;

  while (
    !hasWorkspaces(
      current)
  ) {
    const parentDir =
      path.dirname(
        current);

    if (parentDir === current) {
      throw new Error(
        'Cannot locate the repository root: no package.json with a '
          + `workspaces array above ${startDir}.`);
    }

    current = parentDir;
  }

  return current;
}

/**
 * Path to the repository root directory, the workspace root this package
 * belongs to.
 */
export const ROOT_DIR =
  findRootDir(
    PKG_COMMON_DIR);
