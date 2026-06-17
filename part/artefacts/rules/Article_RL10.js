/*
RL10 - Article start with a level 1 heading.
*/

import { readFile }
  from 'node:fs/promises';

/**
 * @type { import('../../src/rule-validation-function.js')
 *           .ruleValidationFunction }
 */
export async function validate(
  artefact)
{
  const content =
    await readFile(
      artefact.path,
      'utf8');

  if (!/^\ufeff?#\s+\S.*(?:\r?\n|$)/.test(content)) {
    throw new Error(
      'Article must start with a level 1 heading.');
  }
}
