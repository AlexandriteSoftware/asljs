import path
  from 'node:path';
import { log,
         ROOT_DIR }
  from '../api.js';
import { start,
         startGit,
         startSequence }
  from '../lib/process.js';
import { DEPENDENCY_FIELD_NAMES,
         getPackageJson,
         getPackageJsonPath,
         getWorkspacePackageDirs,
         writeJsonFile }
  from '../lib/packages.js';
import { ensureCleanWorkingFolder }
  from './ensureCleanWorkingFolder.js';
import { PackageJson }
  from 'pkg-types';

export async function releasePatch(
    args?: string[]
  ): Promise<void>
{
  await ensureCleanWorkingFolder();

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

  const changedDependencyPackageJsonPaths =
    await updateWorkspaceDependents(
      name,
      version);

  const packageLockPath =
    path.join(
      ROOT_DIR,
      'package-lock.json');

  start(
    'npm install --package-lock-only',
    ROOT_DIR);

  start(
    'npm publish --ignore-scripts',
    path.dirname(
      packageJsonPath));

  const releaseId =
    `${name}@${version}`;

  commitReleaseChanges(
    [ packageJsonPath,
      ...changedDependencyPackageJsonPaths,
      packageLockPath ],
    releaseId);

  createReleaseTag(releaseId);

  pushRelease(releaseId);
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
      getPackageJsonPath(packageDir);

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
  }

  return changedPackageJsonPaths;
}

function commitReleaseChanges(
    filePaths: string[],
    releaseId: string
  ): void
{
  log(
    `Committing release changes for ${releaseId}...`);

  const relativePaths =
    filePaths
      .map(
        filePath =>
          path.relative(
            ROOT_DIR,
            filePath))
      .filter(
        filePath => filePath !== '')
      .map(
        filePath =>
          `"${filePath.replace(
            /\\/g,
            '/')}"`);

  if (relativePaths.length === 0) {
    throw new Error(
      'No release files to commit.');
  }

  start(
    `git add -- ${relativePaths.join(' ')}`,
    ROOT_DIR);

  start(
    `git commit -m "releasing ${releaseId}"`,
    ROOT_DIR);
}

function pushRelease(
    releaseId: string
  ): void
{
  start(
    'git push',
    ROOT_DIR);

  start(
    `git push origin "${releaseId}"`,
    ROOT_DIR);
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

function createReleaseTag(
    releaseId: string,
  ): void
{
  log(
    `Creating release tag: ${releaseId}...`);

  const existingTag =
    startGit(
      `git tag -l "${releaseId}"`,
      ROOT_DIR)
      .trim();

  if (existingTag !== '') {
    throw new Error(
      `Tag already exists: ${releaseId}`);
  }

  startGit(
    `git tag -a "${releaseId}" -m "${releaseId}"`,
    ROOT_DIR);

  log(
    `Created tag: ${releaseId}`);
}

export async function tagCommitWithReleaseId(
    args?: string[]
  ): Promise<void>
{
  const releaseId =
    await getReleaseTagId();

  createReleaseTag(
    releaseId);
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
