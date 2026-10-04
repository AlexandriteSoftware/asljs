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

/** A page of the site: its repository path and its markdown, ready for MkDocs. */
export interface StagedPage
{
  sourcePath: string;
  markdown: string;
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

/** The href from one repository file to another, relative and encoded. */
export function relativeHref(
    fromSourcePath: string,
    toSourcePath: string
  ): string
{
  const relative =
    path.posix.relative(
      path.posix.dirname(fromSourcePath),
      toSourcePath);

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
 * The pages of the site with their links rewritten for MkDocs.
 *
 * A link to another page becomes a relative link to its markdown file, which
 * MkDocs turns into a link to that page's HTML. A link to any other repository
 * file, or to a markdown file outside the site, goes to that file on the
 * repository's web host instead, so no link points at a file the site does not
 * have.
 */
export function stageSite(
    entry: string,
    options: SiteOptions
  ): StagedPage[]
{
  const sourcePaths =
    collectPages(
      entry,
      options);

  const pages =
    new Set(sourcePaths);

  return sourcePaths.map(
    sourcePath => (
      { sourcePath,
        markdown:
          rewriteLinks(
            options.read(sourcePath),
            href =>
            toStagedHref(
              resolveLink(
                href,
                sourcePath),
              sourcePath,
              pages,
              options)) }
    ));
}

/**
 * The markdown with the destination of every inline link and every link
 * reference definition replaced by `rewrite`. Fenced code blocks and code spans
 * are left as written.
 */
export function rewriteLinks(
    markdown: string,
    rewrite: (href: string) => string
  ): string
{
  let fence: string | null = null;

  return markdown
    .split('\n')
    .map(
      (
          line
        ) =>
      {
        const fenceMatch =
          /^ {0,3}(`{3,}|~{3,})/.exec(line);

        if (fence !== null) {
          if (
            fenceMatch !== null
            && fenceMatch[1][0] === fence[0]
            && fenceMatch[1].length
               >= fence.length
          ) {
            fence = null;
          }

          return line;
        }

        if (fenceMatch !== null) {
          fence = fenceMatch[1];
          return line;
        }

        const definition =
          /^( {0,3}\[[^\]]+\]:[ \t]*)(<[^>]*>|\S+)(.*)$/.exec(
            line);

        if (definition !== null) {
          return definition[1]
            + rewrite(
              unwrapHref(definition[2]))
            + definition[3];
        }

        return line
          .split(/(`+[^`]*`+)/)
          .map(
            (
              part,
              index
            ) =>
              index % 2 === 1
                ? part
                : part.replace(
                  /\]\((<[^>]*>|[^\s)]+)/g,
                  (
                    _match,
                    href: string
                  ) => `](${rewrite(
                    unwrapHref(href))}`))
          .join('');
      })
    .join('\n');
}

function unwrapHref(
    href: string
  ): string
{
  return href.startsWith('<')
      && href.endsWith('>')
    ? href.slice(
      1,
      -1)
    : href;
}

function toStagedHref(
    target: LinkTarget,
    fromSourcePath: string,
    pages: ReadonlySet<string>,
    options: SiteOptions
  ): string
{
  if (target.kind !== 'repository') {
    return target.href.replace(
      / /g,
      '%20');
  }

  if (pages.has(target.path)) {
    return relativeHref(
      fromSourcePath,
      target.path)
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
