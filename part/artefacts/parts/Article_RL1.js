/*
RL1 - Article start with a level 1 heading, which is the file name without
extension.
*/

import path
  from 'node:path';
import { readFile }
  from 'node:fs/promises';

/**
 * @type { import('../../src/rule-validation-function.js')
 *           .RuleValidationFunction }
 */
export async function validate(
  artefact,
  context)
{
  let content =
    await readFile(
      artefact.path,
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
        node =>
          node.type === 'heading'
          && node.depth === 1);

  if (
    !heading
    || heading.position?.start.offset !== 0)
  {
    throw new Error(
      'Article must start with a level 1 heading.');
  }

  const headingText =
    content.substring(
      heading.position?.start.offset ?? 0,
      heading.position?.end.offset ?? 0);

  const expectedHeadingText =
    path.basename(
      artefact.path,
      path.extname(
        artefact.path));
    
  const expectedHeading =
    `# ${expectedHeadingText}`;

  const actualHeading =
    headingText.trim();

  if (actualHeading !== expectedHeading) {
    throw new Error(
      `Article heading must be "${expectedHeading}", but was "${actualHeading}".`);
  }
}
