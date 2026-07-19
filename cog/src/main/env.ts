import { existsSync }
  from 'node:fs';

export function resolveEnvelopePath(
    envelopePath?: string
  ): string
{
  return envelopePath
    ?? getRequiredEnv(
      'COG_ENVELOPE_PATH'
    );
}

export function resolvePatchPath(
    patchPath?: string
  ): string
{
  return patchPath
    ?? getRequiredEnv(
      'COG_PATCH_PATH'
    );
}

export function ensurePatchFileExists(
    patchPath: string
  ): void
{
  if (
    !existsSync(
      patchPath
    )
  ) {
    throw new Error(
      `Patch file does not exist: ${patchPath}`
    );
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
      `${name} is required`
    );
  }

  return value;
}
