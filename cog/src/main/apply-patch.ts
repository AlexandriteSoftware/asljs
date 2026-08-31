import { Command }
  from 'commander';
import { spawn }
  from 'node:child_process';
import { loadPatch }
  from '../model/patch.js';
import { BackupRollbackFeed }
  from '../model/rollback.js';
import { envelopeData,
         rollbackFeedData }
  from '../tools/envelope.js';
import { WorkingFolder }
  from '../working-folder/working-folder.js';
import { ensureBackupFileDoesNotExist,
         resolveBackupPath }
  from './backup.js';
import { ensurePatchFileExists,
         resolveEnvelopePath,
         resolvePatchPath }
  from './env.js';
import { ExecutionContext,
         MainOptions }
  from './types.js';

const patchCommandTasks =
  new Map(
    [ [ 'read',
        'envelope-add-files' ],
      [ 'write',
        'envelope-write-file' ],
      [ 'remove',
        'envelope-remove-file' ] ]);

export function configureApplyPatchCommand(
    program: Command,
    context: ExecutionContext
  ): void
{
  program
    .command(
      'apply-patch')
    .description(
      'apply the selected patch to the selected envelope')
    .option(
      '--patch-verify-cmd <command>',
      'command used to verify the applied patch')
    .action(
      async (
          applyPatchOptions: {
          patchVerifyCmd?: string;
        }
        ) =>
      {
        const options =
          program.opts<{
          envelope?: string;
          patch?: string;
        }>();

        await applyPatch(
          context,
          { envelopePath:
              resolveEnvelopePath(
                options.envelope),
            patchPath:
              resolvePatchPath(
                options.patch),
            patchVerifyCmd:
              applyPatchOptions.patchVerifyCmd
              ?? process.env.COG_PATCH_VERIFY_CMD });
      });
}

async function applyPatch(
    context: ExecutionContext,
    options: MainOptions = {}
  ): Promise<void>
{
  const envelopePath =
    resolveEnvelopePath(
      options.envelopePath);

  const patchPath =
    resolvePatchPath(
      options.patchPath);

  const backupPath =
    resolveBackupPath(
      envelopePath);

  ensureBackupFileDoesNotExist(
    backupPath);

  ensurePatchFileExists(
    patchPath);

  const rollbackFeed =
    await BackupRollbackFeed.create(
      backupPath);

  const envelopeContainer =
    new WorkingFolder(
      context.logger);

  const envelope =
    await envelopeContainer.loadEnvelope(
      envelopePath);

  const patch =
    await loadPatch(
      patchPath);

  context.automation.setData(
    envelopeData,
    envelope);

  context.automation.setData(
    rollbackFeedData,
    rollbackFeed);

  try {
    for (const command of patch.commands) {
      const taskName =
        patchCommandTasks.get(
          command.command);

      if (!taskName) {
        throw new Error(
          `Unknown patch command ${command.command}`);
      }

      await context.automation.run(
        context.automation.createTask(
          taskName,
          command));
    }

    await verifyPatch(
      options.patchVerifyCmd);

    await context.automation.run(
      context.automation.createTask(
        'envelope-update-files'));

    await envelopeContainer.saveEnvelope(envelopePath);

    await rollbackFeed.delete();
  } catch (error) {
    await rollbackFeed.rollbackAll();
    await rollbackFeed.delete();

    throw error;
  }
}

async function verifyPatch(
    patchVerifyCmd?: string
  ): Promise<void>
{
  if (
    patchVerifyCmd === undefined
    || patchVerifyCmd.trim() === ''
  ) {
    return;
  }

  const exitCode =
    await runCommand(
      patchVerifyCmd);

  if (exitCode !== 0) {
    throw new Error(
      `Patch verify command failed with exit code ${exitCode}`);
  }
}

async function runCommand(
    command: string
  ): Promise<number | null>
{
  return new Promise(
    (
        resolve,
        reject
      ) =>
    {
      const child =
        spawn(
          command,
          { shell: true,
            stdio: 'inherit' });

      child.on(
        'error',
        reject);

      child.on(
        'close',
        resolve);
    });
}
