import path
  from 'node:path';
import { RqGraph }
  from './graph.js';

/**
 * The graph as Mermaid text: requirements as boxes, evidence as rounded
 * boxes coloured by the status of its last log entry, and an edge from each
 * requirement to what implements it. `href` gives the link a node opens, or
 * `null` for none.
 */
export function toMermaid(
    graph: RqGraph,
    href: (file: string) => string | null
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
    [ 'graph TD' ];

  for (const [file, node] of graph.nodes) {
    const label =
      escape(
        node.title
        ?? path.basename(
          file,
          '.md'));

    lines.push(
      node.kind === 'evidence'
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

    const status =
      node.log.at(-1)?.status;

    if (
      node.kind === 'evidence'
      && status
    ) {
      lines.push(
        `  class ${ids.get(file)} ${status.toLowerCase()}`);
    }
  }

  lines.push(
    '  classDef passed fill:#d7f5d7,stroke:#2e7d32',
    '  classDef failed fill:#f8d7d7,stroke:#c62828');

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
