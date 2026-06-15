/*
RL10 - At least one test file has requirement ID in its content.
*/

import { readFile }
  from 'node:fs/promises';
import { glob }
  from 'glob';

export async function validate(
  artefact,
  context)
{
  const idMatch =
    artefact.name.match(/^(RQ\d+)/);

  if (!idMatch) { 
    return;
  }

  const requirementId =
    idMatch[1];

  const rootDirectory =
    context.rootDirectory;

  const testFiles =
    await glob(
      '**/*.test.*',
      {
        absolute: true,
        cwd: rootDirectory,
        dot: true,
        nodir: true,
      });

  for (const testFile of testFiles) {
    const content =
      await readFile(
        testFile,
        'utf8');

    if (content.includes(requirementId)) {
      return;
    }
  }

  throw new Error(
    `No test file found containing requirement ID "${requirementId}".`);
}
