import { spawn }
  from 'node:child_process';
import { Command }
  from 'commander';
import { loadEnvelope,
         saveEnvelope }
  from '../model/envelope.js';
import { BackupRollbackFeed,
         type RollbackFeed }
  from '../model/rollback.js';
import { loadPatch }
  from '../model/patch.js';
import { type ReadParameters,
         read }
  from '../commands/read.js';
import { type Write,
         write }
  from '../commands/write.js';
import { type Remove,
         remove }
  from '../commands/remove.js';
import { ensureBackupFileDoesNotExist,
         resolveBackupPath }
  from './backup.js';
import { ensureEnvelopeFile,
         ensurePatchFileExists,
         resolveEnvelopePath,
         resolvePatchPath }
  from './env.js';
import { type MainOptions }
  from './types.js';
import { updateEnvelopeFiles }
  from './update.js';

export function configureApplyPatchCommand(
    program: Command
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
        ) => {
        const options =
          program.opts<{
            envelope?: string;
            patch?: string;
          }>();

        await applyPatch(
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
    options: MainOptions = {}
  ): Promise<void>
{
  const envelopePath =
    resolveEnvelopePath(
      options.envelopePath);

  const patchPath =
    resolvePatchPath(
      options.patchPath);

  await ensureEnvelopeFile(
    envelopePath);

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

  try {
    const envelope =
      await loadEnvelope(
        envelopePath);

    const patch =
      await loadPatch(
        patchPath);

    for (const command of patch.commands) {
      await applyPatchCommand(
        envelope,
        command,
        rollbackFeed);
    }

    await verifyPatch(
      options.patchVerifyCmd);

    await updateEnvelopeFiles(
      envelope);

    await saveEnvelope(
      envelope,
      envelopePath);

    await rollbackFeed.delete();
  } catch (error) {
    await rollbackFeed.rollbackAll();
    await rollbackFeed.delete();

    throw error;
  }
}

async function applyPatchCommand(
    envelope: Awaited<ReturnType<typeof loadEnvelope>>,
    command: { command: string },
    rollbackFeed: RollbackFeed
  ): Promise<void>
{
  if (command.command === 'read') {
    await read(
      envelope,
      command as unknown as ReadParameters);
  } else if (command.command === 'write') {
    await write(
      envelope,
      command as unknown as Write,
      rollbackFeed);
  } else if (command.command === 'remove') {
    await remove(
      envelope,
      command as unknown as Remove,
      rollbackFeed);
  } else {
    throw new Error(
      `Unknown patch command ${command.command}`);
  }
}

async function verifyPatch(
    patchVerifyCmd?: string
  ): Promise<void>
{
  if (patchVerifyCmd === undefined
      || patchVerifyCmd.trim() === '') {
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
    (resolve, reject) => {
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
