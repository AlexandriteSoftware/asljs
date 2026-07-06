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
  from 'node:fs/promises';
import path
  from 'node:path';
import process
  from 'node:process';
import console
  from 'node:console';
import { fileURLToPath,
         pathToFileURL }
  from 'node:url';
import { execSync,
         ExecSyncOptionsWithStringEncoding }
  from 'node:child_process';
import { readPackageJSON,
         PackageJson }
  from 'pkg-types';

/**
 * Path to the common package directory, which is supposed to be the parent of
 * this script's directory, assuming the compiled script is located in
 * common/dist.
 */
const PKG_COMMON_DIR =
  path.dirname(
    path.dirname(
      fileURLToPath(
        import.meta.url)));

/**
 * Path to the repository root directory, which is supposed to be the parent of
 * the common package directory.
 */
const ROOT_DIR =
  path.dirname(
    PKG_COMMON_DIR);

const DEPENDENCY_FIELD_NAMES =
  [ 'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies' ];

function runCommand(
    command: string,
    cwd?: string
  ): string
{
  const currentWorkingDir =
    cwd
    ?? process.cwd();

  const options: ExecSyncOptionsWithStringEncoding =
    { cwd: currentWorkingDir,
      stdio: 'inherit',
      encoding: 'utf8' };

  return execSync(
    command,
    options);
}

function runCommands(
    commands: string[],
    cwd?: string
  ): void
{
  for (const command of commands) {
    runCommand(
      command,
      cwd);
  }
}

async function writeJsonFile(
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

async function readTextFile(
    filePath: string
  ): Promise<string>
{
  return await fs.readFile(
    filePath,
    'utf8');
}

function runGit(
    command: string,
    cwd?: string
  ): string
{
  const currentWorkingDir =
    cwd ?? process.cwd();

  const options: ExecSyncOptionsWithStringEncoding =
    { cwd: currentWorkingDir,
      stdio: [ 'ignore', 'pipe', 'pipe' ],
      encoding: 'utf8' };

  return execSync(
    command,
    options);
}

function getPackageJsonPath(
    packageDir: string
  ): string
{
  return path.join(
    packageDir,
    'package.json');
}

async function getRootPackageJson(
  ): Promise<PackageJson>
{
  return await readPackageJSON(
    getPackageJsonPath(
      ROOT_DIR));
}

async function getWorkspacePackageDirs(
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

async function getWorkspacePackages(
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

async function getPackageJson(
    packageDir?: string
  ): Promise<PackageJson>
{
  packageDir ??= process.cwd();

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

async function getReleaseTagId(
    packageDir?: string
  ): Promise<string>
{
  packageDir ??= process.cwd();

  const packageInfo =
    await getPackageJson(packageDir);

  return `${packageInfo.name}@${packageInfo.version}`;
}

async function clean(
    args?: string[]
  ): Promise<void>
{
  const pathsToClean =
    args && args.length > 0
      ? args
      : [ 'dist', 'build' ];

  const cwd =
    process.cwd();

  for (const pathToClean of pathsToClean) {
    const fullPathToClean =
      path.join(
        cwd,
        pathToClean);

    if (!fullPathToClean.startsWith(cwd)) {
      throw new Error(
        `Refusing to clean outside of the current working directory: ${fullPathToClean}`);
    }

    try {
      await fs.stat(
        fullPathToClean);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw err;
      }

      continue;
    }

    await fs.rm(
      fullPathToClean,
      { recursive: true,
        force: true });

    const relativePathToClean =
      path.relative(
        cwd,
        fullPathToClean);

    console.log(
      `[clean] removed ${relativePathToClean}`);
  }
}

async function ensureCleanWorkingFolder(
    args?: string[]
  ): Promise<void>
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
    releaseId: string,
  ): void
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

async function tagCommitWithReleaseId(
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

function getLocalWorkspaceDependencyNameGraph(
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

async function buildLocalDeps(
    args?: string[]
  ): Promise<void>
{
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
    packageInfo: PackageJson
  ): void
{
  if (packageInfo.private) {
    throw new Error(
      `Refusing release: ${packageInfo.name} is private.`);
  }
}

async function updateWorkspaceDependents(
    releasedPackageName: string,
    nextVersion: string
  ): Promise<string[]>
{
  const changedPackageJsonPaths = [];

  for (const packageDir of await getWorkspacePackageDirs()) {
    const packageJson =
      await getPackageJson(packageDir);

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

    const packageJsonPath =
      path.join(
        ROOT_DIR,
        name,
        'package.json');

    writeJsonFile(
      packageJsonPath,
      packageJson.packageJson);

    changedPackageJsonPaths.push(
      packageJsonPath);
  }

  return changedPackageJsonPaths;
}

function commitReleaseChanges(
    filePaths: string[],
    releaseId: string
  ): void
{
  const relativePaths =
    filePaths
      .map(
        filePath => path.relative(
          ROOT_DIR,
          filePath))
      .filter(
        filePath => filePath !== '')
      .map(
        filePath => `"${filePath.replace(
          /\\/g,
          '/')}"`);

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
    releaseId: string
  ): void
{
  runCommand(
    'git push',
    ROOT_DIR);

  runCommand(
    `git push origin "${releaseId}"`,
    ROOT_DIR);
}

async function releasePatch(
    args?: string[]
  ): Promise<void>
{
  await ensureCleanWorkingFolder();

  const packageJson =
    await getPackageJson(
      process.cwd());

  ensureReleaseTarget(
    packageJson);

  runCommands(
    [ 'npm run clean',
      'npm run typecheck',
      'npm run lint',
      'npm run build',
      'npm run test',
      'npm run clean',
      'npm run build:dist',
      'npm version patch --no-git-tag-version' ]);

  const name =
    packageJson.name;

  if (
    typeof name !== 'string'
    || name.trim() === ''
  ) {
    throw new Error(
      'package.json must define a non-empty string "name".');
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

  const changedDependencyPackageJsonPaths =
    await updateWorkspaceDependents(
      name,
      version);

  const packageLockPath =
    path.join(
      ROOT_DIR,
      'package-lock.json');

  runCommand(
    'npm install --package-lock-only',
    ROOT_DIR);

  runCommand(
    'npm publish --ignore-scripts',
    packageJson.dir);

  const releaseId =
    `${packageJson.name}@${packageJson.version}`;

  commitReleaseChanges(
    [ packageJson.packageJsonPath,
      ...changedDependencyPackageJsonPaths,
      packageLockPath ],
    releaseId);

  createReleaseTag(releaseId);

  pushRelease(releaseId);
}

function normalizeHelpText(
    text: string
  ): string
{
  return text
    .trim()
    .replace(
      /\r\n/g,
      '\n');
}

function getToolkitDocsPath(
  ): string
{
  return path.join(
    PKG_COMMON_DIR,
    'docs',
    'toolkit.md');
}

export interface CommandDoc {
  actionKey: string;
  actionSummary: string;
  helpText: string;
}

export function parseToolkitDocs(
    markdownText: string
  ): CommandDoc[]
{
  const normalizedText =
    markdownText.replace(
      /\r\n/g,
      '\n');

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
      helpLines.push(
        lines[lineIndex]);

      lineIndex += 1;
    }

    const helpText =
      normalizeHelpText(
        helpLines.join('\n'));

    if (helpText === '') {
      throw new Error(
        `toolkit.md expected help text for "${actionKey}".`);
    }

    commands.push(
      { actionKey,
        actionSummary,
        helpText });
  }

  return commands;
}

async function getCommandDocs(
  ): Promise<CommandDoc[]>
{
  return parseToolkitDocs(
    await readTextFile(
      getToolkitDocsPath()));
}

function getActionHelpText(
    commandDocs: CommandDoc[]
  ): string
{
  return commandDocs
    .map(
      commandDoc => [
        `${commandDoc.actionKey}: ${commandDoc.actionSummary}`,
        commandDoc.helpText,
      ].join('\n'))
    .join('\n\n');
}

const commandDocs =
  await getCommandDocs();

const actions: Map<string, (args?: string[]) => Promise<void>> =
  new Map([
    [ 'clean',
      clean ],
    [ 'build-local-deps',
      buildLocalDeps ],
    [ 'ensure-clean-working-folder',
      ensureCleanWorkingFolder ],
    [ 'tag-commit-with-release-id',
      tagCommitWithReleaseId ],
    [ 'release-patch',
      releasePatch ],
  ]);

export async function main(
    args: string[]
  ): Promise<void>
{
  const action =
    args[0] ?? '';

  if (action === '') {
    console.log(
      'Available actions:\n\n');
    
    console.log(
      getActionHelpText(commandDocs));

    process.exit(
      action === ''
        ? 1
        : 0);
  }

  const selectedAction =
    actions.get(action);

  if (!selectedAction) {
    console.error(
      `Unknown action: ${action}`);

    console.error(
      `Available actions:\n\n${getActionHelpText(commandDocs)}`);

    process.exit(1);
  }

  const actionArgs =
    args.slice(1);

  await selectedAction(
    actionArgs);
}

// checks that the script is being run directly, not imported
if (process.argv[1]) {
  const programArg =
    process.argv[1];

  const processArgvPath =
    pathToFileURL(programArg).href;
  
  if (import.meta.url === processArgvPath) {
    try {
      const args =
        process.argv.slice(2);

      await main(args);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.error(message);

      process.exit(1);
    }
  }
}
