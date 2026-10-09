import { findSectionHeading,
         formatUrl,
         parseMarkdown,
         plainText }
  from 'asljs-mdcli';
import { type Root,
         type RootContent }
  from 'mdast';
import { freeLabel }
  from './edit.js';
import { type Status }
  from './results.js';

export type CoverageStatus = 'COMPLETE' | 'INCOMPLETE';

export interface StatusField<T extends string>
{
  status: T;
  note: string;
}

/**
 * A link, by its text and its target as written.
 */
export interface StatusLink
{
  title: string;
  url: string;
}

/**
 * The `## Status` section of a requirement or test, which `rq test`, `rq log`
 * and `rq coverage` write.
 */
export interface StatusSection
{
  /**
   * `- Result:` - the status from the latest results.
   */
  result: StatusField<Status> | null;

  /**
   * `- Coverage:` - the latest `rq coverage` verdict of a requirement.
   */
  coverage: StatusField<CoverageStatus> | null;

  /**
   * `- Execution:` - a test's link to the execution file of its latest
   * result.
   */
  execution: StatusLink | null;
}

const ITEM =
  /^(Result|Coverage|Execution):\s*([\s\S]*)$/;

const RESULT =
  /^(PASS|FAIL|NOT RUN)(?:\s+-\s+([\s\S]*))?$/;

const COVERAGE =
  /^(COMPLETE|INCOMPLETE)(?:\s+-\s+([\s\S]*))?$/;

/**
 * Reads the `## Status` section; `problems` says what does not follow the
 * format, for `rq check`.
 */
export function readStatus(
    root: Root,
    text: string
  ): StatusSection & { problems: string[]; }
{
  const status: StatusSection & { problems: string[]; } =
    { result: null,
      coverage: null,
      execution: null,
      problems: [ ] };

  const range =
    getRange(
      root,
      text);

  if (range === null) {
    return status;
  }

  const definitions =
    collectDefinitions(root);

  for (const node of range.nodes) {
    if (node.type === 'definition') {
      continue;
    }

    if (node.type !== 'list') {
      status.problems.push(
        'the Status section holds more than a list.');

      continue;
    }

    for (const item of node.children) {
      const match =
        ITEM.exec(
          plainText(item).trim());

      const value = match?.[2].trim() ?? '';

      if (match?.[1] === 'Result') {
        const result =
          RESULT.exec(value);

        if (result) {
          status.result =
            { status:
                result[1] as Status,
              note:
                normalize(result[2] ?? '') };

          continue;
        }
      } else if (match?.[1] === 'Coverage') {
        const coverage =
          COVERAGE.exec(value);

        if (coverage) {
          status.coverage =
            { status:
                coverage[1] as CoverageStatus,
              note:
                normalize(coverage[2] ?? '') };

          continue;
        }
      } else if (match?.[1] === 'Execution') {
        const link =
          findLink(
            item,
            definitions);

        if (link) {
          status.execution = link;

          continue;
        }
      }

      status.problems.push(
        `the Status item "${
          plainText(item).trim()
        }" is not "Result: PASS|FAIL|NOT RUN[ - <note>]", "Coverage: COMPLETE|INCOMPLETE[ - <note>]" or "Execution: <link>".`);
    }
  }

  return status;
}

/**
 * The text with the items of its `## Status` section that `rq` owns set to
 * `status`: the section is kept in place when there is one and added at the
 * end otherwise. Any other content of the section - other list items, link
 * definitions, paragraphs - is kept as it is; without that and without any
 * field, the section is removed. The execution link is a reference link
 * labelled with the execution file's id.
 */
export function writeStatus(
    text: string,
    status: StatusSection
  ): string
{
  const root =
    parseMarkdown(text);

  const range =
    getRange(
      root,
      text);

  const kept =
    range === null
    ? { items: [ ],
        other: [ ],
        definitions: [ ] }
    : keepForeign(
      range.nodes,
      text,
      collectDefinitions(root));

  const rest =
    (range === null
    ? text
    : text.slice(
      0,
      range.start)
      + text.slice(range.end))
    + `\n\n${kept.definitions.join('\n')}\n`;

  const label =
    status.execution === null
    ? ''
    : freeLabel(
      rest,
      /^E\d+/.exec(
        status.execution.title)?.[0]
        ?? 'execution');

  const items =
    [ ...status.result === null
      ? [ ]
      : [ `- Result: ${formatField(status.result)}` ],
      ...status.coverage === null
      ? [ ]
      : [ `- Coverage: ${formatField(status.coverage)}` ],
      ...status.execution === null
      ? [ ]
      : [ `- Execution: [${status.execution.title}][${label}]` ],
      ...kept.items ];

  const definitions =
    [ ...status.execution === null
      ? [ ]
      : [ `[${label}]: ${
        formatUrl(
          status.execution.url)
      }` ],
      ...kept.definitions ];

  const parts =
    [ ...items.length === 0
      ? [ ]
      : [ items.join('\n') ],
      ...kept.other,
      ...definitions.length === 0
      ? [ ]
      : [ definitions.join('\n') ] ];

  const section =
    parts.length === 0
    ? ''
    : `## Status\n\n${parts.join('\n\n')}\n`;

  if (range === null) {
    return section === ''
      ? text
      : `${text.trimEnd()}\n\n${section}`;
  }

  const before =
    text.slice(
      0,
      range.start)
    .trimEnd();

  const after =
    text.slice(range.end)
    .trimStart();

  return [ before,
           section.trimEnd(),
           after.trimEnd() ]
    .filter(
      part => part !== '')
    .join('\n\n')
    + '\n';
}

/**
 * The content of a `## Status` section that `rq` does not own, as written:
 * list items other than a valid `Result`, `Coverage` or `Execution`, link
 * definitions other than the one of the execution link, and any other node.
 */
function keepForeign(
    nodes: Root['children'],
    text: string,
    definitions: ReadonlyMap<string, string>
  ): { items: string[]; other: string[]; definitions: string[]; }
{
  const source =
    (
    node: Root | RootContent
  ): string =>
    text.slice(
      node.position!.start.offset,
      node.position!.end.offset);

  const kept =
    { items:
        [ ] as string[],
      other:
        [ ] as string[],
      definitions:
        [ ] as string[] };

  const own = new Set<string>();

  for (const node of nodes) {
    if (node.type === 'list') {
      for (const item of node.children) {
        const match =
          ITEM.exec(
            plainText(item).trim());

        const value = match?.[2].trim() ?? '';

        const link =
          match?.[1] === 'Execution'
          ? findReference(item)
          : null;

        if (
          match?.[1] === 'Result'
          && RESULT.test(value)
          || match?.[1] === 'Coverage'
             && COVERAGE.test(value)
          || match?.[1] === 'Execution'
             && findLink(
               item,
               definitions)
                !== null
        ) {
          if (link !== null) {
            own.add(link);
          }

          continue;
        }

        kept.items.push(
          source(item));
      }
    }
  }

  for (const node of nodes) {
    if (node.type === 'definition') {
      if (
        !own.has(
          node.identifier.toLowerCase())
      ) {
        kept.definitions.push(
          source(node));
      }
    } else if (node.type !== 'list') {
      kept.other.push(
        source(node));
    }
  }

  return kept;
}

/**
 * The identifier of the first reference link of a node, lower-cased.
 */
function findReference(
    node: Root | RootContent
  ): string | null
{
  if (node.type === 'linkReference') {
    return node.identifier.toLowerCase();
  }

  if ('children' in node) {
    for (const child of node.children) {
      const found =
        findReference(child);

      if (found !== null) {
        return found;
      }
    }
  }

  return null;
}

function formatField(
    field: StatusField<string>
  ): string
{
  const note =
    normalize(field.note);

  return note === ''
    ? field.status
    : `${field.status} - ${note}`;
}

function normalize(
    text: string
  ): string
{
  return text
    .replace(
      /\s+/g,
      ' ')
    .trim();
}

function collectDefinitions(
    root: Root
  ): Map<string, string>
{
  const definitions = new Map<string, string>();

  const visit =
    (
        node: Root | RootContent
      ): void =>
    {
    if (node.type === 'definition') {
      definitions.set(
        node.identifier.toLowerCase(),
        node.url);
    }

    if ('children' in node) {
      node.children.forEach(visit);
    }
  };

  visit(root);

  return definitions;
}

function findLink(
    node: Root | RootContent,
    definitions: ReadonlyMap<string, string>
  ): StatusLink | null
{
  if (node.type === 'link') {
    return { title:
               plainText(node),
             url: node.url };
  }

  if (node.type === 'linkReference') {
    const url =
      definitions.get(
        node.identifier.toLowerCase());

    return url === undefined
      ? null
      : { title:
            plainText(node),
          url };
  }

  if ('children' in node) {
    for (const child of node.children) {
      const link =
        findLink(
          child,
          definitions);

      if (link) {
        return link;
      }
    }
  }

  return null;
}

function getRange(
    root: Root,
    text: string
  ): { start: number; end: number; nodes: Root['children']; } | null
{
  const heading =
    findSectionHeading(
      root,
      'Status');

  if (!heading) {
    return null;
  }

  const index =
    root.children.indexOf(heading);

  const next =
    root.children.findIndex(
      (
      node,
      position
    ) =>
      position > index
      && node.type === 'heading'
      && node.depth <= 2);

  return { start:
             heading.position!.start.offset!,
           end:
             next < 0
      ? text.length
      : root.children[next].position!.start.offset!,
           nodes:
             root.children.slice(
               index + 1,
               next < 0
        ? undefined
        : next) };
}
