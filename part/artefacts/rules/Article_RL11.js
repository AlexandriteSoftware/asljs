/*
RL11 - Top-level heading is the file name without extension.
*/

import path from 'node:path';
import { readFile } from 'node:fs/promises';

export async function validate(artefact, context)
{
  if (!await context.artefacts.isArtefactOfDefinition(context.artifactPath, context.definition)) {
    return;
  }

  const artifactPath = path.resolve(context.artifactPath);
  const content = await readFile(artifactPath, 'utf8');
  const headingMatch = content.match(/^#\s+(.+)$/m);

  if (!headingMatch) {
    throw new Error('Article must have a level 1 heading.');
  }

  const expectedHeading = path.basename(artifactPath, path.extname(artifactPath));
  const actualHeading = headingMatch[1].trim();

  if (actualHeading !== expectedHeading) {
    throw new Error(`Article heading must be "${expectedHeading}".`);
  }
}
