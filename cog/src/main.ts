import { Command }
  from 'commander';
import { dirname }
  from 'node:path';
import { existsSync }
  from 'node:fs';
import { mkdir, writeFile }
  from 'node:fs/promises';
import { loadEnvelope,
         saveEnvelope }
  from './model/envelope.js';
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
  commands: unknown[];
  files: unknown[];
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
      '<paths...>')
    .description(
      'read files into the envelope')
    .action(
      async (paths: string[]) => {
        const options =
          program.opts<{
            envelope?: string;
          }>();

        await readCmd(
          paths,
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
          'Usage: cog <read|apply-patch> [args...]');
      });

  await program.parseAsync(
    argv);
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
      commands: [],
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
    args: string[],
    options: MainOptions = {}
  ): Promise<void>
{
  if (args.length === 0) {
    throw new Error(
      'Usage: cog read <path> [<path> ...]');
  }

  const envelopePath =
    resolveEnvelopePath(
      options.envelopePath);

  await ensureEnvelopeFile(
    envelopePath);

  const envelope =
    await loadEnvelope(
      envelopePath);

  for (const filePath of args) {
    await read(
      envelope,
      { command: 'read',
        path: filePath });
  }

  await saveEnvelope(
    envelope,
    envelopePath);
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

  ensurePatchFileExists(
    patchPath);

  await ensureEnvelopeFile(
    envelopePath);

  const envelope =
    await loadEnvelope(
      envelopePath);

  const patch =
    await loadPatch(
      patchPath);

  for (const command of patch.commands) {
    if (command.command === 'read') {
      await read(
        envelope,
        command as unknown as Read);
    } else if (command.command === 'write') {
      await write(
        envelope,
        command as unknown as Write);
    } else if (command.command === 'remove') {
      await remove(
        envelope,
        command as unknown as Remove);
    } else {
      throw new Error(
        `Unknown patch command ${command.command}`);
    }
  }

  await saveEnvelope(
    envelope,
    envelopePath);
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
