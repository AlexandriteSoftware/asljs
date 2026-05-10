#!/usr/bin/env node

/**
 * Repository CLI toolkit for package release and maintenance tasks.
 *
 * It resolves workspace packages from the repo root, reads package metadata,
 * and dispatches named actions that run git, npm, and filesystem operations.
 *
 * For broader project and release workflow details, see README.md,
 * DEVELOPMENT.md, and RELEASE.md in the repository root.
 */

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
    cwd = ROOT_DIR
  )
{
  return execSync(
    command,
    { cwd,
      stdio: [ 'ignore', 'pipe', 'pipe' ],
      encoding: 'utf8' });
}

function runCommand(
    command,
    cwd
  )
{
  execSync(
    command,
    { cwd,
      stdio: 'inherit' });
}

function readJsonFile(
    filePath
  )
{
  return JSON.parse(
    fs.readFileSync(
      filePath,
      'utf8'));
}

function writeJsonFile(
    filePath,
    value
  )
{
  fs.writeFileSync(
    filePath,
    `${JSON.stringify(value, null, 2)}\n`,
    'utf8');
}

function readTextFile(
    filePath
  )
{
  return fs.readFileSync(
    filePath,
    'utf8');
}

function getPackageJsonPath(
    packageDir
  )
{
  return path.join(
    packageDir,
    'package.json');
}

function getRootPackageJson(
  )
{
  return readJsonFile(
    getPackageJsonPath(ROOT_DIR));
}

function getToolkitDocsPath(
  )
{
  return path.join(
    ROOT_DIR,
    'toolkit.md');
}

function getWorkspacePackageDirs(
  )
{
  const rootPackageJson =
    getRootPackageJson();

  if (!Array.isArray(rootPackageJson.workspaces)) {
    throw new Error(
      'Root package.json must define a workspaces array.');
  }

  return rootPackageJson.workspaces.map(
    workspace => {
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

function getWorkspacePackageInfos(
  )
{
  return getWorkspacePackageDirs().map(
    packageDir =>
      getPackageInfo(packageDir));
}

function getPackageInfo(
    packageDir = process.cwd()
  )
{
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
  )
{
  const packageInfo =
    getPackageInfo();

  return { name: packageInfo.name,
           version: packageInfo.version };
}

function getReleaseTagId(
  )
{
  const packageInfo =
    getPackageNameAndVersionFromPackageJson();

  return `${packageInfo.name}@${packageInfo.version}`;
}

function cleanDist(
  )
{
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
  )
{
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
  )
{
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
  )
{
  const releaseId =
    getReleaseTagId();

  createReleaseTag(releaseId);
}

export function updateDependencyVersionRanges(
    packageJson,
    dependencyName,
    nextVersion,
  )
{
  let changed = false;

  for (const fieldName of DEPENDENCY_FIELD_NAMES) {
    const dependencies = packageJson[fieldName];

    if (dependencies === undefined
        || dependencies === null)
    {
      continue;
    }

    if (typeof dependencies !== 'object'
        || Array.isArray(dependencies))
    {
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

function getLocalWorkspaceDependencyNameGraph(
    workspacePackageInfos
  )
{
  const workspacePackageNames =
    new Set(
      workspacePackageInfos.map(
        packageInfo =>
          packageInfo.name));

  return new Map(
    workspacePackageInfos.map(
      packageInfo => {
        const dependencies =
          new Set();

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
            if (dependencyName !== packageInfo.name
                && workspacePackageNames.has(dependencyName))
            {
              dependencies.add(dependencyName);
            }
          }
        }

        return [ packageInfo.name,
                 [ ...dependencies ] ];
      }));
}

export function resolveLocalWorkspaceDependencyBuildOrder(
    packageName,
    dependencyGraph
  )
{
  const permanent =
    new Set();

  const temporary =
    new Set();

  const buildOrder =
    [];

  const buildOrderSet =
    new Set();

  function visit(
      currentPackageName
    )
  {
    if (permanent.has(currentPackageName)) {
      return;
    }

    if (temporary.has(currentPackageName)) {
      throw new Error(
        `Detected circular workspace dependency involving "${currentPackageName}".`);
    }

    temporary.add(currentPackageName);

    const dependencyNames =
      dependencyGraph.get(currentPackageName)
      ?? [];

    for (const dependencyName of dependencyNames) {
      visit(dependencyName);

      if (!buildOrderSet.has(dependencyName)) {
        buildOrderSet.add(dependencyName);
        buildOrder.push(dependencyName);
      }
    }

    temporary.delete(currentPackageName);

    permanent.add(currentPackageName);
  }

  visit(packageName);

  return buildOrder;
}

function buildLocalDeps(
  )
{
  const workspacePackageInfos =
    getWorkspacePackageInfos();

  const packageInfoByName =
    new Map(
      workspacePackageInfos.map(
        packageInfo => [
          packageInfo.name,
          packageInfo,
        ]));

  const packageInfo =
    getPackageInfo(process.cwd());

  if (!packageInfoByName.has(packageInfo.name)) {
    throw new Error(
      `Current package "${packageInfo.name}" is not part of the root workspaces.`);
  }

  const dependencyGraph =
    getLocalWorkspaceDependencyNameGraph(
      workspacePackageInfos);

  const dependencyBuildOrder =
    resolveLocalWorkspaceDependencyBuildOrder(
      packageInfo.name,
      dependencyGraph);

  if (dependencyBuildOrder.length === 0) {
    console.log(
      `No local workspace dependencies to build for ${packageInfo.name}.`);

    return;
  }

  for (const dependencyName of dependencyBuildOrder) {
    const dependencyPackageInfo =
      packageInfoByName.get(dependencyName);

    if (!dependencyPackageInfo) {
      throw new Error(
        `Workspace package metadata not found for "${dependencyName}".`);
    }

    console.log(
      `Building local workspace dependency: ${dependencyName}`);

    runCommand(
      'npm run build',
      dependencyPackageInfo.dir);
  }
}

function ensureReleaseTarget(
    packageInfo
  )
{
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
    nextVersion
  )
{
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
    releaseId
  )
{
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
    releaseId
  )
{
  runCommand(
    'git push',
    ROOT_DIR);

  runCommand(
    `git push origin "${releaseId}"`,
    ROOT_DIR);
}

function releasePatch(
  )
{
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

function normalizeHelpText(
    text
  )
{
  return text
    .trim()
    .replace(/\r\n/g, '\n');
}

export function parseToolkitDocs(
    markdownText
  )
{
  const normalizedText =
    markdownText.replace(/\r\n/g, '\n');

  const lines =
    normalizedText.split('\n');

  if (lines[0]?.trim() !== '# toolkit') {
    throw new Error(
      'toolkit.md must start with "# toolkit".');
  }

  const commands = [];

  let lineIndex = 1;

  while (lineIndex < lines.length) {
    while (lineIndex < lines.length
           && lines[lineIndex].trim() === '')
    {
      lineIndex += 1;
    }

    if (lineIndex >= lines.length) {
      break;
    }

    const headingLine =
      lines[lineIndex];

    if (!headingLine.startsWith('## ')) {
      throw new Error(
        `toolkit.md expected a command heading at line ${lineIndex + 1}.`);
    }

    const actionKey =
      headingLine.slice(3).trim();

    lineIndex += 1;

    while (lineIndex < lines.length
           && lines[lineIndex].trim() === '')
    {
      lineIndex += 1;
    }

    const summaryLine =
      lines[lineIndex] ?? '';

    if (!summaryLine.startsWith('> ')) {
      throw new Error(
        `toolkit.md expected a blockquote summary for "${actionKey}".`);
    }

    const actionSummary =
      summaryLine.slice(2).trim();

    lineIndex += 1;

    while (lineIndex < lines.length
           && lines[lineIndex].trim() === '')
    {
      lineIndex += 1;
    }

    const helpLines = [];

    while (lineIndex < lines.length
           && !lines[lineIndex].startsWith('## '))
    {
      helpLines.push(lines[lineIndex]);
      lineIndex += 1;
    }

    const helpText =
      normalizeHelpText(
        helpLines.join('\n'));

    if (helpText === '') {
      throw new Error(
        `toolkit.md expected help text for "${actionKey}".`);
    }

    commands.push({ actionKey,
                    actionSummary,
                    helpText });
  }

  return commands;
}

function getCommandDocs(
  )
{
  return parseToolkitDocs(
    readTextFile(
      getToolkitDocsPath()));
}

function getCommands(
  )
{
  return new Map([
    [ 'clean-dist',
      cleanDist ],
    [ 'build-local-deps',
      buildLocalDeps ],
    [ 'ensure-clean-working-folder',
      ensureCleanWorkingFolder ],
    [ 'tag-commit-with-release-id',
      tagCommitWithReleaseId ],
    [ 'release-patch',
      releasePatch ],
  ]);
}

function getActionHelpText(
    commandDocs
  )
{
  return commandDocs
    .map(
      commandDoc => [
        `${commandDoc.actionKey}: ${commandDoc.actionSummary}`,
        commandDoc.helpText,
      ].join('\n'))
    .join('\n\n');
}

const action =
  process.argv[2] ?? '';

const commandDocs =
  getCommandDocs();

const actions =
  getCommands();

export function main(
  )
{
  if (action === ''
      || action === 'help'
      || action === '--help')
  {
    console.log(
      `Available actions:\n\n${getActionHelpText(commandDocs)}`);

    process.exit(
      action === ''
        ? 1
        : 0);
  }

  const selectedAction =
    actions.get(action);

  if (!selectedAction) {
    console.error(
      `Unknown action: ${action}\n\nAvailable actions:\n\n${getActionHelpText(commandDocs)}`);

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
