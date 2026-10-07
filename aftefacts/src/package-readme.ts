// Shared by the Package README rules: the agreed headings, and how a README's
// own level 2 headings are read out of it.

import { type MarkdownDocumentProvider }
  from 'asljs-part';
import { type Heading }
  from 'mdast';

/**
 * The agreed section headings, in the order they must appear.
 */
export const ALLOWED_HEADINGS: readonly string[] =
  Object.freeze(
    [ 'Overview',
      'Scope',
      'Installation',
      'Usage',
      'Further reading',
      'Related packages',
      'License' ]);

/**
 * The text of every level 2 heading, in document order.
 */
export function headingsOf(
    content: string,
    markdownDocuments: MarkdownDocumentProvider
  ): string[]
{
  const text =
    content.startsWith('\uFEFF')
    ? content.slice(1)
    : content;

  const document =
    markdownDocuments.parse(text);

  return document.root
    .children
    .filter(
      (node): node is Heading =>
        node.type === 'heading'
        && node.depth === 2)
    .map(
      node =>
        text
          .substring(
            node.position?.start.offset ?? 0,
            node.position?.end.offset ?? 0)
          .replace(
            /^##\s*/,
            '')
          .trim());
}

export function quoteHeadings(
    headings: readonly string[]
  ): string
{
  return headings
    .map(
      heading => `"${heading}"`)
    .join(', ');
}
