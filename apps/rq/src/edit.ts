import { type Definition,
         type Image,
         type Link,
         type LinkReference,
         type ListItem }
  from 'mdast';
import path
  from 'node:path';
import { getNodeId }
  from './graph.js';
import { findSectionHeading,
         formatUrl,
         getSection,
         MarkdownNode,
         parseMarkdown,
         splitLocalUrl }
  from './markdown.js';

interface Change
{
  start: number;
  end: number;
  text: string;
}

/**
 * The target of a link resolved against the folder of the document it is in,
 * with the fragment, or `null` for a link to no local file.
 */
export interface ResolvedUrl
{
  path: string;
  fragment: string;
}

/**
 * The text with `line` as a new item at the end of the last list of a level 2
 * section, or in a list right after the heading when the section has none,
 * adding the section at the end of the document when it is missing.
 */
export function appendListItem(
    text: string,
    section: string,
    line: string
  ): string
{
  const root =
    parseMarkdown(text);

  const nodes =
    getSection(
      root,
      section);

  if (!nodes) {
    return `${text.trimEnd()}\n\n## ${section}\n\n- ${line}\n`;
  }

  const last =
    nodes.findLast(
      node => node.type === 'list')
    ?? findSectionHeading(
      root,
      section)!;

  const offset =
    last.position!.end.offset!;

  const rest =
    text.slice(offset);

  return text.slice(
    0,
    offset)
    + (last.type === 'list'
      ? '\n'
      : '\n\n')
    + `- ${line}`
    + (rest === ''
      ? '\n'
      : rest);
}

/**
 * The text of the document at `from` with a link to `to` added to its `##
 * Implementation` list, as a reference link: `- [<title>][<label>]` and a
 * `[<label>]: <path>` definition at the end of the section. The label is the
 * id of `to`, with a number added when the document already uses it.
 */
export function addImplementationLink(
    text: string,
    from: string,
    to: string,
    title: string
  ): string
{
  const label =
    freeLabel(
      text,
      getNodeId(to)
      ?? path.basename(
        to,
        path.extname(to)));

  return appendDefinition(
    appendListItem(
      text,
      'Implementation',
      `[${escapeLinkText(title)}][${label}]`),
    'Implementation',
    label,
    formatUrl(
      relativeUrl(
        from,
        to)));
}

/**
 * The text with `[<label>]: <url>` added at the end of a level 2 section,
 * after a blank line unless the section already ends with definitions.
 */
export function appendDefinition(
    text: string,
    section: string,
    label: string,
    url: string
  ): string
{
  const root =
    parseMarkdown(text);

  const heading =
    findSectionHeading(
      root,
      section);

  const line =
    `[${label}]: ${url}`;

  if (!heading) {
    return `${text.trimEnd()}\n\n${line}\n`;
  }

  const nodes =
    getSection(
      root,
      section)!;

  const last =
    nodes.at(-1)
    ?? heading;

  const offset =
    last.position!.end.offset!;

  const rest =
    text.slice(offset);

  return text.slice(
    0,
    offset)
    + (last.type === 'definition'
      ? '\n'
      : '\n\n')
    + line
    + (rest === ''
      ? '\n'
      : rest);
}

/**
 * `label`, or `label-2`, `label-3`... when a link definition of the text
 * already uses it; labels are compared case-insensitively, as in markdown.
 */
export function freeLabel(
    text: string,
    label: string
  ): string
{
  const used = new Set<string>();

  const visit =
    (
        node: MarkdownNode
      ): void =>
    {
    if (node.type === 'definition') {
      used.add(
        node.identifier.toLowerCase());
    }

    if ('children' in node) {
      node.children.forEach(visit);
    }
  };

  visit(
    parseMarkdown(text));

  let candidate = label;

  for (
    let index = 2;
    used.has(
      candidate.toLowerCase());
    index += 1
  ) {
    candidate = `${label}-${index}`;
  }

  return candidate;
}

/**
 * Removes the links of the document at `file` whose target `matches`: an `##
 * Implementation` list item that holds such a link is removed with it, a link
 * definition is removed with its line, and any other link, or reference to a
 * removed definition, is replaced by its text.
 */
export function removeLinks(
    text: string,
    file: string,
    matches: (target: string) => boolean
  ): string
{
  const root =
    parseMarkdown(text);

  const isMatch =
    (
        url: string
      ): boolean =>
    {
    const target =
      resolveUrl(
        file,
        url);

    return target !== null
      && matches(target.path);
  };

  const removedDefinitions =
    new Set(
      collect<Definition>(
      root,
      'definition'
    )
      .filter(
        node => isMatch(node.url))
      .map(
        node => node.identifier));

  const linksTo =
    (
        node: MarkdownNode
      ): boolean =>
    {
    if (node.type === 'link') {
      return isMatch(node.url);
    }

    if (node.type === 'linkReference') {
      return removedDefinitions.has(node.identifier);
    }

    return 'children' in node
      && node.children.some(linksTo);
  };

  const changes: Change[] = [ ];

  const implementationItems =
    new Set(
      (getSection(
        root,
        'Implementation') ?? [ ])
      .flatMap(
        node =>
          node.type === 'list'
            ? node.children
            : [ ]));

  const visit =
    (
        node: MarkdownNode
      ): void =>
    {
    if (
      node.type === 'listItem'
      && implementationItems.has(node)
      && linksTo(node)
    ) {
      changes.push(
        wholeLines(
          text,
          node));

      return;
    }

    if (
      node.type === 'definition'
      && removedDefinitions.has(node.identifier)
    ) {
      changes.push(
        wholeLines(
          text,
          node));

      return;
    }

    if (
      node.type === 'link'
      && isMatch(node.url)
      || node.type === 'linkReference'
         && removedDefinitions.has(node.identifier)
    ) {
      changes.push(
        { start:
            node.position!.start.offset!,
          end:
            node.position!.end.offset!,
          text:
            childrenSource(
              text,
              node) });

      return;
    }

    if ('children' in node) {
      for (const child of node.children) {
        visit(child);
      }
    }
  };

  visit(root);

  return tidy(
    apply(
      text,
      changes));
}

/**
 * Rewrites the targets of the links, images and link definitions of the
 * document at `file`. `rewrite` gets each local target resolved against the
 * document's folder and returns the new absolute path, or `null` to keep the
 * link. The fragment is kept, and the new target is relative to `newFile`, the
 * document's own path after the change. The text of an `## Implementation`
 * link that is `oldTitle` becomes `newTitle`.
 */
export function rewriteLinks(
    text: string,
    file: string,
    newFile: string,
    rewrite: (target: string) => string | null,
    titles?: { oldTitle: string; newTitle: string; }
  ): string
{
  const root =
    parseMarkdown(text);

  const changes: Change[] = [ ];

  const implementationLinks =
    new Set(
      (getSection(
        root,
        'Implementation') ?? [ ])
      .flatMap(
        node =>
          collect<Link>(
            node,
            'link'
          )));

  for (
    const node of [ ...collect<Link>(root, 'link'),
                    ...collect<Image>(root, 'image'),
                    ...collect<Definition>(root, 'definition') ]
  ) {
    const target =
      resolveUrl(
        file,
        node.url);

    const newTarget =
      target === null
      ? null
      : rewrite(target.path);

    if (
      target === null
      || newTarget === null
    ) {
      continue;
    }

    const url =
      formatUrl(
        relativeUrl(
          newFile,
          newTarget)
        + target.fragment);

    const title =
      node.title
      ? ` "${
        node.title.replace(
          /"/g,
          '\\"')
      }"`
      : '';

    let source: string;

    if (node.type === 'definition') {
      source =
        `[${node.label ?? node.identifier}]: ${url}${title}`;
    } else if (node.type === 'image') {
      source =
        `![${node.alt ?? ''}](${url}${title})`;
    } else {
      const linkText =
        childrenSource(
          text,
          node);

      source =
        `[${
        titles
          && implementationLinks.has(node)
          && linkText === escapeLinkText(titles.oldTitle)
          ? escapeLinkText(titles.newTitle)
          : linkText
      }](${url}${title})`;
    }

    changes.push(
      { start:
          node.position!.start.offset!,
        end:
          node.position!.end.offset!,
        text: source });
  }

  if (titles) {
    const definitions =
      new Map(
        collect<Definition>(
        root,
        'definition'
      )
        .map(
          node => [ node.identifier,
                    node.url ]));

    for (
      const node of (getSection(
        root,
        'Implementation') ?? [ ])
        .flatMap(
          item =>
            collect<LinkReference>(
              item,
              'linkReference'
            ))
    ) {
      const url =
        definitions.get(node.identifier);

      const target =
        url === undefined
        ? null
        : resolveUrl(
          file,
          url);

      if (
        node.referenceType !== 'full'
        || target === null
        || rewrite(target.path)
           === null
        || childrenSource(
          text,
          node)
           !== escapeLinkText(titles.oldTitle)
      ) {
        continue;
      }

      changes.push(
        { start:
            node.position!.start.offset!,
          end:
            node.position!.end.offset!,
          text:
            `[${escapeLinkText(titles.newTitle)}][${
            node.label ?? node.identifier
          }]` });
    }
  }

  return apply(
    text,
    changes);
}

/**
 * The text with its level 1 heading replaced, or added at the start when
 * there is none.
 */
export function setTitle(
    text: string,
    title: string
  ): string
{
  const heading =
    parseMarkdown(text).children.find(
      node =>
      node.type === 'heading'
      && node.depth === 1);

  if (!heading) {
    return `# ${title}\n\n${text}`;
  }

  return apply(
    text,
    [ { start:
          heading.position!.start.offset!,
        end:
          heading.position!.end.offset!,
        text: `# ${title}` } ]);
}

/**
 * A link target of the document at `file` resolved against its folder.
 */
export function resolveUrl(
    file: string,
    url: string
  ): ResolvedUrl | null
{
  const local =
    splitLocalUrl(url);

  if (!local) {
    return null;
  }

  return { path:
             path.resolve(
               path.dirname(file),
               local.path),
           fragment: local.fragment };
}

/**
 * The path of `to` relative to the folder of `from`, with `/` separators.
 */
export function relativeUrl(
    from: string,
    to: string
  ): string
{
  return path.relative(
    path.dirname(from),
    to)
    .split(path.sep)
    .join('/');
}

function escapeLinkText(
    text: string
  ): string
{
  return text.replace(
    /([[\]\\])/g,
    '\\$1');
}

function collect<T extends MarkdownNode>(
    node: MarkdownNode,
    type: T['type']
  ): T[]
{
  const found: T[] = [ ];

  const visit =
    (
        item: MarkdownNode
      ): void =>
    {
    if (item.type === type) {
      found.push(
        item as T);
    }

    if ('children' in item) {
      for (const child of item.children) {
        visit(child);
      }
    }
  };

  visit(node);

  return found;
}

function childrenSource(
    text: string,
    node: Link | LinkReference
  ): string
{
  if (node.children.length === 0) {
    return '';
  }

  return text.slice(
    node.children[0].position!.start.offset,
    node.children[node.children.length - 1].position!.end.offset);
}

/**
 * A change that removes the lines a node spans, with their line break.
 */
function wholeLines(
    text: string,
    node: ListItem | Definition
  ): Change
{
  const start =
    text.lastIndexOf(
      '\n',
      node.position!.start.offset! - 1)
    + 1;

  const lineEnd =
    text.indexOf(
      '\n',
      node.position!.end.offset!);

  return { start,
           end:
             lineEnd < 0
      ? text.length
      : lineEnd + 1,
           text: '' };
}

function apply(
    text: string,
    changes: Change[]
  ): string
{
  let result = text;

  for (
    const change of [ ...changes ].sort(
      (
        a,
        b
      ) => b.start - a.start)
  ) {
    result =
      result.slice(
        0,
        change.start)
      + change.text
      + result.slice(change.end);
  }

  return result;
}

/**
 * Collapses the blank lines a removal leaves behind.
 */
function tidy(
    text: string
  ): string
{
  return `${
    text
      .replace(
        /\n{3,}/g,
        '\n\n')
      .trimEnd()
  }\n`;
}
