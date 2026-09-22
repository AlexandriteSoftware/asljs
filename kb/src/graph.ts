import { Stats }
  from 'node:fs';
import fs
  from 'node:fs/promises';
import { Backlink,
         documentName,
         isNameLink,
         resolveLinkTarget }
  from './backlinks.js';
import { extractLinks,
         LinkKind }
  from './extract.js';
import { globPattern,
         listEntries,
         readTextFile }
  from './files.js';
import { resolveLibraryPath,
         toLibraryPath }
  from './library.js';
import { MarkdownDocument,
         parseMarkdown }
  from './markdown.js';
import { documentTitle,
         isMarkdown }
  from './notes.js';

export interface Article
{
  /**
   * Library-relative POSIX path.
   */
  path: string;

  title: string;

  size: number;

  modified: string;
}

export interface GraphLink
{
  /**
   * Path of the document holding the link.
   */
  from: string;

  line: number;

  column: number;

  kind: LinkKind;

  /**
   * Link destination as written.
   */
  target: string;

  text: string;

  /**
   * Library paths this link may address, or, for a link that addresses a
   * document by bare name, that name. Empty for a link that leaves the
   * library.
   */
  to: string[];
}

export interface GraphStats
{
  articles: number;

  links: number;

  /**
   * Links whose destination is not a library document.
   */
  external: number;
}

export interface LinkGraphOptions
{
  /**
   * Glob pattern limiting the documents to index. Defaults to `**\/*.md`.
   */
  pattern?: string;

  /**
   * Include dot files and dot folders. Defaults to `false`.
   */
  hidden?: boolean;
}

/**
 * In-memory index of the library: the articles, and the links between them.
 *
 * The graph is built once and then kept current by applying one change at a
 * time, so that a long-running process answers link questions without
 * re-reading the library. A one-shot process is better served by
 * `findBacklinks`, which scans directly.
 *
 * Link destinations are resolved once, at index time, with the same rules
 * `findBacklinks` applies.
 */
const DEFAULT_PATTERN = '**/*.md';

function describeFile(
    stats: Stats
  ): { size: number; modified: string; } | null
{
  if (!stats.isFile()) {
    return null;
  }

  return { size: stats.size,
           modified:
             stats.mtime.toISOString() };
}

export class LinkGraph
{
  readonly #root: string;

  readonly #options: LinkGraphOptions;

  readonly #articles = new Map<string, Article>();

  readonly #outgoing = new Map<string, GraphLink[]>();

  readonly #incomingByPath = new Map<string, GraphLink[]>();

  readonly #incomingByName = new Map<string, GraphLink[]>();

  #external = 0;

  constructor(
      root: string,
      options: LinkGraphOptions = {}
    )
  {
    this.#root = root;
    this.#options = options;
  }

  /**
   * Every indexed article, sorted by path.
   */
  articles(): Article[]
  {
    return [ ...this.#articles.values() ]
      .sort(
        (left, right) =>
        left.path.localeCompare(right.path));
  }

  article(
      documentPath: string
    ): Article | undefined
  {
    return this.#articles.get(
      this.#toPath(documentPath));
  }

  /**
   * Links written in one document, in document order.
   */
  outgoing(
      documentPath: string
    ): GraphLink[]
  {
    return [ ...this.#outgoing.get(
      this.#toPath(documentPath)) ?? [ ] ];
  }

  /**
   * Links that point at one entry, from anywhere in the library.
   *
   * The entry does not have to be indexed, so a removed or not yet created
   * document still reports the links left pointing at it.
   */
  incoming(
      documentPath: string
    ): GraphLink[]
  {
    const target =
      this.#toPath(documentPath);

    const byPath =
      this.#incomingByPath.get(target) ?? [ ];

    const byName =
      this.#incomingByName.get(
        documentName(target)) ?? [ ];

    return [ ...byPath,
             ...byName ];
  }

  /**
   * Links that point at one entry, in the shape `findBacklinks` reports,
   * sorted by document and position.
   */
  backlinksTo(
      documentPath: string,
      options: { includeSelf?: boolean; } = {}
    ): Backlink[]
  {
    const target =
      this.#toPath(documentPath);

    return this.incoming(target)
      .filter(
        link =>
        options.includeSelf === true
        || link.from !== target)
      .map(
        link => ({ path: link.from,
                   line: link.line,
                   column: link.column,
                   kind: link.kind,
                   target: link.target,
                   text: link.text }))
      .sort(
        (left, right) =>
        left.path.localeCompare(right.path)
        || left.line - right.line
        || left.column - right.column);
  }

  stats(): GraphStats
  {
    let links = 0;

    for (const documentLinks of this.#outgoing.values()) {
      links += documentLinks.length;
    }

    return { articles: this.#articles.size,
             links,
             external: this.#external };
  }

  /**
   * Index every document of the library, replacing the current content.
   */
  async rebuild(): Promise<void>
  {
    this.#articles.clear();
    this.#outgoing.clear();
    this.#incomingByPath.clear();
    this.#incomingByName.clear();
    this.#external = 0;

    const entries =
      await listEntries(
        this.#root,
        { pattern:
            globPattern(
              this.#options.pattern,
              DEFAULT_PATTERN),
          kind: 'file',
          hidden: this.#options.hidden });

    for (const entry of entries) {
      if (!isMarkdown(entry.path)) {
        continue;
      }

      await this.update(entry.path);
    }
  }

  /**
   * Index one document, replacing what was held for it. A document that is
   * gone, or that is not markdown, is removed from the graph instead.
   */
  async update(
      documentPath: string
    ): Promise<void>
  {
    const target =
      this.#toPath(documentPath);

    this.remove(target);

    if (!isMarkdown(target)) {
      return;
    }

    const entry =
      await this.#statOrNull(target);

    if (!entry) {
      return;
    }

    const document =
      parseMarkdown(
        await readTextFile(
          this.#root,
          target),
        target);

    this.#articles.set(
      target,
      { path: target,
        title:
          documentTitle(
            document,
            target),
        size: entry.size,
        modified: entry.modified });

    this.#addLinks(
      target,
      document);
  }

  /**
   * Record the links one document writes, in both directions.
   */
  #addLinks(
      documentPath: string,
      document: MarkdownDocument
    ): void
  {
    const links: GraphLink[] = [ ];

    for (const link of extractLinks(document)) {
      links.push(
        { from: documentPath,
          line: link.line,
          column: link.column,
          kind: link.kind,
          target: link.target,
          text: link.text,
          to:
            resolveLinkTarget(
              this.#root,
              documentPath,
              link) });
    }

    this.#outgoing.set(
      documentPath,
      links);

    for (const link of links) {
      this.#addIncoming(link);
    }
  }

  #addIncoming(
      link: GraphLink
    ): void
  {
    if (link.to.length === 0) {
      this.#external += 1;

      return;
    }

    const index =
      this.#indexFor(link);

    for (const key of link.to) {
      const existing =
        index.get(key);

      if (!existing) {
        index.set(
          key,
          [ link ]);

        continue;
      }

      existing.push(link);
    }
  }

  /**
   * Drop one document and every link it wrote.
   */
  remove(
      documentPath: string
    ): void
  {
    const target =
      this.#toPath(documentPath);

    this.#articles.delete(target);

    const links =
      this.#outgoing.get(target);

    if (!links) {
      return;
    }

    this.#outgoing.delete(target);

    for (const link of links) {
      if (link.to.length === 0) {
        this.#external -= 1;

        continue;
      }

      const index =
        this.#indexFor(link);

      for (const key of link.to) {
        const remaining =
          (index.get(key) ?? [ ])
            .filter(
              candidate => candidate !== link);

        if (remaining.length === 0) {
          index.delete(key);
        } else {
          index.set(
            key,
            remaining);
        }
      }
    }
  }

  /**
   * A link that addresses a document by name is indexed by that name; every
   * other link is indexed by the paths it may address.
   */
  #indexFor(
      link: GraphLink
    ): Map<string, GraphLink[]>
  {
    if (isNameLink(link)) {
      return this.#incomingByName;
    }

    return this.#incomingByPath;
  }

  async #statOrNull(
      documentPath: string
    ): Promise<{ size: number; modified: string; } | null>
  {
    const absolute =
      resolveLibraryPath(
        this.#root,
        documentPath);

    try {
      return describeFile(
        await fs.stat(absolute));
    } catch {
      return null;
    }
  }

  #toPath(
      documentPath: string
    ): string
  {
    return toLibraryPath(
      this.#root,
      resolveLibraryPath(
        this.#root,
        documentPath));
  }
}

/**
 * Build a link graph for the library and index it.
 */
export async function createLinkGraph(
    root: string,
    options: LinkGraphOptions = {}
  ): Promise<LinkGraph>
{
  const graph =
    new LinkGraph(
      root,
      options);

  await graph.rebuild();

  return graph;
}
