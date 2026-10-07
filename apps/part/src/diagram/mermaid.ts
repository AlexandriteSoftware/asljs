import { displayLocation }
  from '../location.js';
import { DiagramEdgeStyle }
  from '../model/diagram-document.js';
import { Diagram }
  from './diagram-builder.js';

const EDGE_ARROWS: Record<DiagramEdgeStyle, string> =
  { solid: '-->',
    dotted: '-.->',
    thick: '==>',
    invisible: '~~~' };

/**
 * Mermaid `graph` text of a diagram: grouped nodes in subgraphs, in order of
 * group name, then the ungrouped nodes, then the edges.
 */
export function toMermaid(
    diagram: Diagram
  ): string
{
  const ids =
    assignIds(
      'n',
      diagram.nodes.map(
        node => node.location));

  const lines =
    [ `graph ${diagram.direction}` ];

  const groups =
    [ ...new Set(
      diagram.nodes
        .map(
          node => node.group)
        .filter(
          (group): group is string => group !== null)) ]
    .sort(
      (left, right) => left.localeCompare(right));

  const groupIds =
    assignIds(
      'g',
      groups);

  const nodeLine =
    (location: string, label: string): string =>
    `${ids.get(location)}["${escapeText(label)}"]`;

  for (const group of groups) {
    lines.push(
      `  subgraph ${groupIds.get(group)}["${escapeText(group)}"]`);

    for (const node of diagram.nodes) {
      if (node.group === group) {
        lines.push(
          `    ${
            nodeLine(
              node.location,
              node.label)
          }`);
      }
    }

    lines.push('  end');
  }

  for (const node of diagram.nodes) {
    if (node.group === null) {
      lines.push(
        `  ${
          nodeLine(
            node.location,
            node.label)
        }`);
    }
  }

  for (const edge of diagram.edges) {
    const label =
      edge.label === null
        || edge.style === 'invisible'
      ? ''
      : `|"${escapeText(edge.label)}"|`;

    lines.push(
      `  ${ids.get(edge.from)} ${EDGE_ARROWS[edge.style]}${label} ${
        ids.get(edge.to)
      }`);
  }

  return lines.join('\n');
}

/**
 * Mermaid ids: the prefix and the value's display form with every other
 * character replaced by `_`, with a numeric suffix when two collide.
 */
function assignIds(
    prefix: string,
    values: string[]
  ): Map<string, string>
{
  const ids = new Map<string, string>();

  const used = new Set<string>();

  for (const value of values) {
    const base =
      `${prefix}${
      displayLocation(value).replace(
        /[^A-Za-z0-9_]/g,
        '_')
    }`;

    let id = base;

    for (
      let suffix = 2;
      used.has(id);
      suffix++
    ) {
      id = `${base}_${suffix}`;
    }

    used.add(id);

    ids.set(
      value,
      id);
  }

  return ids;
}

function escapeText(
    value: string
  ): string
{
  return value.replaceAll(
    '"',
    '#quot;');
}
