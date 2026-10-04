import { Marked,
         type Token,
         type Tokens }
  from 'marked';
import path
  from 'node:path';

/** Where a link in a page goes, once resolved against the page it is in. */
export type LinkTarget =
  | { kind: 'external'; href: string; }
  | { kind: 'anchor'; href: string; }
  | { kind: 'repository'; path: string; hash: string; };

/** A rendered page: where it is written, its title and its HTML. */
export interface Page
{
  sourcePath: string;
  outputPath: string;
  title: string;
  html: string;
}

export interface SiteOptions
{
  /** Reads a repository file by its path relative to the repository root. */
  read: (sourcePath: string) => string;
  /** Whether a repository path names a markdown file that exists. */
  isMarkdownFile: (sourcePath: string) => boolean;
  /** Whether a repository path names a directory. */
  isDirectory: (sourcePath: string) => boolean;
  /** The repository's web URL, for links to files that are not pages. */
  repositoryUrl: string;
  /** The branch those links point at. */
  branch: string;
}

/** The site title, shown in the header and in every page title. */
export const SITE_NAME = 'asljs';

/** The stylesheet every page links, at the site root. */
export const STYLESHEET_PATH = 'site.css';

/**
 * Where a markdown file is written in the site.
 *
 * A `README.md` becomes its directory's `index.html`, so the root README is the
 * landing page and a package README is the package's page. Any other file keeps
 * its name with `.html` in place of `.md`.
 */
export function toOutputPath(
    sourcePath: string
  ): string
{
  const directory =
    path.posix.dirname(sourcePath);

  const name =
    path.posix.basename(sourcePath);

  const outputName =
    name.toLowerCase() === 'readme.md'
    ? 'index.html'
    : `${
      name.slice(
        0,
        -'.md'.length)
    }.html`;

  return directory === '.'
    ? outputName
    : `${directory}/${outputName}`;
}

/**
 * The link resolved against the page that holds it.
 *
 * A relative link becomes a repository path. One that climbs above the
 * repository root is left as written, as are absolute URLs and anchors.
 */
export function resolveLink(
    href: string,
    fromSourcePath: string
  ): LinkTarget
{
  if (href.startsWith('#')) {
    return { kind: 'anchor',
             href };
  }

  if (
    /^[a-z][a-z0-9+.-]*:/i.test(href)
    || href.startsWith('//')
  ) {
    return { kind: 'external',
             href };
  }

  const hashIndex =
    href.indexOf('#');

  const linkPath =
    hashIndex === -1
    ? href
    : href.slice(
      0,
      hashIndex);

  const hash =
    hashIndex === -1
    ? ''
    : href.slice(hashIndex);

  const joined =
    path.posix.normalize(
      path.posix.join(
        path.posix.dirname(fromSourcePath),
        safeDecodeUri(linkPath)));

  if (
    joined === '..'
    || joined.startsWith('../')
  ) {
    return { kind: 'external',
             href };
  }

  return { kind: 'repository',
           path:
             joined.replace(
               /\/$/,
               ''),
           hash };
}

/** The href from one page of the site to another. */
export function relativeHref(
    fromOutputPath: string,
    toOutputPath: string
  ): string
{
  const relative =
    path.posix.relative(
      path.posix.dirname(fromOutputPath),
      toOutputPath);

  return relative
    .split('/')
    .map(
      segment => encodeURIComponent(segment))
    .join('/');
}

/**
 * The markdown files the site is made of: the entry and every markdown file
 * reachable from it through relative links, in the order they are found.
 */
export function collectPages(
    entry: string,
    options: Pick<SiteOptions, 'read' | 'isMarkdownFile'>
  ): string[]
{
  const marked =
    new Marked();

  const found: string[] = [ ];
  const seen = new Set<string>();

  const queue =
    [ entry ];

  while (queue.length > 0) {
    const sourcePath =
      queue.shift() as string;

    if (seen.has(sourcePath)) {
      continue;
    }

    seen.add(sourcePath);
    found.push(sourcePath);

    const tokens =
      marked.lexer(
        options.read(sourcePath));

    marked.walkTokens(
      tokens,
      (
          token: Token
        ): void =>
      {
        if (token.type !== 'link') {
          return;
        }

        const target =
          resolveLink(
            (token as Tokens.Link).href,
            sourcePath);

        if (
          target.kind === 'repository'
          && target.path.toLowerCase().endsWith('.md')
          && options.isMarkdownFile(target.path)
          && !seen.has(target.path)
        ) {
          queue.push(target.path);
        }
      });
  }

  return found;
}

/**
 * Renders every page of the site.
 *
 * A link to another page becomes a link to its HTML. A link to any other
 * repository file, or to a markdown file outside the site, goes to that file on
 * the repository's web host instead, so no link points at a file the site does
 * not have.
 */
export function renderSite(
    entry: string,
    options: SiteOptions
  ): Page[]
{
  const sourcePaths =
    collectPages(
      entry,
      options);

  const outputPaths =
    new Map(
      sourcePaths.map(
        sourcePath => [ sourcePath,
                        toOutputPath(sourcePath) ]));

  return sourcePaths.map(
    sourcePath =>
      renderPage(
        sourcePath,
        outputPaths,
        options));
}

function renderPage(
    sourcePath: string,
    outputPaths: ReadonlyMap<string, string>,
    options: SiteOptions
  ): Page
{
  const outputPath =
    outputPaths.get(sourcePath) as string;

  const slugs =
    createSlugger();

  let title: string | null = null;

  const marked =
    new Marked();

  marked.use(
    { renderer:
        { link(
          this: { parser: { parseInline: (tokens: Token[]) => string; }; },
          token: Tokens.Link
        ): string
        {
          const href =
            toPageHref(
              resolveLink(
                token.href,
                sourcePath),
              outputPath,
              outputPaths,
              options);

          const titleAttribute =
            token.title
            ? ` title="${escapeHtml(token.title)}"`
            : '';

          return `<a href="${escapeHtml(href)}"${titleAttribute}>${
            this.parser.parseInline(token.tokens)
          }</a>`;
        },
          heading(
          this: { parser: { parseInline: (tokens: Token[]) => string; }; },
          token: Tokens.Heading
        ): string
        {
          const text =
            this.parser.parseInline(token.tokens);

          const plain =
            stripTags(text);

          if (
            title === null
            && token.depth === 1
          ) {
            title = plain;
          }

          return `<h${token.depth} id="${
            slugs(plain)
          }">${text}</h${token.depth}>\n`;
        } } });

  const body =
    marked.parse(
      options.read(sourcePath),
      { async: false });

  const pageTitle =
    title
    ?? path.posix.basename(sourcePath);

  return { sourcePath,
           outputPath,
           title: pageTitle,
           html:
             renderDocument(
               { title: pageTitle,
                 body,
                 outputPath,
                 sourceUrl:
                   repositoryFileUrl(
                     sourcePath,
                     options,
                     false),
                 repositoryUrl:
                   options.repositoryUrl }) };
}

function toPageHref(
    target: LinkTarget,
    fromOutputPath: string,
    outputPaths: ReadonlyMap<string, string>,
    options: SiteOptions
  ): string
{
  if (target.kind !== 'repository') {
    return target.href;
  }

  const page =
    outputPaths.get(target.path);

  if (page !== undefined) {
    return relativeHref(
      fromOutputPath,
      page)
      + target.hash;
  }

  return repositoryFileUrl(
    target.path,
    options,
    options.isDirectory(target.path))
    + target.hash;
}

function repositoryFileUrl(
    repositoryPath: string,
    options: Pick<SiteOptions, 'repositoryUrl' | 'branch'>,
    directory: boolean
  ): string
{
  const kind =
    directory
    ? 'tree'
    : 'blob';

  const encodedPath =
    repositoryPath
    .split('/')
    .map(
      segment => encodeURIComponent(segment))
    .join('/');

  return `${options.repositoryUrl}/${kind}/${options.branch}/${encodedPath}`;
}

interface DocumentParts
{
  title: string;
  body: string;
  outputPath: string;
  sourceUrl: string;
  repositoryUrl: string;
}

/** The page around a rendered body: header, article and footer. */
export function renderDocument(
    parts: DocumentParts
  ): string
{
  const home =
    relativeHref(
      parts.outputPath,
      'index.html');

  const stylesheet =
    relativeHref(
      parts.outputPath,
      STYLESHEET_PATH);

  const documentTitle =
    parts.outputPath === 'index.html'
    ? SITE_NAME
    : `${parts.title} · ${SITE_NAME}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(documentTitle)}</title>
  <link rel="stylesheet" href="${escapeHtml(stylesheet)}">
</head>
<body>
  <header class="site-header">
    <a class="site-home" href="${escapeHtml(home)}">${SITE_NAME}</a>
    <a href="${escapeHtml(parts.repositoryUrl)}">GitHub</a>
  </header>
  <main>
${parts.body}
  </main>
  <footer class="site-footer">
    <a href="${escapeHtml(parts.sourceUrl)}">View source</a>
  </footer>
</body>
</html>
`;
}

/**
 * Heading ids as GitHub makes them, so a `file.md#heading` link written for the
 * repository reaches the same heading on the site.
 */
export function createSlugger(
  ): (text: string) => string
{
  const counts = new Map<string, number>();

  return (
      text: string
    ): string =>
  {
    const base =
      text
      .toLowerCase()
      .trim()
      .replace(
        /[^\p{L}\p{N}\s_-]/gu,
        '')
      .replace(
        /\s/g,
        '-');

    const count =
      counts.get(base)
      ?? 0;

    counts.set(
      base,
      count + 1);

    return count === 0
      ? base
      : `${base}-${count}`;
  };
}

function stripTags(
    html: string
  ): string
{
  return html
    .replace(
      /<[^>]*>/g,
      '')
    .replace(
      /&lt;/g,
      '<')
    .replace(
      /&gt;/g,
      '>')
    .replace(
      /&quot;/g,
      '"')
    .replace(
      /&#39;/g,
      "'")
    .replace(
      /&amp;/g,
      '&');
}

function escapeHtml(
    text: string
  ): string
{
  return text
    .replace(
      /&/g,
      '&amp;')
    .replace(
      /</g,
      '&lt;')
    .replace(
      />/g,
      '&gt;')
    .replace(
      /"/g,
      '&quot;');
}

function safeDecodeUri(
    text: string
  ): string
{
  try {
    return decodeURI(text);
  } catch {
    return text;
  }
}
