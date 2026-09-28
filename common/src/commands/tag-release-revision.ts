import { tagRepository }
  from '../lib/repository.js';
import { getReleaseTagId }
  from './release-patch.js';

export async function tagReleaseRevision(
  ): Promise<void>
{
  const releaseId =
    await getReleaseTagId();

  tagRepository(
    releaseId);
}
