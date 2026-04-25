#!/usr/bin/env node

import fs
  from 'node:fs';
import path
  from 'node:path';
import process
  from 'node:process';
import console
  from 'node:console';
import {
    fileURLToPath,
    pathToFileURL,
  } from 'node:url';
import {
    execSync
  } from 'node:child_process';

const ROOT_DIR =
  path.dirname(
    fileURLToPath(import.meta.url));
const DEPENDENCY_FIELD_NAMES =
  [ 'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies' ];

function runGit(
    command,
    cwd = ROOT_DIR,
  ) {
  return execSync(
    command,
    { cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8' });
}

function runCommand(
    command,
    cwd,
  ) {
  execSync(
    command,
    { cwd,
      stdio: 'inherit' });
}

function readJsonFile(
    filePath,
  ) {
  return JSON.parse(
    fs.readFileSync(
      filePath,
      'utf8'));
}

function writeJsonFile(
    filePath,
    value,
  ) {
  fs.writeFileSync(
    filePath,
    `${JSON.stringify(value, null, 2)}\n`,
    'utf8');
}

function getPackageJsonPath(
    packageDir,
  ) {
  return path.join(
    packageDir,
    'package.json');
}

function getRootPackageJson(
  ) {
  return readJsonFile(
    getPackageJsonPath(ROOT_DIR));
}

function getWorkspacePackageDirs(
  ) {
  const rootPackageJson =
    getRootPackageJson();

  if (!Array.isArray(rootPackageJson.workspaces)) {
    throw new Error(
      'Root package.json must define a workspaces array.');
  }

  return rootPackageJson.workspaces.map(workspace => {
    if (typeof workspace !== 'string'
        || workspace.trim() === '')
    {
      throw new Error(
        'Workspace entries must be non-empty strings.');
    }

    return path.join(
      ROOT_DIR,
      workspace);
  });
}

function getPackageInfo(
    packageDir = process.cwd(),
  ) {
  const packageJsonPath =
    getPackageJsonPath(packageDir);
  const packageJson =
    readJsonFile(packageJsonPath);
  const name = packageJson.name;
  const version = packageJson.version;

  if (typeof name !== 'string'
      || name.trim() === '')
  {
    throw new Error(
      'package.json must define a non-empty string "name".');
  }

  if (typeof version !== 'string'
      || version.trim() === '')
  {
    throw new Error(
      'package.json must define a non-empty string "version".');
  }

  return {
    dir: packageDir,
    packageJsonPath,
    packageJson,
    name,
    version,
    private: packageJson.private === true,
  };
}

function getPackageNameAndVersionFromPackageJson(
  ) {
  const packageInfo =
    getPackageInfo();

  return { name: packageInfo.name,
           version: packageInfo.version };
}

function getReleaseTagId(
  ) {
  const packageInfo =
    getPackageNameAndVersionFromPackageJson();

  return `${packageInfo.name}@${packageInfo.version}`;
}

function cleanDist(
  ) {
  const distPath =
    path.join(
      process.cwd(),
      'dist');

  fs.rmSync(
    distPath,
    { recursive: true,
      force: true });

  console.log(
    `Removed: ${distPath}`);
}

function ensureCleanWorkingFolder(
  ) {
  const output =
    runGit(
      'git status --porcelain',
      ROOT_DIR);

  if (output.trim() !== '') {
    throw new Error(
      'Refusing publish: working tree has uncommitted or untracked changes.');
  }

  console.log(
    'Git working folder is clean.');
}

function createReleaseTag(
    releaseId,
  ) {
  const existingTag =
    runGit(
      `git tag -l "${releaseId}"`,
      ROOT_DIR)
      .trim();

  if (existingTag !== '') {
    throw new Error(
      `Tag already exists: ${releaseId}`);
  }

  runGit(
    `git tag -a "${releaseId}" -m "${releaseId}"`,
    ROOT_DIR);

  console.log(
    `Created tag: ${releaseId}`);
}

function tagCommitWithReleaseId(
  ) {
  const releaseId =
    getReleaseTagId();

  createReleaseTag(releaseId);
}

export function updateDependencyVersionRanges(
    packageJson,
    dependencyName,
    nextVersion,
  ) {
  let changed = false;

  for (const fieldName of DEPENDENCY_FIELD_NAMES) {
    const dependencies = packageJson[fieldName];

    if (dependencies === undefined || dependencies === null) {
      continue;
    }

    if (typeof dependencies !== 'object' || Array.isArray(dependencies)) {
      throw new Error(
        `package.json field "${fieldName}" must be an object when present.`);
    }

    if (typeof dependencies[dependencyName] !== 'string') {
      continue;
    }

    const nextRange = `^${nextVersion}`;

    if (dependencies[dependencyName] === nextRange) {
      continue;
    }

    dependencies[dependencyName] = nextRange;
    changed = true;
  }

  return changed;
}

function ensureReleaseTarget(
    packageInfo,
  ) {
  if (packageInfo.dir === ROOT_DIR) {
    throw new Error(
      'Release action must be run from a workspace package, not the repository root.');
  }

  if (packageInfo.private) {
    throw new Error(
      `Refusing release: ${packageInfo.name} is private.`);
  }
}

function updateWorkspaceDependents(
    releasedPackageName,
    nextVersion,
  ) {
  const changedPackageJsonPaths = [];

  for (const packageDir of getWorkspacePackageDirs()) {
    const packageInfo =
      getPackageInfo(packageDir);

    if (packageInfo.name === releasedPackageName) {
      continue;
    }

    if (!updateDependencyVersionRanges(
      packageInfo.packageJson,
      releasedPackageName,
      nextVersion))
    {
      continue;
    }

    writeJsonFile(
      packageInfo.packageJsonPath,
      packageInfo.packageJson);
    changedPackageJsonPaths.push(packageInfo.packageJsonPath);
  }

  return changedPackageJsonPaths;
}

function commitReleaseChanges(
    filePaths,
    releaseId,
  ) {
  const relativePaths =
    filePaths
      .map(filePath => path.relative(ROOT_DIR, filePath))
      .filter(filePath => filePath !== '')
      .map(filePath => `"${filePath.replace(/\\/g, '/')}"`);

  if (relativePaths.length === 0) {
    throw new Error('No release files to commit.');
  }

  runCommand(
    `git add -- ${relativePaths.join(' ')}`,
    ROOT_DIR);
  runCommand(
    `git commit -m "releasing ${releaseId}"`,
    ROOT_DIR);
}

function pushRelease(
    releaseId,
  ) {
  runCommand(
    'git push',
    ROOT_DIR);
  runCommand(
    `git push origin "${releaseId}"`,
    ROOT_DIR);
}

function releasePatch(
  ) {
  ensureCleanWorkingFolder();

  const packageInfo =
    getPackageInfo(process.cwd());

  ensureReleaseTarget(packageInfo);

  runCommand('npm run typecheck', packageInfo.dir);
  runCommand('npm run lint', packageInfo.dir);
  runCommand('npm run test', packageInfo.dir);
  runCommand('npm run clean', packageInfo.dir);
  runCommand('npm run build', packageInfo.dir);
  runCommand('npm version patch --no-git-tag-version', packageInfo.dir);

  const releasedPackageInfo =
    getPackageInfo(packageInfo.dir);
  const changedDependencyPackageJsonPaths =
    updateWorkspaceDependents(
      releasedPackageInfo.name,
      releasedPackageInfo.version);
  const packageLockPath =
    path.join(
      ROOT_DIR,
      'package-lock.json');

  runCommand(
    'npm install --package-lock-only',
    ROOT_DIR);
  runCommand(
    'npm publish --ignore-scripts',
    releasedPackageInfo.dir);

  const releaseId =
    `${releasedPackageInfo.name}@${releasedPackageInfo.version}`;

  commitReleaseChanges(
    [ releasedPackageInfo.packageJsonPath,
      ...changedDependencyPackageJsonPaths,
      packageLockPath ],
    releaseId);
  createReleaseTag(releaseId);
  pushRelease(releaseId);
}

const action =
  process.argv[2] ?? '';

const actions =
  new Map([
    [ 'clean-dist',
      cleanDist ],
    [ 'ensure-clean-working-folder',
      ensureCleanWorkingFolder ],
    [ 'tag-commit-with-release-id',
      tagCommitWithReleaseId ],
    [ 'release-patch',
      releasePatch ]
  ]);

export function main(
  ) {
  const selectedAction =
    actions.get(action);

  if (!selectedAction) {
    const supportedActions =
      [ ...actions.keys() ]
        .join(', ');

    console.error(
      `Unknown action. Use one of: ${supportedActions}`);

    process.exit(1);
  }

  selectedAction();
}

if (process.argv[1]
    && import.meta.url === pathToFileURL(process.argv[1]).href)
{
  try {
    main();
  } catch (error) {
    console.error(
      String(error?.message ?? error));

    process.exit(1);
  }
}
