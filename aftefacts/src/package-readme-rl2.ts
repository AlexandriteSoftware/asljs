/*
### RL2

The level 2 headings appear in that order. A heading may be absent, and no
heading may repeat.
*/

import { type RuleValidationFunction }
  from 'asljs-part';
import { readFile }
  from 'node:fs/promises';
import { ALLOWED_HEADINGS,
         headingsOf }
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

  // Headings outside the agreed set are RL1's business, not this rule's.
  const headings =
    headingsOf(
      content,
      context.markdownDocuments)
    .filter(
      heading => ALLOWED_HEADINGS.includes(heading));

  const seen = new Set<string>();

  for (const heading of headings) {
    if (seen.has(heading)) {
      throw new Error(
        `Heading "${heading}" appears more than once.`);
    }

    seen.add(heading);
  }

  const expected =
    ALLOWED_HEADINGS.filter(
      heading => seen.has(heading));

  for (
    let index = 0;
    index < headings.length;
    index += 1
  ) {
    if (headings[index] !== expected[index]) {
      throw new Error(
        `Headings are out of order: expected ${
          expected.join(', ')
        }, but found ${headings.join(', ')}.`);
    }
  }
};
