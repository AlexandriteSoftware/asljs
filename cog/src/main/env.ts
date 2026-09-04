export function resolveEnvelopePath(
    envelopePath?: string
  ): string
{
  return envelopePath
    ?? getRequiredEnv(
      'COG_ENVELOPE_PATH');
}

function getRequiredEnv(
    name: string
  ): string
{
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} is required`);
  }

  return value;
}
