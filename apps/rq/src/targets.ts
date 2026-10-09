import { stat }
  from 'node:fs/promises';
import { loadGraph,
         RqGraph }
  from './graph.js';
import { resolveTarget }
  from './scope.js';

export interface Selection
{
  /**
   * The graphs of every target, merged; `folder` is the working folder.
   */
  graph: RqGraph;

  /**
   * The selected nodes, in the order of the targets and of each graph.
   */
  selected: string[];
}

/**
 * The nodes the targets of `rq test` and `rq coverage` select: a folder
 * selects its whole graph, and a requirement or test itself, with `recurse`
 * everything below it, and with `directTests` also the tests it links to.
 */
export async function selectTargets(
    folder: string,
    targets: readonly string[],
    options: { recurse?: boolean; directTests?: boolean; }
  ): Promise<Selection>
{
  if (targets.length === 0) {
    throw new Error(
      'No target: give requirement or test files, folders, .md names or ids.');
  }

  const graph: RqGraph =
    { folder,
      roots: [ ],
      nodes: new Map(),
      errors: [ ] };

  const selected: string[] = [ ];

  const select =
    (
        file: string
      ): void =>
    {
    if (!selected.includes(file)) {
      selected.push(file);
    }
  };

  for (const target of targets) {
    const file =
      await resolveTarget(
        folder,
        target);

    const part =
      await loadGraph(file);

    for (const [key, node] of part.nodes) {
      if (!graph.nodes.has(key)) {
        graph.nodes.set(
          key,
          node);
      }
    }

    for (const error of part.errors) {
      if (!graph.errors.includes(error)) {
        graph.errors.push(error);
      }
    }

    if (
      options.recurse
      || (await stat(file)).isDirectory()
    ) {
      [ ...part.nodes.keys() ].forEach(select);
    } else {
      select(file);

      if (options.directTests) {
        part.nodes.get(file)!.children
          .filter(
            child => part.nodes.get(child)?.kind === 'test')
          .forEach(select);
      }
    }
  }

  return { graph,
           selected };
}
