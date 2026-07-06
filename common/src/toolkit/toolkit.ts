/**
 * Repository CLI toolkit for package release and maintenance tasks.
 *
 * It resolves workspace packages from the repo root, reads package metadata,
 * and dispatches named actions that run git, npm, and filesystem operations.
 *
 * For broader project and release workflow details, see README.md,
 * DEVELOPMENT.md, and RELEASE.md in the repository root.
 */

import process
  from 'node:process';
import console
  from 'node:console';
import { pathToFileURL }
  from 'node:url';
import { PackageJson }
  from 'pkg-types';
import { log }
  from './api.js';
import { getActionHelpText,
         getCommandDocs }
  from './lib/actions.js';
import { DEPENDENCY_FIELD_NAMES,
         getPackageJson,
         getWorkspacePackages,
         resolveLocalWorkspaceDependencyBuildOrder }
  from './lib/packages.js';
import { start }
  from './lib/process.js';
import { clean }
  from './commands/clean.js';
import { ensureCleanWorkingFolder }
  from './commands/ensureCleanWorkingFolder.js';
import { releasePatch,
         tagCommitWithReleaseId }
  from './commands/releasePatch.js';

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
    log(
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

    log(
      `Building local workspace dependency: ${dependencyName}`);

    start(
      'npm run build',
      dependencyPackageInfo.dir);
  }
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
    args[0]
    ?? '';

  if (action === '') {
    console.log(
      `Available actions:\n\n${getActionHelpText(commandDocs)}`);

      process.exit(0);
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
