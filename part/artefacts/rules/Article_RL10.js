/*
RL10 - Article start with a level 1 heading.
*/

import { readFile } from 'node:fs/promises';

export async function validate(artefact, context)
{
  if (!await context.artefacts.isArtefactOfDefinition(context.artifactPath, context.definition)) {
    return;
  }

  const content = await readFile(context.artifactPath, 'utf8');

  if (!/^\ufeff?#\s+\S.*(?:\r?\n|$)/.test(content)) {
    throw new Error('Article must start with a level 1 heading.');
  }
}
