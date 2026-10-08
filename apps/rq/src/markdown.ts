import { type Heading,
         type Root,
         type RootContent }
  from 'mdast';
import remarkParse
  from 'remark-parse';
import { unified }
  from 'unified';

export type MarkdownNode = Root | RootContent;

export function parseMarkdown(
    text: string
  ): Root
{
  return unified()
    .use(remarkParse)
    .parse(text) as Root;
}

/**
 * The level 2 heading with the given text.
 */
export function findSectionHeading(
    root: Root,
    name: string
  ): Heading | null
{
  return root.children.find(
    (node): node is Heading =>
      node.type === 'heading'
      && node.depth === 2
      && plainText(node) === name)
    ?? null;
}

/**
 * The nodes between a level 2 heading and the next heading of level 1 or 2,
 * or `null` when there is no such heading.
 */
export function getSection(
    root: Root,
    name: string
  ): RootContent[] | null
{
  const heading =
    findSectionHeading(
      root,
      name);

  if (!heading) {
    return null;
  }

  const nodes: RootContent[] = [ ];

  for (
    const node of root.children.slice(
      root.children.indexOf(heading) + 1)
  ) {
    if (
      node.type === 'heading'
      && node.depth <= 2
    ) {
      break;
    }

    nodes.push(node);
  }

  return nodes;
}

export function plainText(
    node: MarkdownNode
  ): string
{
  if ('value' in node) {
    return node.value;
  }

  if ('children' in node) {
    return node.children
      .map(
        child => plainText(child))
      .join('');
  }

  return '';
}

/**
 * Splits a link target that points at a local file into the path, with
 * percent-encoding decoded, and the `#` fragment; `null` for a target with a
 * scheme, a protocol-relative, root-relative or fragment-only target.
 */
export function splitLocalUrl(
    url: string
  ): { path: string; fragment: string; } | null
{
  if (
    /^[a-z][a-z0-9+.-]*:/i.test(url)
    || url.startsWith('/')
    || url.startsWith('#')
    || url === ''
  ) {
    return null;
  }

  const hash =
    url.indexOf('#');

  const encoded =
    hash < 0
    ? url
    : url.slice(
      0,
      hash);

  let decoded: string;

  try {
    decoded =
      decodeURIComponent(encoded);
  } catch {
    decoded = encoded;
  }

  return { path: decoded,
           fragment:
             hash < 0
      ? ''
      : url.slice(hash) };
}

/**
 * A link target in the form written by `rq`: in angle brackets when it has
 * spaces or parentheses.
 */
export function formatUrl(
    url: string
  ): string
{
  return /[\s()]/.test(url)
    ? `<${url}>`
    : url;
}
