import { type Logger }
  from 'asljs-logging';
import { tagRepository }
  from '../lib/repository.js';
import { getReleaseTagId }
  from './release-patch.js';

export async function tagReleaseRevision(
    logger: Logger
  ): Promise<void>
{
  const releaseId =
    await getReleaseTagId();

  tagRepository(
    logger,
    releaseId);
}
