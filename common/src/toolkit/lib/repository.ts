import { log,
         ROOT_DIR }
  from '../api.js';
import { start }
  from './process.js';


export function tagRepository(
  tag: string
): void {
  log(
    'Creating tag: %s',
    tag);

  const gatTagOutput = start(
    `git tag -l "${tag}"`,
    ROOT_DIR);

  const gitTags = gatTagOutput.trim();

  if (gitTags !== '') {
    throw new Error(
      `Tag already exists: ${tag}`);
  }

  start(
    `git tag -a "${tag}" -m "${tag}"`,
    ROOT_DIR);

  log(
    'Created tag: %s',
    tag);
}
