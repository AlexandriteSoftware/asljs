import { parseMarkdown }
  from './markdown.js';

/**
 * The text with its `## Coverage` section, which `rq coverage` owns, set to
 * `analysis`: in place when there is one, otherwise before `## Status`, or
 * at the end. A line of the analysis that would start a heading is escaped,
 * so that the analysis stays inside the section.
 */
export function writeCoverageSection(
    text: string,
    analysis: string
  ): string
{
  const section =
    `## Coverage\n\n${
    analysis
      .trim()
      .replace(
        /^(\s{0,3})#/gm,
        '$1\\#')
  }\n`;

  const range =
    getRange(
      text,
      'Coverage');

  if (range !== null) {
    return join(
      text.slice(
        0,
        range.start),
      section,
      text.slice(range.end));
  }

  const status =
    getRange(
      text,
      'Status');

  if (status !== null) {
    return join(
      text.slice(
        0,
        status.start),
      section,
      text.slice(status.start));
  }

  return join(
    text,
    section,
    '');
}

/**
 * Whether the text has a `## Coverage` section.
 */
export function hasCoverageSection(
    text: string
  ): boolean
{
  return getRange(
    text,
    'Coverage') !== null;
}

function join(
    before: string,
    section: string,
    after: string
  ): string
{
  return [ before.trimEnd(),
           section.trimEnd(),
           after.trim() ]
    .filter(
      part => part !== '')
    .join('\n\n')
    + '\n';
}

/**
 * The offsets of a level 2 section, from its heading to the next heading of
 * level 1 or 2 or the end; `null` when there is none.
 */
function getRange(
    text: string,
    name: string
  ): { start: number; end: number; } | null
{
  const nodes =
    parseMarkdown(text).children;

  const index =
    nodes.findIndex(
      node =>
      node.type === 'heading'
      && node.depth === 2
      && text.slice(
        node.position!.start.offset,
        node.position!.end.offset)
          .replace(
            /^##\s+/,
            '')
          .trim() === name);

  if (index < 0) {
    return null;
  }

  const next =
    nodes.findIndex(
      (
      node,
      position
    ) =>
      position > index
      && node.type === 'heading'
      && node.depth <= 2);

  return { start:
             nodes[index].position!.start.offset!,
           end:
             next < 0
      ? text.length
      : nodes[next].position!.start.offset! };
}
