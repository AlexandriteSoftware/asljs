/*
### RL1

A published package does not ship test helpers. No directory named `testing`
appears anywhere in `dist`, because `tsconfig.dist.json` excludes every
`testing` directory under `src`, and anything still emitted from there was
dragged in by a published file importing it. Checks a built `dist` only; there
is nothing to report before one exists.
*/

import { type RuleValidationFunction }
  from 'asljs-part';
import { readdir }
  from 'node:fs/promises';
import path
  from 'node:path';

/**
 * Every directory named `testing` beneath `directoryPath`, relative to
 * `relativeTo`.
 *
 * A missing directory yields nothing, so an unbuilt package reports nothing
 * rather than failing.
 */
async function findTestingDirs(
    directoryPath: string,
    relativeTo: string
  ): Promise<string[]>
{
  let entries;

  try {
    entries =
      await readdir(
        directoryPath,
        { withFileTypes: true });
  } catch (error) {
    if (
      (error as NodeJS.ErrnoException).code
      === 'ENOENT'
    ) {
      return [ ];
    }

    throw error;
  }

  const found: string[] = [ ];

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

export const validate: RuleValidationFunction =
  async (
      artefact,
      context
    ) =>
  {
  const packagePath =
    context.files.path(artefact);

  const testingDirs =
    await findTestingDirs(
      path.join(
        packagePath,
        'dist'),
      packagePath);

  if (testingDirs.length > 0) {
    throw new Error(
      `Published output must not contain a testing directory: ${
        testingDirs.join(', ')
      }.`);
  }
};
