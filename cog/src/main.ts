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

const envelopePath =
  getRequiredEnv("COG_ENVELOPE_PATH");

const patchPath =
  getRequiredEnv("COG_PATCH_PATH");

async function main(
  ): Promise<void>
{
  const [command, ...args] =
    process.argv.slice(2);

  if (command === 'read') {
    await readCmd(args);
    return;
  }

  if (command === 'apply-patch') {
    await applyPatch();
    return;
  }

  throw new Error(
    'Usage: cog <read|apply-patch> [args...]');
}

export async function readCmd(
    args: string[]
  ): Promise<void>
{
  if (args.length === 0) {
    throw new Error(
      'Usage: cog read <path> [<path> ...]');
  }

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

export async function applyPatch(
  ): Promise<void>
{
  const envelope =
    await loadEnvelope(
      envelopePath);

  const patch =
    await loadPatch(
      patchPath);

  for (const command of patch.commands) {
    if (command.command === "read") {
      await read(
        envelope,
        command as unknown as Read);
    } else if (command.command === "write") {
      await write(
        envelope,
        command as unknown as Write);
    } else if (command.command === "remove") {
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

export function getRequiredEnv(
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

main()
  .catch(
    error => {
      console.error(
        error instanceof Error
          ? error.message
          : String(error));

      process.exitCode = 1;
    });
