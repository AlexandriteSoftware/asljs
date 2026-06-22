import { existsSync }
  from 'node:fs';
import { dirname }
  from 'node:path';
import { mkdir,
         writeFile }
  from 'node:fs/promises';
import { type NewEnvelope }
  from './types.js';

export function resolveEnvelopePath(
    envelopePath?: string
  ): string
{
  return envelopePath
    ?? getRequiredEnv(
      'COG_ENVELOPE_PATH');
}

export function resolvePatchPath(
    patchPath?: string
  ): string
{
  return patchPath
    ?? getRequiredEnv(
      'COG_PATCH_PATH');
}

export function ensurePatchFileExists(
    patchPath: string
  ): void
{
  if (!existsSync(
      patchPath)) {
    throw new Error(
      `Patch file does not exist: ${patchPath}`);
  }
}

export async function ensureEnvelopeFile(
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
