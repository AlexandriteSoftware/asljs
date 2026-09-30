// Shared by the Package README rules: the agreed headings, and how a README's
// own level 2 headings are read out of it.

/** The agreed section headings, in the order they must appear. */
export const ALLOWED_HEADINGS =
  [ 'Overview',
    'Scope',
    'Installation',
    'Usage',
    'Further reading',
    'Related packages',
    'License' ];

/**
 * The text of every level 2 heading, in document order.
 *
 * @param {string} content
 * @param {{ markdownDocuments: { parse: (content: string) => any } }} context
 * @returns {string[]}
 */
export function headingsOf(
    content,
    context
  )
{
  const text =
    content.startsWith('﻿')
      ? content.slice(1)
      : content;

  const document =
    context.markdownDocuments
      .parse(text);

  return document.root
    .children
    .filter(
      node =>
        node.type === 'heading'
        && node.depth === 2)
    .map(
      node =>
        text.substring(
          node.position?.start.offset ?? 0,
          node.position?.end.offset ?? 0)
          .replace(
            /^##\s*/,
            '')
          .trim());
}
