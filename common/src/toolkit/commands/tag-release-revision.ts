import { getReleaseTagId }
  from './release-patch.js';
import { tagRepository }
  from '../lib/repository.js';

export async function tagReleaseRevision(
    args?: string[]
  ): Promise<void>
{
  const releaseId =
    await getReleaseTagId();

  tagRepository(
    releaseId);
}
