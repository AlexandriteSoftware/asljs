/*
RL10 - At least one test file has requirement ID in its content.
*/

import path
  from 'node:path';
import { readFile }
  from 'node:fs/promises';
import { glob }
  from 'glob';
import { GitIgnore }
  from '../../src/gitIgnore.js';

export async function validate(artefact, context)
{
  const basename = path.basename(context.artifactPath);
  const idMatch = basename.match(/^(RQ\d+)/);

  if (!idMatch) { 
    return;
  }

  const requirementId = idMatch[1];
  const rootDirectory = context.rootDirectory;
  const gitIgnore = new GitIgnore(rootDirectory);

  const testFiles = await glob('**/*.test.*', {
    absolute: true,
    cwd: rootDirectory,
    dot: true,
    nodir: true,
  });

  const visibleTestFiles = testFiles.filter((f) => !gitIgnore.isIgnored(f));

  for (const testFile of visibleTestFiles) {
    const content = await readFile(testFile, 'utf8');

    if (content.includes(requirementId)) {
      return;
    }
  }

  throw new Error(`No test file found containing requirement ID "${requirementId}".`);
}
