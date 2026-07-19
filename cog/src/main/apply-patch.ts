import { Command }
  from 'commander';
import { spawn }
  from 'node:child_process';
import { read,
         ReadParameters }
  from '../commands/read.js';
import { Remove,
         remove }
  from '../commands/remove.js';
import { Write,
         write }
  from '../commands/write.js';
import { EnvelopeContainer }
  from '../envelope/container.js';
import { Envelope }
  from '../envelope/envelope.js';
import { loadPatch }
  from '../model/patch.js';
import { BackupRollbackFeed,
         RollbackFeed }
  from '../model/rollback.js';
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
import { updateEnvelopeFiles }
  from './update.js';

export function configureApplyPatchCommand(
    program: Command,
    context: ExecutionContext
  ): void
{
  program
    .command(
      'apply-patch'
    )
    .description(
      'apply the selected patch to the selected envelope'
    )
    .option(
      '--patch-verify-cmd <command>',
      'command used to verify the applied patch'
    )
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
          {
            envelopePath: resolveEnvelopePath(
              options.envelope
            ),
            patchPath: resolvePatchPath(
              options.patch
            ),
            patchVerifyCmd: applyPatchOptions.patchVerifyCmd
              ?? process.env.COG_PATCH_VERIFY_CMD
          }
        );
      }
    );
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
    backupPath
  );

  ensurePatchFileExists(
    patchPath
  );

  const rollbackFeed =
    await BackupRollbackFeed.create(
      backupPath);

  const envelopeContainer =
    new EnvelopeContainer(
    context.logger
  );

  const envelope =
    await envelopeContainer.loadEnvelope(
      envelopePath);

  const patch =
    await loadPatch(
      patchPath);

  try {
    for (const command of patch.commands) {
      await applyPatchCommand(
        context,
        envelope,
        command,
        rollbackFeed
      );
    }

    await verifyPatch(
      options.patchVerifyCmd
    );

    await updateEnvelopeFiles(
      envelope
    );

    await envelopeContainer.saveEnvelope(envelopePath);

    await rollbackFeed.delete();
  } catch (error) {
    await rollbackFeed.rollbackAll();
    await rollbackFeed.delete();

    throw error;
  }
}

async function applyPatchCommand(
    context: ExecutionContext,
    envelope: Envelope,
    command: { command: string; },
    rollbackFeed: RollbackFeed
  ): Promise<void>
{
  if (command.command === 'read') {
    await read(
      envelope,
      command as unknown as ReadParameters,
      rollbackFeed,
      context
    );
  } else if (command.command === 'write') {
    await write(
      envelope,
      command as unknown as Write,
      rollbackFeed
    );
  } else if (command.command === 'remove') {
    await remove(
      envelope,
      command as unknown as Remove,
      rollbackFeed,
      context
    );
  } else {
    throw new Error(
      `Unknown patch command ${command.command}`
    );
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
      `Patch verify command failed with exit code ${exitCode}`
    );
  }
}

async function runCommand(
    command: string
  ): Promise<number | null>
{
  return new Promise(
    (resolve, reject) =>
    {
      const child =
        spawn(
          command,
          { shell: true, stdio: 'inherit' });

      child.on(
        'error',
        reject
      );

      child.on(
        'close',
        resolve
      );
    }
  );
}
