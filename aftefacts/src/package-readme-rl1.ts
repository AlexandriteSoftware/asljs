/*
### RL1

Every level 2 heading is one of `Overview`, `Scope`, `Installation`, `Usage`,
`Further reading`, `Related packages` and `License`, matched exactly, including
case.
*/

import { type RuleValidationFunction }
  from 'asljs-part';
import { readFile }
  from 'node:fs/promises';
import { ALLOWED_HEADINGS,
         headingsOf,
         quoteHeadings }
  from './package-readme.js';

export const validate: RuleValidationFunction =
  async (
      artefact,
      context
    ) =>
  {
  const content =
    await readFile(
      context.files.path(artefact),
      'utf8');

  const unexpected =
    headingsOf(
      content,
      context.markdownDocuments)
    .filter(
      heading => !ALLOWED_HEADINGS.includes(heading));

  if (unexpected.length > 0) {
    throw new Error(
      `Headings outside the agreed set: ${quoteHeadings(unexpected)}. `
        + `Allowed: ${quoteHeadings(ALLOWED_HEADINGS)}.`);
  }
};
