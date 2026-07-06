import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { readPackageJSON,
         PackageJson }
  from 'pkg-types';
import { ROOT_DIR }
  from '../api.js';

export const DEPENDENCY_FIELD_NAMES =
  [ 'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies' ];

export async function writeJsonFile(
    filePath: string,
    value: unknown
  ): Promise<void>
{
  const text =
    JSON.stringify(
      value,
      null,
      2);

  await fs.writeFile(
    filePath,
    `${text}\n`,
    'utf8');
}

export async function readTextFile(
    filePath: string
  ): Promise<string>
{
  return await fs.readFile(
    filePath,
    'utf8');
}

export function getPackageJsonPath(
    packageDir: string
  ): string
{
  return path.join(
    packageDir,
    'package.json');
}

export async function getRootPackageJson(
  ): Promise<PackageJson>
{
  return await readPackageJSON(
    getPackageJsonPath(
      ROOT_DIR));
}

export async function getWorkspacePackageDirs(
  ): Promise<string[]>
{
  const rootPackageJson =
    await getRootPackageJson();

  if (
    !Array.isArray(
      rootPackageJson.workspaces))
  {
    throw new Error(
      'Root package.json must define a workspaces array.');
  }

  return rootPackageJson.workspaces.map(
    workspace => {
      if (
        typeof workspace !== 'string'
        || workspace.trim() === ''
      ) {
        throw new Error(
          'Workspace entries must be non-empty strings.');
      }

      return path.join(
        ROOT_DIR,
        workspace);
    });
}

export async function getWorkspacePackages(
  ): Promise<PackageJson[]>
{
  const packageDirs =
    await getWorkspacePackageDirs();

  const packageInfos: PackageJson[] = [];

  for (const packageDir of packageDirs) {
    const packageJson =
      await getPackageJson(packageDir);

    packageInfos.push(packageJson);
  }

  return packageInfos;
}

export async function getPackageJson(
    packageDir: string
  ): Promise<PackageJson>
{
  const packageJsonPath =
    getPackageJsonPath(
      packageDir);

  const packageJson =
    await readPackageJSON(
      packageJsonPath);

  const name =
    packageJson.name;

  const version =
    packageJson.version;

  if (
    typeof name !== 'string'
    || name.trim() === ''
  ) {
    throw new Error(
      'package.json must define a non-empty string "name".');
  }

  if (
    typeof version !== 'string'
    || version.trim() === ''
  ) {
    throw new Error(
      'package.json must define a non-empty string "version".');
  }

  return packageJson;
}

export function resolveLocalWorkspaceDependencyBuildOrder(
    packageName: string,
    dependencyGraph: Map<string, string[]>
  ): string[]
{
  const permanent = new Set<string>();
  const temporary = new Set<string>();
  const buildOrder: string[] = [];
  const buildOrderSet = new Set<string>();

  function visit(
      currentPackageName: string
    ): void
  {
    if (permanent.has(
      currentPackageName)) {
      return;
    }

    if (temporary.has(
      currentPackageName)) {
      throw new Error(
        `Detected circular workspace dependency involving "${currentPackageName}".`);
    }

    temporary.add(
      currentPackageName);

    const dependencyNames =
      dependencyGraph.get(
        currentPackageName)
      ?? [];

    for (const dependencyName of dependencyNames) {
      visit(dependencyName);

      if (!buildOrderSet.has(dependencyName)) {
        buildOrderSet.add(dependencyName);
        buildOrder.push(dependencyName);
      }
    }

    temporary.delete(
      currentPackageName);

    permanent.add(
      currentPackageName);
  }

  visit(packageName);

  return buildOrder;
}
