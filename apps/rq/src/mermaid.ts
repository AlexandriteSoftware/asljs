import path
  from 'node:path';
import { RqGraph,
         RqNode }
  from './graph.js';
import { NodeStatus }
  from './status.js';

/**
 * How a node is drawn: `neutral` not run, `green` passed, `red` a failed
 * test, `amber` a requirement failing because of what it links to.
 */
export type BorderColour = 'neutral' | 'green' | 'red' | 'amber';

/**
 * `solid` - a test, or a requirement its links fully cover; `dashed` - a
 * requirement they do not; `dotted` - a requirement never checked.
 */
export type BorderStyle = 'solid' | 'dashed' | 'dotted';

export interface Appearance
{
  colour: BorderColour;
  style: BorderStyle;
}

const COLOURS: Readonly<Record<BorderColour, string>> =
  Object.freeze(
    { neutral: '#9e9e9e',
      green: '#2e7d32',
      red: '#c62828',
      amber: '#ef8f00' });

const DASHES: Readonly<Record<BorderStyle, string>> =
  Object.freeze(
    { solid: '',
      dashed:
        ',stroke-dasharray:6 4',
      dotted:
        ',stroke-dasharray:2 3' });

/**
 * The border of a node from its status and, for a requirement, its
 * coverage.
 */
export function getAppearance(
    node: RqNode,
    status: NodeStatus | undefined
  ): Appearance
{
  const colour: BorderColour =
    status?.status === 'PASS'
    ? 'green'
    : status?.status === 'FAIL'
    ? node.kind === 'test'
      ? 'red'
      : 'amber'
    : 'neutral';

  const coverage =
    node.status.coverage?.status;

  return { colour,
           style:
             node.kind !== 'requirement' || coverage === 'COMPLETE'
      ? 'solid'
      : coverage === 'INCOMPLETE'
      ? 'dashed'
      : 'dotted' };
}

/**
 * The graph as Mermaid text: requirements as boxes and tests as rounded
 * boxes, with borders by `getAppearance`, and an edge from each requirement
 * to what implements it. `href` gives the link a node opens, or `null` for
 * none.
 */
export function toMermaid(
    graph: RqGraph,
    href: (file: string) => string | null,
    statuses: ReadonlyMap<string, NodeStatus>
  ): string
{
  const ids =
    new Map(
      [ ...graph.nodes.keys() ]
      .map(
        (
          file,
          index
        ) => [ file,
               `n${index}` ]));

  const lines =
    [ 'graph LR' ];

  for (const [file, node] of graph.nodes) {
    const label =
      escape(
        node.title
        ?? path.basename(
          file,
          '.md'));

    lines.push(
      node.kind === 'test'
        ? `  ${ids.get(file)}(["${label}"])`
        : `  ${ids.get(file)}["${label}"]`);
  }

  for (const [file, node] of graph.nodes) {
    for (const child of node.children) {
      lines.push(
        `  ${ids.get(file)} --> ${ids.get(child)}`);
    }
  }

  for (const [file, node] of graph.nodes) {
    const link =
      href(file);

    if (link !== null) {
      lines.push(
        `  click ${ids.get(file)} href "${escape(link)}"`);
    }

    const { colour, style } =
      getAppearance(
        node,
        statuses.get(file));

    lines.push(
      `  style ${ids.get(file)} stroke:${COLOURS[colour]},stroke-width:2px${
        DASHES[style]
      }`);
  }

  return lines.join('\n');
}

function escape(
    text: string
  ): string
{
  return text.replace(
    /"/g,
    '#quot;');
}
