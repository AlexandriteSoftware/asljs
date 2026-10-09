import { stat }
  from 'node:fs/promises';
import path
  from 'node:path';
import { getNodeKind,
         loadGraph,
         readNode,
         RqNode }
  from './graph.js';
import { Io }
  from './io.js';
import { Status }
  from './results.js';
import { findBacklinks,
         loadScope,
         resolveTarget }
  from './scope.js';
import { type CoverageStatus }
  from './status-section.js';
import { getStatuses }
  from './status.js';

/**
 * A node as the query commands print it. `path` is relative to the working
 * directory, with `/` separators.
 */
export interface NodeSummary
{
  path: string;
  kind: 'requirement' | 'test' | 'other' | 'missing';
  title: string | null;

  /**
   * The status its document records, or for a requirement that records
   * none the one that follows from its links; `null` for a
   * document that is not a requirement or test.
   */
  status: Status | null;

  /**
   * The `rq coverage` verdict of a requirement; `null` for one never checked
   * and for any other document.
   */
  coverage: CoverageStatus | null;
}

export interface QueryOptions
{
  json?: boolean;
}

/**
 * Prints every node of the graph of a requirement file or folder, in
 * breadth-first order from the roots. Structure errors go to standard error.
 */
export async function execList(
    io: Io,
    options: QueryOptions & { target: string; }
  ): Promise<number>
{
  const graph =
    await loadGraph(
      await resolveTarget(
        io.cwd,
        options.target));

  for (const error of graph.errors) {
    io.stderr.write(
      `Error  ${error}\n`);
  }

  const statuses =
    getStatuses(graph);

  print(
    io,
    [ ...graph.nodes.values() ].map(
      node =>
        summarize(
          io,
          node,
          statuses.get(node.path)!.status)),
    options);

  return 0;
}

/**
 * Prints the requirements and tests a requirement links to.
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
          await readNode(child),
          await getStatus(child))
        : { path:
              display(
                io,
                child),
            kind: 'missing',
            title: null,
            status: null,
            coverage: null });
  }

  print(
    io,
    children,
    options);

  return 0;
}

/**
 * Prints the requirements that link to a requirement or a test, looked
 * for in the working folder.
 */
export async function execBacklinks(
    io: Io,
    options: QueryOptions & { file: string; }
  ): Promise<number>
{
  const node =
    await readExisting(
      io,
      options.file);

  const scope =
    await loadScope(io.cwd);

  const backlinks: NodeSummary[] = [ ];

  for (
    const file of findBacklinks(
      scope,
      node.path)
  ) {
    backlinks.push(
      summarize(
        io,
        scope.get(file)!,
        await getStatus(file)));
  }

  print(
    io,
    backlinks,
    options);

  return 0;
}

/**
 * Prints the graph as JSON: the roots, the structure errors, and every node
 * with its structural fields and its status.
 */
export async function execToJson(
    io: Io,
    options: { target: string; }
  ): Promise<number>
{
  const graph =
    await loadGraph(
      await resolveTarget(
        io.cwd,
        options.target));

  const statuses =
    getStatuses(graph);

  io.stdout.write(
    `${
      JSON.stringify(
        { roots:
            graph.roots.map(
              root =>
              display(
                io,
                root)),
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
                         status:
                           statuses.get(node.path)!.status,
                         coverage:
                           node.status.coverage?.status
                ?? null })) },
        null,
        2)
    }\n`);

  return 0;
}

/**
 * Reads a requirement or test, a path, `.md` name or id in the working
 * folder (`resolveTarget`); an error when it is not a file or not named as
 * one.
 */
export async function readExisting(
    io: Io,
    file: string
  ): Promise<RqNode>
{
  const filePath =
    await resolveTarget(
      io.cwd,
      file);

  if (!await isFile(filePath)) {
    throw new Error(
      `${file}: no such file.`);
  }

  if (
    getNodeKind(filePath)
    === null
  ) {
    throw new Error(
      `${file}: not a requirement or test; the file name must start with R<n> or T<n>.`);
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

/**
 * The status of a requirement or test from the graph below it; `null` for
 * any other document.
 */
async function getStatus(
    file: string
  ): Promise<Status | null>
{
  return getNodeKind(file) === null
    ? null
    : getStatuses(
      await loadGraph(file))
      .get(file)!.status;
}

function summarize(
    io: Io,
    node: RqNode,
    status: Status | null
  ): NodeSummary
{
  return { path:
             display(
               io,
               node.path),
           kind:
             node.kind
      ?? 'other',
           title: node.title,
           status:
             node.kind === null
      ? null
      : status,
           coverage:
             node.kind === 'requirement'
      ? node.status.coverage?.status ?? null
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
        node.status === null
          ? ''
          : `  ${node.status}`
      }${
        node.coverage === null
          ? ''
          : `  ${node.coverage}`
      }\n`);
  }
}
