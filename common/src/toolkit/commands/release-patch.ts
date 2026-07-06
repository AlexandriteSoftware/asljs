import { log,
         ROOT_DIR }
  from '../api.js';
import { start,
         startSequence }
  from '../lib/process.js';
import { DEPENDENCY_FIELD_NAMES,
         getPackageJson,
         getPackageJsonPath,
         getWorkspacePackageDirs,
         writeJsonFile }
  from '../lib/packages.js';
import { ensureCleanWorkingDirectory }
  from './ensure-clean-working-directory.js';
import { PackageJson }
  from 'pkg-types';
import { tagRepository }
  from '../lib/repository.js';

export async function releasePatch(
    args?: string[]
  ): Promise<void>
{
  await ensureCleanWorkingDirectory();

  const packageJsonPath =
    getPackageJsonPath(
      process.cwd());

  const packageJson =
    await getPackageJson(
      packageJsonPath);

  ensureReleaseTarget(
    packageJson);

  startSequence(
    [ 'npm run clean',
      'npm run typecheck',
      'npm run lint',
      'npm run build',
      'npm run test',
      'npm run clean',
      'npm run build:dist',
      'npm version patch --no-git-tag-version' ]);

  const updatedPackageJson =
    await getPackageJson(
      packageJsonPath);

  const name =
    updatedPackageJson.name!;

  const version =
    updatedPackageJson.version!;

  await updateWorkspaceDependents(
    name,
    version);

  start(
    'npm install --package-lock-only',
    { cwd: ROOT_DIR });

  start(
    'npm publish --ignore-scripts');

  const releaseId =
    `${name}@${version}`;

  log(
    'Committing release changes for %s...',
    releaseId);

  startSequence(
    [ `git add .`,
      `git commit -m "releasing ${releaseId}"` ],
    ROOT_DIR);

  tagRepository(
    releaseId);

  startSequence(
    [ 'git push',
      `git push origin "${releaseId}"` ],
    ROOT_DIR);
}

function ensureReleaseTarget(
    packageJson: PackageJson
  ): void
{
  const name =
    packageJson.name;

  if (
    typeof name !== 'string'
    || name.trim() === ''
  ) {
    throw new Error(
      'package.json must define a non-empty string "name".');
  }

  if (packageJson.private) {
    throw new Error(
      `Refusing release: ${packageJson.name} is private.`);
  }

  const version =
    packageJson.version;

  if (
    typeof version !== 'string'
    || version.trim() === ''
  ) {
    throw new Error(
      'package.json must define a non-empty string "version".');
  }
}

async function updateWorkspaceDependents(
    releasedPackageName: string,
    nextVersion: string
  ): Promise<string[]>
{
  const changedPackageJsonPaths = [];

  for (const packageDir of await getWorkspacePackageDirs()) {
    const packageJsonFilePath =
      getPackageJsonPath(
        packageDir);

    const packageLockJsonFilePath =
      packageJsonFilePath.replace(
        /package\.json$/i,
        'package-lock.json');

    const packageJson =
      await getPackageJson(packageJsonFilePath);

    const name =
      packageJson.name;

    if (
      name === undefined
      || name === null
      || name.trim() === ''
      || name === releasedPackageName
    ) {
      continue;
    }

    if (
      !updateDependencyVersionRanges(
        packageJson,
        releasedPackageName,
        nextVersion)
    ) {
      continue;
    }

    writeJsonFile(
      packageJsonFilePath,
      packageJson);

    changedPackageJsonPaths.push(
      packageJsonFilePath);

    changedPackageJsonPaths.push(
      packageLockJsonFilePath);
  }

  return changedPackageJsonPaths;
}

export async function getReleaseTagId(
    packageDir?: string
  ): Promise<string>
{
  packageDir ??= process.cwd();

  const packageInfo =
    await getPackageJson(packageDir);

  return `${packageInfo.name}@${packageInfo.version}`;
}

export function updateDependencyVersionRanges(
    packageJson: PackageJson,
    dependencyName: string,
    nextVersion: string,
  ): boolean
{
  let changed = false;

  for (const fieldName of DEPENDENCY_FIELD_NAMES) {
    const dependencies =
      packageJson[fieldName];

    if (
      dependencies === undefined
      || dependencies === null)
    {
      continue;
    }

    if (
      typeof dependencies !== 'object'
      || Array.isArray(dependencies)
    ) {
      throw new Error(
        `package.json field "${fieldName}" must be an object when present.`);
    }

    if (typeof dependencies[dependencyName] !== 'string') {
      continue;
    }

    const nextRange =
      `^${nextVersion}`;

    if (dependencies[dependencyName] === nextRange) {
      continue;
    }

    dependencies[dependencyName] = nextRange;

    changed = true;
  }

  return changed;
}
