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
import { getActionHelpText,
         getCommandDocs }
  from './lib/actions.js';
import { clean }
  from './commands/clean.js';
import { ensureCleanWorkingDirectory }
  from './commands/ensure-clean-working-directory.js';
import { releasePatch }
  from './commands/release-patch.js';
import { tagReleaseRevision }
  from './commands/tag-release-revision.js';
import { buildLocalDeps }
  from './commands/build-local-deps.js';

const commandDocs =
  await getCommandDocs();

const actions: Map<string, (args?: string[]) => Promise<void>> =
  new Map([
    [ 'clean',
      clean ],
    [ 'build-local-deps',
      buildLocalDeps ],
    [ 'ensure-clean-working-directory',
      ensureCleanWorkingDirectory ],
    [ 'tag-release-revision',
      tagReleaseRevision ],
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
