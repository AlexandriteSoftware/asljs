import { readdir,
         readFile,
         stat }
  from 'node:fs/promises';
import path
  from 'node:path';
import { parseDocument,
         RqDocument }
  from './document.js';

export type NodeKind = 'requirement' | 'test';

/**
 * A markdown document: a requirement, a test, or, in a scope, any other
 * document.
 */
export interface RqNode extends RqDocument
{
  /**
   * Absolute path of the document.
   */
  path: string;

  /**
   * From the file name: `R<n>` for a requirement, `T<n>` for a test;
   * `null` for any other document.
   */
  kind: NodeKind | null;

  /**
   * Absolute paths of the documents the `## Implementation` list of a
   * requirement links to; empty for any other document.
   */
  children: string[];
}

const NODE_FILE_NAME =
  /^((R|T)\d+)(?:\s.*)?\.md$/;

/**
 * The id a file name starts with, e.g. `T12` for `T12 PDF export.md`; `null`
 * for a document that is not a requirement or test.
 */
export function getNodeId(
    file: string
  ): string | null
{
  return NODE_FILE_NAME.exec(
    path.basename(file))
    ?.[1]
    ?? null;
}

/**
 * The kind of document a file name says: `R<n> <name>.md` is a requirement,
 * `T<n> <name>.md` a test; `null` for any other name.
 */
export function getNodeKind(
    file: string
  ): NodeKind | null
{
  const match =
    NODE_FILE_NAME.exec(
      path.basename(file));

  if (!match) {
    return null;
  }

  return match[2] === 'R'
    ? 'requirement'
    : 'test';
}

/**
 * The requirements graph reachable from its roots.
 */
export interface RqGraph
{
  /**
   * Absolute path of the folder the graph was loaded for; the root's folder
   * when it was loaded for a file.
   */
  folder: string;

  /**
   * Absolute paths of the roots, sorted; empty when a folder has none.
   */
  roots: string[];

  /**
   * The nodes in breadth-first order from the roots.
   */
  nodes: Map<string, RqNode>;

  /**
   * Structure problems: broken links, cycles, requirements with several
   * parents, a folder without a root, and documents of the folder no root
   * reaches.
   */
  errors: string[];
}

/**
 * Loads the graph for a requirement or test file, which is its only root,
 * or for a folder, whose roots are the requirements of the folder no other
 * requirement links to. Documents that are neither are ignored.
 */
export async function loadGraph(
    target: string
  ): Promise<RqGraph>
{
  const info =
    await stat(target)
    .catch(
      () => null);

  if (!info) {
    throw new Error(
      `${target}: no such file or folder.`);
  }

  if (info.isFile()) {
    const root =
      path.resolve(target);

    if (
      getNodeKind(root)
      === null
    ) {
      throw new Error(
        `${target}: not a requirement or test; the file name must start with R<n> or T<n>.`);
    }

    return await walk(
      path.dirname(root),
      [ root ],
      [ ]);
  }

  const folder =
    path.resolve(target);

  const files =
    (await findMarkdownFiles(folder))
    .filter(
      file => getNodeKind(file) !== null);

  const documents = new Map<string, RqNode>();

  for (const file of files) {
    documents.set(
      file,
      await readNode(file));
  }

  const linked =
    new Set(
      [ ...documents.values() ]
      .flatMap(
        node => node.children));

  const roots =
    files.filter(
      file =>
      !linked.has(file)
      && getNodeKind(file) === 'requirement');

  const errors =
    findDuplicateIds(
      folder,
      files);

  if (
    roots.length === 0
    && files.length > 0
  ) {
    // Walk from every requirement so that the cycles still show.
    const graph =
      await walk(
        folder,
        files.filter(
          file => getNodeKind(file) === 'requirement'),
        [ 'no requirement is a root; every requirement is linked from another.',
          ...errors ]);

    graph.roots = [ ];

    return graph;
  }

  const graph =
    await walk(
      folder,
      roots,
      errors);

  for (const file of files) {
    if (!graph.nodes.has(file)) {
      graph.errors.push(
        `${
          display(
            graph,
            file)
        }: not reachable from any root; link it from a requirement with rq link.`);
    }
  }

  return graph;
}

/**
 * An error for each id that more than one document of a folder has: ids
 * name documents in commands and execution files, so they must be unique.
 */
function findDuplicateIds(
    folder: string,
    files: readonly string[]
  ): string[]
{
  const byId = new Map<string, string[]>();

  for (const file of files) {
    const id = getNodeId(file)!;

    byId.set(
      id,
      [ ...byId.get(id) ?? [ ],
        file ]);
  }

  return [ ...byId ]
    .filter(
      (
        [, same]
      ) => same.length > 1)
    .map(
      (
        [id, same]
      ) =>
        `${id}: several documents have this id: ${
          same
            .map(
              file =>
                path.relative(
                  folder,
                  file)
                  .split(path.sep)
                  .join('/'))
            .join(', ')
        }; ids must be unique.`);
}

/**
 * Path of a node relative to the graph folder, with `/` separators.
 */
export function display(
    graph: RqGraph,
    filePath: string
  ): string
{
  return path.relative(
    graph.folder,
    filePath)
    .split(path.sep)
    .join('/');
}

async function walk(
    folder: string,
    roots: string[],
    errors: string[]
  ): Promise<RqGraph>
{
  const graph: RqGraph =
    { folder,
      roots,
      nodes: new Map(),
      errors };

  const queue =
    [ ...roots ];

  while (queue.length > 0) {
    const file = queue.shift()!;

    if (graph.nodes.has(file)) {
      continue;
    }

    const node =
      await readNode(file);

    graph.nodes.set(
      file,
      node);

    const existing: string[] = [ ];

    for (const child of node.children) {
      const problem =
        !await isFile(child)
        ? 'points at no file'
        : getNodeKind(child) === null
        ? 'is not a requirement or test'
        : null;

      if (problem === null) {
        existing.push(child);
        queue.push(child);
      } else {
        errors.push(
          `${
            display(
              graph,
              file)
          }: the link to ${
            display(
              graph,
              child)
          } ${problem}.`);
      }
    }

    node.children = existing;
  }

  findCycles(graph);
  findSharedRequirements(graph);

  return graph;
}

/**
 * Reports every requirement linked from more than one requirement: a
 * requirement has a single parent, a test may have several.
 */
function findSharedRequirements(
    graph: RqGraph
  ): void
{
  const parents = new Map<string, string[]>();

  for (const node of graph.nodes.values()) {
    for (const child of node.children) {
      if (
        getNodeKind(child)
        === 'requirement'
      ) {
        parents.set(
          child,
          [ ...parents.get(child) ?? [ ],
            node.path ]);
      }
    }
  }

  for (const [child, from] of parents) {
    if (from.length > 1) {
      graph.errors.push(
        `${
          display(
            graph,
            child)
        }: linked from ${from.length} requirements, ${
          from.map(
            file =>
              display(
                graph,
                file))
            .join(', ')
        }; a requirement has one parent.`);
    }
  }
}

/**
 * Reads a document as a node; its children are resolved but not checked.
 */
export async function readNode(
    file: string
  ): Promise<RqNode>
{
  const document =
    parseDocument(
      await readFile(
        file,
        'utf8'));

  const kind =
    getNodeKind(file);

  return { ...document,
           path: file,
           kind,
           children:
             kind === 'requirement'
      ? document.implementation.map(
        link =>
          path.resolve(
            path.dirname(file),
            link))
      : [ ] };
}

function findCycles(
    graph: RqGraph
  ): void
{
  const state = new Map<string, 'open' | 'done'>();

  const trail: string[] = [ ];

  const visit =
    (
        file: string
      ): void =>
    {
    state.set(
      file,
      'open');

    trail.push(file);

    for (const child of graph.nodes.get(file)?.children ?? [ ]) {
      if (
        state.get(child)
        === 'open'
      ) {
        const cycle =
          [ ...trail.slice(
            trail.indexOf(child)),
            child ];

        graph.errors.push(
          `cycle: ${
            cycle
              .map(
                item =>
                  display(
                    graph,
                    item))
              .join(' -> ')
          }.`);
      } else if (!state.has(child)) {
        visit(child);
      }
    }

    trail.pop();

    state.set(
      file,
      'done');
  };

  for (const root of graph.roots) {
    if (!state.has(root)) {
      visit(root);
    }
  }
}

async function isFile(
    file: string
  ): Promise<boolean>
{
  return (await stat(file).catch(() => null))?.isFile() === true;
}

/**
 * The `.md` files of a folder and its subfolders, sorted, skipping folders
 * whose name starts with `.` and `node_modules`.
 */
export async function findMarkdownFiles(
    folder: string
  ): Promise<string[]>
{
  const files: string[] = [ ];

  for (
    const entry of await readdir(
      folder,
      { withFileTypes: true })
  ) {
    const entryPath =
      path.join(
        folder,
        entry.name);

    if (entry.isDirectory()) {
      if (
        !entry.name.startsWith('.')
        && entry.name !== 'node_modules'
      ) {
        files.push(
          ...await findMarkdownFiles(entryPath));
      }
    } else if (entry.name.toLowerCase().endsWith('.md')) {
      files.push(entryPath);
    }
  }

  return files.sort();
}
