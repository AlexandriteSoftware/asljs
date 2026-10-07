/*
### RL1

Article start with a level 1 heading, which is the file name without
extension. Exceptions: when the file name is all caps (e.g., `README.md`).
*/

import { type Heading }
  from 'mdast';
import { readFile }
  from 'node:fs/promises';
import path
  from 'node:path';
import { type RuleValidationFunction }
  from '../rule-validation-function.js';

export const validate: RuleValidationFunction =
  async (
      artefact,
      context
    ) =>
  {
  const articlePath =
    context.files.path(artefact);

  const fileName =
    path.basename(
      articlePath,
      path.extname(articlePath));

  if (/^[A-Z]+$/.test(fileName)) {
    // This is a special file, e.g. README.md, LICENSE.md, etc.
    return;
  }

  let content =
    await readFile(
      articlePath,
      'utf8');

  if (content.startsWith('\uFEFF')) {
    content =
      content.slice(1);
  }

  const document =
    context.markdownDocuments
    .parse(content);

  const heading =
    document.root
    .children
    .find(
      (node): node is Heading =>
        node.type === 'heading'
        && node.depth === 1);

  if (
    !heading
    || heading.position?.start.offset !== 0
  ) {
    throw new Error(
      'Article must start with a level 1 heading.');
  }

  const actualHeading =
    content
    .substring(
      heading.position.start.offset,
      heading.position.end.offset ?? 0)
    .trim();

  const expectedHeading = `# ${fileName}`;

  if (actualHeading !== expectedHeading) {
    throw new Error(
      `Article heading must be "${expectedHeading}", but was "${actualHeading}".`);
  }
};
