/*
### RL1

Every level 2 heading is one of `Overview`, `Scope`, `Installation`, `Usage`,
`Further reading`, `Related packages` and `License`, matched exactly, including
case.
*/

import { readFile }
  from 'node:fs/promises';
import { ALLOWED_HEADINGS,
         headingsOf }
  from './lib/package-readme.js';

const quote =
  headings =>
    headings.map(
      heading => `"${heading}"`).join(', ');

/**
 * @type { import('asljs-part').RuleValidationFunction }
 */
export async function validate(
  artefact,
  context)
{
  const content =
    await readFile(
      context.files.path(artefact),
      'utf8');

  const unexpected =
    headingsOf(
      content,
      context)
      .filter(
        heading =>
          !ALLOWED_HEADINGS.includes(heading));

  if (unexpected.length > 0) {
    throw new Error(
      `Headings outside the agreed set: ${quote(unexpected)}. `
        + `Allowed: ${quote(ALLOWED_HEADINGS)}.`);
  }
}
