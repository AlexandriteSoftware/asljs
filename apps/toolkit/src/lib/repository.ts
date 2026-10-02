import { type Logger }
  from 'asljs-logging';
import { ROOT_DIR }
  from '../api.js';
import { start }
  from './process.js';

export function tagRepository(
    logger: Logger,
    tag: string
  ): void
{
  logger.information(
    'Creating tag: %s',
    tag);

  const gatTagOutput =
    start(
      `git tag -l "${tag}"`,
      { cwd: ROOT_DIR,
        logger,
        stdio:
          [ 'ignore',
            'pipe',
            'inherit' ] });

  const gitTags =
    gatTagOutput.trim();

  if (gitTags !== '') {
    throw new Error(
      `Tag already exists: ${tag}`);
  }

  start(
    `git tag -a "${tag}" -m "${tag}"`,
    { cwd: ROOT_DIR,
      logger });

  logger.information(
    'Created tag: %s',
    tag);
}
