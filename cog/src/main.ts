import { Command }
  from 'commander';
import { dirname, join }
  from 'node:path';
import { existsSync }
  from 'node:fs';
import { mkdir,
         writeFile }
  from 'node:fs/promises';
import { loadEnvelope,
         saveEnvelope }
  from './model/envelope.js';
import { BackupRollbackFeed,
         type RollbackFeed }
  from './model/rollback.js';
import { loadPatch }
  from './model/patch.js';
import { Read, read }
  from './commands/read.js';
import { Write, write }
  from './commands/write.js';
import { Remove, remove }
  from './commands/remove.js';

interface MainOptions
{
  envelopePath?: string;
  patchPath?: string;
}

interface NewEnvelope
{
  instruction: string;
  files: unknown[];
}

interface ReadCliOptions
{
  lines?: string;
  sizeKb?: string;
  readToEnd?: boolean;
  withBinaryB64?: boolean;
  exclude?: string[];
}

export async function main(
    argv = process.argv
  ): Promise<void>
{
  const program =
    new Command();

  program
    .name(
      'cog')
    .allowExcessArguments(
      false)
    .exitOverride()
    .option(
      '--envelope <path>',
      'path to the envelope JSON file')
    .option(
      '--patch <path>',
      'path to the patch JSON file')
    .showHelpAfterError();

  program
    .command(
      'read')
    .argument(
      '<path>')
    .description(
      'read files into the envelope')
    .option(
      '--lines <N>',
      'if file is a text file, only read first N lines',
      '150')
    .option(
      '--sizeKb <M>',
      'if file is a text file, only read first M kilobytes',
      '15')
    .option(
      '--read-to-end',
      'if file is a text file, read to the end',
      false)
    .option(
      '--with-binary-b64',
      'if file is a binary file, read it as base64',
      false)
    .option(
      '--exclude <path>',
      'file, folder, or glob pattern to exclude',
      collect,
      [])
    .action(
      async (
          path: string,
          readOptions: ReadCliOptions
        ) => {
        const options =
          program.opts<{
            envelope?: string;
          }>();

        await readCmd(
          path,
          readOptions,
          { envelopePath:
              resolveEnvelopePath(
                options.envelope) });
      });

  program
    .command(
      'update')
    .description(
      'refresh envelope files using their update commands')
    .action(
      async () => {
        const options =
          program.opts<{
            envelope?: string;
          }>();

        await updateCmd(
          { envelopePath:
              resolveEnvelopePath(
                options.envelope) });
      });

  program
    .command(
      'restore')
    .description(
      'restore files from backup.json')
    .action(
      async () => {
        const options =
          program.opts<{
            envelope?: string;
          }>();

        await restoreCmd(
          { envelopePath:
              resolveEnvelopePath(
                options.envelope) });
      });

  program
    .command(
      'apply-patch')
    .description(
      'apply the selected patch to the selected envelope')
    .action(
      async () => {
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
                options.patch) });
      });

  program
    .action(
      () => {
        throw new Error(
          'Usage: cog <read|update|restore|apply-patch> [args...]');
      });

  await program.parseAsync(
    argv);
}

function collect(
    value: string,
    values: string[]
  ): string[]
{
  return [
    ...values,
    value
  ];
}

function resolveEnvelopePath(
    envelopePath?: string
  ): string
{
  return envelopePath
    ?? getRequiredEnv(
      'COG_ENVELOPE_PATH');
}

function resolvePatchPath(
    patchPath?: string
  ): string
{
  return patchPath
    ?? getRequiredEnv(
      'COG_PATCH_PATH');
}

function resolveBackupPath(
    envelopePath: string
  ): string
{
  return join(
    dirname(
      envelopePath),
    'backup.json');
}

function ensurePatchFileExists(
    patchPath: string
  ): void
{
  if (!existsSync(
      patchPath)) {
    throw new Error(
      `Patch file does not exist: ${patchPath}`);
  }
}

function ensureBackupFileDoesNotExist(
    backupPath: string
  ): void
{
  if (existsSync(
      backupPath)) {
    throw new Error(
      `backup.json exists: run cog restore or delete ${backupPath} before applying a patch`);
  }
}

async function ensureEnvelopeFile(
    envelopePath: string
  ): Promise<void>
{
  if (existsSync(
      envelopePath)) {
    return;
  }

  await mkdir(
    dirname(
      envelopePath),
    { recursive: true });

  const envelope: NewEnvelope =
    { instruction: '',
      files: [] };

  await writeFile(
    envelopePath,
    `${JSON.stringify(
      envelope,
      null,
      2)}\n`,
    'utf8');
}

async function readCmd(
    pattern: string,
    readOptions: ReadCliOptions,
    options: MainOptions = {}
  ): Promise<void>
{
  const envelopePath =
    resolveEnvelopePath(
      options.envelopePath);

  await ensureEnvelopeFile(
    envelopePath);

  const envelope =
    await loadEnvelope(
      envelopePath);

  await read(
    envelope,
    { command: 'read',
      pattern,
      exclude:
        readOptions.exclude ?? [],
      lines:
        parsePositiveInteger(
          readOptions.lines,
          'lines'),
      sizeKb:
        parsePositiveInteger(
          readOptions.sizeKb,
          'sizeKb'),
      readToEnd:
        readOptions.readToEnd ?? false,
      withBinaryB64:
        readOptions.withBinaryB64 ?? false });

  await saveEnvelope(
    envelope,
    envelopePath);
}

function parsePositiveInteger(
    value: string | undefined,
    name: string
  ): number
{
  const parsed =
    Number.parseInt(
      value ?? '',
      10);

  if (!Number.isInteger(
      parsed)
      || parsed <= 0
      || parsed.toString() !== value) {
    throw new Error(
      `${name} must be a positive integer`);
  }

  return parsed;
}

async function updateCmd(
    options: MainOptions = {}
  ): Promise<void>
{
  const envelopePath =
    resolveEnvelopePath(
      options.envelopePath);

  await ensureEnvelopeFile(
    envelopePath);

  const envelope =
    await loadEnvelope(
      envelopePath);

  await updateEnvelopeFiles(
    envelope);

  await saveEnvelope(
    envelope,
    envelopePath);
}

async function updateEnvelopeFiles(
    envelope: Awaited<ReturnType<typeof loadEnvelope>>
  ): Promise<void>
{
  const updateCommands =
    envelope.files
      .map(
        file =>
          file.update)
      .filter(
        (command): command is Read =>
          command !== undefined);

  for (const command of updateCommands) {
    await read(
      envelope,
      command);
  }
}

async function restoreCmd(
    options: MainOptions = {}
  ): Promise<void>
{
  const envelopePath =
    resolveEnvelopePath(
      options.envelopePath);

  const backupPath =
    resolveBackupPath(
      envelopePath);

  if (!existsSync(
      backupPath)) {
    throw new Error(
      `backup.json does not exist: ${backupPath}`);
  }

  await BackupRollbackFeed.restoreAndDelete(
    backupPath);
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
      command as unknown as Read,
      rollbackFeed);
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

function getRequiredEnv(
    name: string
  ): string
{
  const value =
    process.env[name];

  if (!value) {
    throw new Error(
      `${name} is required`);
  }

  return value;
}
