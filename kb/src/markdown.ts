import { Root }
  from 'mdast';
import remarkGfm
  from 'remark-gfm';
import remarkParse
  from 'remark-parse';
import remarkStringify
  from 'remark-stringify';
import { Processor,
         unified }
  from 'unified';
import { parse as parseYaml }
  from 'yaml';

/**
 * YAML front matter of a markdown document.
 *
 * `data` is `null` when there is no front matter, or when the front matter is
 * not a YAML mapping.
 */
export interface FrontMatter
{
  /**
   * Raw YAML text, without the `---` fences. Empty when there is no front
   * matter.
   */
  text: string;

  data: Record<string, unknown> | null;

  /**
   * Number of lines the front matter block occupies in the document,
   * including both fences.
   */
  lines: number;
}

export interface MarkdownDocument
{
  /**
   * Library-relative path, or `null` for documents parsed from memory.
   */
  path: string | null;

  /**
   * Full document text, including front matter.
   */
  text: string;

  /**
   * Document text without the front matter block.
   */
  body: string;

  frontMatter: FrontMatter;

  /**
   * Syntax tree of `body`. Node positions are relative to `body`; use
   * `documentLine` to map them onto the full document.
   */
  root: Root;
}

const EMPTY_FRONT_MATTER: FrontMatter =
  { text: '',
    data: null,
    lines: 0 };

/**
 * Split the leading YAML front matter block from a markdown document.
 *
 * A front matter block is recognised when the document starts with a `---`
 * line and a later `---` or `...` line closes it. An unterminated block is
 * treated as ordinary content.
 */
export function splitFrontMatter(
    text: string
  ): { frontMatter: FrontMatter; body: string; }
{
  const lines =
    text.split('\n');

  const first =
    (lines[0] ?? '').trimEnd();

  if (first !== '---') {
    return { frontMatter: EMPTY_FRONT_MATTER,
             body: text };
  }

  let closing = -1;

  for (
    let index = 1;
    index < lines.length;
    index += 1
  ) {
    const line =
      (lines[index] ?? '').trimEnd();

    if (
      line === '---'
      || line === '...'
    ) {
      closing = index;

      break;
    }
  }

  if (closing < 0) {
    return { frontMatter: EMPTY_FRONT_MATTER,
             body: text };
  }

  const yamlText =
    lines.slice(
      1,
      closing).join('\n');

  return { frontMatter:
             { text: yamlText,
               data:
                 parseFrontMatterData(yamlText),
               lines: closing + 1 },
           body:
             lines.slice(closing + 1).join('\n') };
}

/**
 * Parse a markdown document into front matter plus a GFM syntax tree.
 */
export function parseMarkdown(
    text: string,
    documentPath: string | null = null
  ): MarkdownDocument
{
  const { frontMatter,
          body } =
    splitFrontMatter(text);

  const root =
    createProcessor().parse(body) as Root;

  return { path: documentPath,
           text,
           body,
           frontMatter,
           root };
}

/**
 * Map a one-based line number in `document.body` onto a one-based line number
 * in the full document text.
 */
export function documentLine(
    document: MarkdownDocument,
    bodyLine: number
  ): number
{
  return bodyLine + document.frontMatter.lines;
}

/**
 * Re-print a markdown document in the repository markdown style: ATX
 * headings, `-` bullets, `_` emphasis, `*` strong, and fenced code blocks.
 *
 * Front matter is preserved verbatim, because re-printing YAML would lose
 * comments and key order.
 */
export function formatMarkdown(
    text: string
  ): string
{
  const { frontMatter,
          body } =
    splitFrontMatter(text);

  const formattedBody =
    String(
      createProcessor().processSync(body));

  if (frontMatter.lines === 0) {
    return formattedBody;
  }

  return `---\n${frontMatter.text}\n---\n\n${formattedBody.replace(
    /^\n+/,
    '')}`;
}

function createProcessor(
  ): Processor<Root, undefined, undefined, Root, string>
{
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(
      remarkStringify,
      { bullet: '-',
        emphasis: '_',
        strong: '*',
        fence: '`',
        fences: true,
        listItemIndent: 'one',
        rule: '-',
        setext: false });
}

function parseFrontMatterData(
    yamlText: string
  ): Record<string, unknown> | null
{
  if (yamlText.trim() === '') {
    return null;
  }

  try {
    const data =
      parseYaml(yamlText);

    if (
      typeof data
      !== 'object'
      || data === null
      || Array.isArray(data)
    ) {
      return null;
    }

    return data as Record<string, unknown>;
  } catch {
    return null;
  }
}
