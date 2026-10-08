import { stat }
  from 'node:fs/promises';
import path
  from 'node:path';
import { LogEntry }
  from './document.js';
import { loadGraph,
         readNode,
         RqNode }
  from './graph.js';
import { Io }
  from './io.js';
import { findBacklinks,
         loadScope }
  from './scope.js';

/**
 * A node as the query commands print it. `path` is relative to the working
 * directory, with `/` separators.
 */
export interface NodeSummary
{
  path: string;
  kind: 'requirement' | 'evidence' | 'missing';
  title: string | null;

  /**
   * The status of the last log entry of an evidence; `null` for an evidence
   * never run and for a requirement.
   */
  status: LogEntry['status'] | null;
}

export interface QueryOptions
{
  json?: boolean;
}

/**
 * Prints every node of the graph of a requirement file or folder, in
 * breadth-first order from the root. Structure errors go to standard error.
 */
export async function execList(
    io: Io,
    options: QueryOptions & { target: string; }
  ): Promise<number>
{
  const graph =
    await loadGraph(
      path.resolve(
        io.cwd,
        options.target));

  for (const error of graph.errors) {
    io.stderr.write(
      `Error  ${error}\n`);
  }

  print(
    io,
    [ ...graph.nodes.values() ].map(
      node =>
        summarize(
          io,
          node)),
    options);

  return 0;
}

/**
 * Prints the requirements and evidence a requirement links to.
 */
export async function execLinks(
    io: Io,
    options: QueryOptions & { file: string; }
  ): Promise<number>
{
  const node =
    await readExisting(
      io,
      options.file);

  const children: NodeSummary[] = [ ];

  for (const child of node.children) {
    children.push(
      await isFile(child)
        ? summarize(
          io,
          await readNode(child))
        : { path:
              display(
                io,
                child),
            kind: 'missing',
            title: null,
            status: null });
  }

  print(
    io,
    children,
    options);

  return 0;
}

/**
 * Prints the requirements that link to a requirement or an evidence, looked
 * for in the `in` folder, the working directory by default.
 */
export async function execBacklinks(
    io: Io,
    options: QueryOptions & { file: string; in?: string; }
  ): Promise<number>
{
  const node =
    await readExisting(
      io,
      options.file);

  const scope =
    await loadScope(
      path.resolve(
        io.cwd,
        options.in ?? '.'));

  print(
    io,
    findBacklinks(
      scope,
      node.path)
      .map(
        file =>
          summarize(
            io,
            scope.get(file)!)),
    options);

  return 0;
}

/**
 * Prints the graph as JSON: the root, the structure errors, and every node
 * with its structural fields.
 */
export async function execToJson(
    io: Io,
    options: { target: string; }
  ): Promise<number>
{
  const graph =
    await loadGraph(
      path.resolve(
        io.cwd,
        options.target));

  io.stdout.write(
    `${
      JSON.stringify(
        { root:
            graph.root === ''
            ? null
            : display(
              io,
              graph.root),
          errors: graph.errors,
          nodes:
            [ ...graph.nodes.values() ].map(
              node => ({ path:
                           display(
                             io,
                             node.path),
                         kind: node.kind,
                         title: node.title,
                         body: node.body,
                         links:
                           node.children.map(
                             child =>
                  display(
                    io,
                    child)),
                         steps: node.steps,
                         log: node.log })) },
        null,
        2)
    }\n`);

  return 0;
}

/**
 * Reads a document given relative to the working directory; an error when it
 * is not a file.
 */
export async function readExisting(
    io: Io,
    file: string
  ): Promise<RqNode>
{
  const filePath =
    path.resolve(
      io.cwd,
      file);

  if (!await isFile(filePath)) {
    throw new Error(
      `${file}: no such file.`);
  }

  return await readNode(filePath);
}

/**
 * A path relative to the working directory, with `/` separators.
 */
export function display(
    io: Io,
    file: string
  ): string
{
  return path.relative(
    io.cwd,
    file)
    .split(path.sep)
    .join('/');
}

export async function isFile(
    file: string
  ): Promise<boolean>
{
  return (await stat(file).catch(() => null))?.isFile() === true;
}

function summarize(
    io: Io,
    node: RqNode
  ): NodeSummary
{
  return { path:
             display(
               io,
               node.path),
           kind: node.kind,
           title: node.title,
           status:
             node.kind === 'evidence'
      ? node.log.at(-1)?.status ?? null
      : null };
}

function print(
    io: Io,
    nodes: NodeSummary[],
    options: QueryOptions
  ): void
{
  if (options.json) {
    io.stdout.write(
      `${
        JSON.stringify(
          nodes,
          null,
          2)
      }\n`);

    return;
  }

  for (const node of nodes) {
    io.stdout.write(
      `${node.kind.padEnd(11)}  ${node.path}${
        node.kind === 'evidence'
          ? `  ${node.status ?? 'Not run'}`
          : ''
      }\n`);
  }
}
