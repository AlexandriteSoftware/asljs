import { PackageJson }
  from 'pkg-types';
import { log }
  from '../api.js';
import { getWorkspacePackages,
         getPackageJson,
         resolveLocalWorkspaceDependencyBuildOrder,
         DEPENDENCY_FIELD_NAMES }
  from '../lib/packages.js';
import { start }
  from '../lib/process.js';

export async function buildLocalDeps(
  args?: string[]
): Promise<void> {
  const workspacePackageInfos =
    await getWorkspacePackages();

  const packageInfoByName =
    new Map(
      workspacePackageInfos.map(
        packageInfo => [
          packageInfo.name || '',
          packageInfo,
        ]));

  const packageInfo =
    await getPackageJson(
      process.cwd());

  if (
    !packageInfoByName.has(
      packageInfo.name || '')
  ) {
    throw new Error(
      `Current package "${packageInfo.name}" is not part of the root workspaces.`);
  }

  const dependencyGraph =
    getLocalWorkspaceDependencyNameGraph(
      workspacePackageInfos);

  const dependencyBuildOrder =
    resolveLocalWorkspaceDependencyBuildOrder(
      packageInfo.name || '',
      dependencyGraph);

  if (dependencyBuildOrder.length === 0) {
    log(
      `No local workspace dependencies to build for %s.`,
      packageInfo.name);

    return;
  }

  for (const dependencyName of dependencyBuildOrder) {
    const dependencyPackageInfo = packageInfoByName.get(dependencyName);

    if (!dependencyPackageInfo) {
      throw new Error(
        `Workspace package metadata not found for "${dependencyName}".`);
    }

    log(
      `Building local workspace dependency: %s`,
      dependencyName);

    start(
      'npm run build',
      dependencyPackageInfo.dir);
  }
}

export function getLocalWorkspaceDependencyNameGraph(
    workspacePackages: PackageJson[]
  ): Map<string, string[]>
{
  const workspacePackageNames: Set<string> =
    new Set(
      workspacePackages.map(
        packageInfo =>
          {
            const name =
              packageInfo.name;

            ensureNonEmptyString(name);

            return name;
          }));

  const map: Map<string, string[]> =
    new Map(
      workspacePackages.map(
        packageInfo => {
          const dependencies: Set<string> = new Set();

          for (const fieldName of DEPENDENCY_FIELD_NAMES) {
            const fieldValue =
              packageInfo.packageJson[fieldName];

            if (!fieldValue
                || typeof fieldValue !== 'object'
                || Array.isArray(fieldValue))
            {
              continue;
            }

            for (const dependencyName of Object.keys(fieldValue)) {
              if (
                dependencyName !== packageInfo.name
                && workspacePackageNames.has(dependencyName)
              ) {
                dependencies.add(dependencyName);
              }
            }
          }

          const name =
            packageInfo.name;

          ensureNonEmptyString(name);

          return [ name,
                  [ ...dependencies ] ];
        }));

  return map;

  function ensureNonEmptyString(
      value: unknown
    ): asserts value is string
  {
    if (typeof value !== 'string'
        || value.trim() === '')
    {
      throw new Error(
        'Expected a non-empty string, but got: ' + String(value));
    }
  }
}
