import path
  from 'node:path';
import { readPackageJSON,
         PackageJson }
  from 'pkg-types';
import { ROOT_DIR }
  from '../api.js';

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

export async function getPackageJson(
    packageJsonPath: string
  ): Promise<PackageJson>
{
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
