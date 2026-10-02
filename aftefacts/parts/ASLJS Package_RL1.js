/*
### RL1

A published package does not ship test helpers. No directory named `testing`
appears anywhere in `dist`, because `tsconfig.dist.json` excludes every
`testing` directory under `src`, and anything still emitted from there was
dragged in by a published file importing it. Checks a built `dist` only; there
is nothing to report before one exists.
*/

import { readdir }
  from 'node:fs/promises';
import path
  from 'node:path';

/**
 * Every directory named `testing` beneath `directoryPath`, relative to it.
 *
 * A missing directory yields nothing, so an unbuilt package reports nothing
 * rather than failing.
 */
async function findTestingDirs(
  directoryPath,
  relativeTo)
{
  let entries;

  try {
    entries =
      await readdir(
        directoryPath,
        { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }

  const found = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const childPath =
      path.join(
        directoryPath,
        entry.name);

    if (entry.name === 'testing') {
      found.push(
        path
          .relative(
            relativeTo,
            childPath)
          .replaceAll(
            path.sep,
            '/'));

      continue;
    }

    found.push(
      ...await findTestingDirs(
        childPath,
        relativeTo));
  }

  return found;
}

/**
 * @type { import('asljs-part').RuleValidationFunction }
 */
export async function validate(
  artefact)
{
  const distPath =
    path.join(
      artefact.path,
      'dist');

  const testingDirs =
    await findTestingDirs(
      distPath,
      artefact.path);

  if (testingDirs.length > 0) {
    throw new Error(
      `Published output must not contain a testing directory: ${
        testingDirs.join(', ')
      }.`);
  }
}
