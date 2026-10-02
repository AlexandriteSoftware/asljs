import { type Logger }
  from 'asljs-logging';
import console
  from 'node:console';
import fs
  from 'node:fs/promises';
import path
  from 'node:path';

export async function printFile(
    logger: Logger,
    args?: string[]
  ): Promise<void>
{
  const fileName = args?.[0];

  if (
    fileName === undefined
    || fileName.trim() === ''
  ) {
    throw new Error(
      'print-file requires a file path.');
  }

  const filePath =
    path.resolve(
      process.cwd(),
      fileName);

  logger.trace(
    'print-file: %s',
    filePath);

  const content =
    await fs.readFile(
      filePath,
      'utf8');

  console.log(
    content.trimEnd());
}
