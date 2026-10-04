import { type Logger }
  from 'asljs-logging';
import { PackageJson }
  from 'pkg-types';
import { getPackageJson,
         getPackageJsonPath,
         getWorkspacePackageDirs }
  from '../lib/packages.js';
import { start }
  from '../lib/process.js';
import { report }
  from '../lib/output.js';

const DEFAULT_SCRIPT_NAME = 'all';

export interface WorkspacePackage
{
  name: string;
  dir: string;
  dependencyNames: string[];
  scriptNames: string[];
}

export function sortWorkspacesByDependencyOrder(
    workspacePackages: WorkspacePackage[]
  ): WorkspacePackage[]
{
  const packagesByName =
    new Map(
      workspacePackages.map(
        workspacePackage => [ workspacePackage.name,
                              workspacePackage ]));

  const pendingDependencies = new Map<string, Set<string>>();

  const dependentNames = new Map<string, Set<string>>();

  for (const workspacePackage of workspacePackages) {
    // Dependencies outside the workspace set are resolved from the registry
    // and do not constrain the order.
    const workspaceDependencyNames =
      new Set(
        workspacePackage.dependencyNames.filter(
          dependencyName =>
          dependencyName !== workspacePackage.name
          && packagesByName.has(dependencyName)));

    pendingDependencies.set(
      workspacePackage.name,
      workspaceDependencyNames);

    for (const dependencyName of workspaceDependencyNames) {
      const names =
        dependentNames.get(dependencyName)
        ?? new Set<string>();

      names.add(
        workspacePackage.name);

      dependentNames.set(
        dependencyName,
        names);
    }
  }

  const ordered: WorkspacePackage[] = [ ];

  while (ordered.length < workspacePackages.length) {
    const readyNames =
      [ ...pendingDependencies ]
      .filter(
        ([, dependencies]) => dependencies.size === 0)
      .map(
        ([name]) => name)
      .sort();

    if (readyNames.length === 0) {
      throw new Error(
        `Dependency cycle between workspace packages: ${
          [ ...pendingDependencies.keys() ].sort().join(', ')
        }.`);
    }

    for (const readyName of readyNames) {
      const workspacePackage =
        packagesByName.get(readyName);

      if (workspacePackage !== undefined) {
        ordered.push(
          workspacePackage);
      }

      pendingDependencies.delete(
        readyName);

      for (const dependentName of dependentNames.get(readyName) ?? [ ]) {
        pendingDependencies.get(
          dependentName)?.delete(
            readyName);
      }
    }
  }

  return ordered;
}

export async function runAll(
    logger: Logger,
    args?: string[]
  ): Promise<void>
{
  const scriptName =
    args?.[0]
    ?? DEFAULT_SCRIPT_NAME;

  const workspacePackageDirs =
    await getWorkspacePackageDirs();

  const workspacePackages: WorkspacePackage[] = [ ];

  for (const workspacePackageDir of workspacePackageDirs) {
    const packageJson =
      await getPackageJson(
        getPackageJsonPath(
          workspacePackageDir));

    workspacePackages.push(
      toWorkspacePackage(
        workspacePackageDir,
        packageJson));
  }

  const ordered =
    sortWorkspacesByDependencyOrder(
      workspacePackages);

  report(
    '[run-all] order: %s',
    ordered.map(
      workspacePackage => workspacePackage.name).join(' -> '));

  for (const workspacePackage of ordered) {
    if (!workspacePackage.scriptNames.includes(scriptName)) {
      report(
        '[run-all] %s has no "%s" script, skipped',
        workspacePackage.name,
        scriptName);

      continue;
    }

    start(
      `npm run ${scriptName}`,
      { cwd:
          workspacePackage.dir,
        logger });
  }
}

function toWorkspacePackage(
    workspacePackageDir: string,
    packageJson: PackageJson
  ): WorkspacePackage
{
  return { name:
             packageJson.name as string,
           dir: workspacePackageDir,
           dependencyNames:
             [ ...Object.keys(
               packageJson.dependencies
          ?? {}),
               ...Object.keys(
                 packageJson.devDependencies
          ?? {}) ],
           scriptNames:
             Object.keys(
               packageJson.scripts
        ?? {}) };
}
