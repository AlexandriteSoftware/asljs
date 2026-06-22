import { mkdtemp, rm }
  from 'node:fs/promises';
import { tmpdir }
  from 'node:os';
import { join }
  from 'node:path';

export interface SilentLogger
{
  debug: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
}

export const silentLogger: SilentLogger =
  { debug: () => {},
    error: () => {},
    info: () => {},
    log: () => {},
    warn: () => {} };

export async function makeTmpDir(
    logger: SilentLogger = silentLogger
  ): Promise<string>
{
  logger.debug(
    'creating temporary test directory');

  return await mkdtemp(
    join(
      tmpdir(),
      'cog-test-'));
}

export async function removeTmpDir(
    path: string,
    logger: SilentLogger = silentLogger
  ): Promise<void>
{
  logger.debug(
    'removing temporary test directory',
    path);

  await rm(
    path,
    { recursive: true,
      force: true });
}

export async function withTmpDir<T>(
    callback: (
      path: string,
      logger: SilentLogger
    ) => Promise<T> | T,
    logger: SilentLogger = silentLogger
  ): Promise<T>
{
  const path =
    await makeTmpDir(
      logger);

  try {
    return await callback(
      path,
      logger);
  } finally {
    await removeTmpDir(
      path,
      logger);
  }
}
