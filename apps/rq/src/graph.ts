import { readdir,
         readFile,
         stat }
  from 'node:fs/promises';
import path
  from 'node:path';
import { parseDocument,
         RqDocument }
  from './document.js';

/**
 * A requirement or an evidence document.
 */
export interface RqNode extends RqDocument
{
  /**
   * Absolute path of the document.
   */
  path: string;

  /**
   * Absolute paths of the nodes this one is implemented by; empty for
   * evidence.
   */
  children: string[];
}

/**
 * The requirements graph reachable from a root.
 */
export interface RqGraph
{
  /**
   * Absolute path of the folder the graph was loaded for; the root's folder
   * when it was loaded for a file.
   */
  folder: string;

  root: string;

  /**
   * The nodes in breadth-first order from the root.
   */
  nodes: Map<string, RqNode>;

  /**
   * Structure problems: broken links, cycles, a missing or ambiguous root,
   * and documents of the folder the root does not reach.
   */
  errors: string[];
}

/**
 * Loads the graph for a requirement file, which is its root, or for a folder,
 * whose root is the one markdown document no other document of the folder
 * links to.
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

    return await walk(
      path.dirname(root),
      root,
      [ ]);
  }

  const folder =
    path.resolve(target);

  const files =
    await findMarkdownFiles(folder);

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
      file => !linked.has(file));

  if (roots.length !== 1) {
    return { folder,
             root: '',
             nodes: new Map(),
             errors:
               [ roots.length === 0
          ? `${folder}: no document is the root; every document is linked from another.`
          : `${folder}: several documents are not linked from any other, so the root is ambiguous: ${
            roots
              .map(
                file =>
                  path.relative(
                    folder,
                    file))
              .join(', ')
          }.` ] };
  }

  const graph =
    await walk(
      folder,
      roots[0],
      [ ]);

  for (const file of files) {
    if (!graph.nodes.has(file)) {
      graph.errors.push(
        `${
          display(
            graph,
            file)
        }: not reachable from the root.`);
    }
  }

  return graph;
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
    root: string,
    errors: string[]
  ): Promise<RqGraph>
{
  const graph: RqGraph =
    { folder,
      root,
      nodes: new Map(),
      errors };

  const queue =
    [ root ];

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
      if (await isFile(child)) {
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
          } points at no file.`);
      }
    }

    node.children = existing;
  }

  findCycles(graph);

  return graph;
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

  return { ...document,
           path: file,
           children:
             document.kind === 'evidence'
      ? [ ]
      : document.links.map(
        link =>
          path.resolve(
            path.dirname(file),
            link)) };
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

  visit(graph.root);
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
