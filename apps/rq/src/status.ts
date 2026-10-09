import { writeMarkdown }
  from 'asljs-mdcli';
import { readFile }
  from 'node:fs/promises';
import path
  from 'node:path';
import { parseDocument }
  from './document.js';
import { relativeUrl }
  from './edit.js';
import { loadGraph,
         RqGraph }
  from './graph.js';
import { Status,
         TestResult }
  from './results.js';
import { writeStatus }
  from './status-section.js';

export interface NodeStatus
{
  status: Status;

  /**
   * Why a requirement does not pass; empty when it does, and for a test.
   */
  message: string;
}

export interface StatusOptions
{
  /**
   * The results of the tests that ran now, by path; they replace the
   * results their documents record.
   */
  run?: ReadonlyMap<string, TestResult>;

  /**
   * The requirements whose status is recalculated from what they link to;
   * every other requirement keeps the result its document records, and is
   * recalculated only when it records none. `all` recalculates every one.
   */
  recalculate?: ReadonlySet<string> | 'all';
}

/**
 * The status of every node of the graph, from the documents: a test has the
 * result it ran with now, or the `Result` of its `## Status`, or `NOT RUN`; a
 * requirement that is recalculated, or records no result, passes when every
 * node it links to passes, fails when one fails or it links to nothing, and
 * is `NOT RUN` otherwise; any other requirement has its recorded `Result`.
 */
export function getStatuses(
    graph: RqGraph,
    options: StatusOptions = {}
  ): Map<string, NodeStatus>
{
  const statuses = new Map<string, NodeStatus | 'open'>();

  const visit =
    (
        file: string
      ): NodeStatus =>
    {
    const known =
      statuses.get(file);

    if (known === 'open') {
      return { status: 'FAIL',
               message: 'in a cycle' };
    }

    if (known) {
      return known;
    }

    statuses.set(
      file,
      'open');

    const node =
      graph.nodes.get(file)!;

    const recorded = node.status.result;

    let status: NodeStatus;

    if (node.kind === 'test') {
      status =
        { status:
            options.run?.get(file)?.status
          ?? recorded?.status
          ?? 'NOT RUN',
          message: '' };
    } else if (
      recorded !== null
      && options.recalculate !== 'all'
      && !options.recalculate?.has(file)
    ) {
      status =
        { status: recorded.status,
          message: recorded.note };
    } else if (node.children.length === 0) {
      status =
        { status: 'FAIL',
          message:
            'links to no requirement or test' };
    } else {
      const children =
        node.children.map(visit);

      const failed =
        children.filter(
          child => child.status === 'FAIL')
        .length;

      const notRun =
        children.filter(
          child => child.status === 'NOT RUN')
        .length;

      status =
        failed > 0
        ? { status: 'FAIL',
            message:
              `${failed} of ${children.length} links failed` }
        : notRun > 0
        ? { status: 'NOT RUN',
            message:
              `${notRun} of ${children.length} links not run` }
        : { status: 'PASS',
            message: '' };
    }

    statuses.set(
      file,
      status);

    return status;
  };

  for (const file of graph.nodes.keys()) {
    visit(file);
  }

  return statuses as Map<string, NodeStatus>;
}

/**
 * The files and every requirement of the graph above them.
 */
export function withAncestors(
    graph: RqGraph,
    files: Iterable<string>
  ): Set<string>
{
  const parents = new Map<string, string[]>();

  for (const [file, node] of graph.nodes) {
    for (const child of node.children) {
      parents.set(
        child,
        [ ...parents.get(child) ?? [ ],
          file ]);
    }
  }

  const found =
    new Set(files);

  const queue =
    [ ...found ];

  while (queue.length > 0) {
    for (const parent of parents.get(queue.shift()!) ?? [ ]) {
      if (!found.has(parent)) {
        found.add(parent);
        queue.push(parent);
      }
    }
  }

  return found;
}

export interface WriteStatusesOptions
{
  /**
   * The tests that ran now, each with the execution file that records it.
   */
  results?: readonly (TestResult & { execution: string; })[];

  /**
   * The documents whose status may have changed; they and every requirement
   * above them are recalculated. `all` recalculates every requirement.
   */
  changed?: readonly string[] | 'all';

  /**
   * Leave alone every document that records no result yet.
   */
  existingOnly?: boolean;
}

/**
 * Recalculates the status of the changed documents of the working folder,
 * and of `graph`, and of every requirement above them, and writes it to
 * their `## Status` sections: `- Result:` for both, and for a test that ran
 * `- Execution:`, a link to its execution file. Every other requirement keeps
 * its recorded result, and `- Coverage:` is kept. A document never run and
 * without a section is left alone, and with `existingOnly` every document
 * without a result. Returns the files it changed.
 */
export async function writeStatuses(
    folder: string,
    graph: RqGraph,
    options: WriteStatusesOptions = {}
  ): Promise<string[]>
{
  const nodes =
    new Map(
      [ ...(await loadGraph(folder)).nodes,
        ...graph.nodes ]);

  const merged: RqGraph =
    { ...graph,
      nodes };

  const run =
    new Map(
      (options.results ?? [ ])
      .map(
        result => [ result.file,
                    result ]));

  const recalculate =
    options.changed === 'all'
    ? 'all'
    : withAncestors(
      merged,
      [ ...options.changed ?? [ ],
        ...run.keys() ]);

  const statuses =
    getStatuses(
      merged,
      { run,
        recalculate });

  const changed: string[] = [ ];

  for (const [file, node] of nodes) {
    if (
      node.kind === null
      || recalculate !== 'all'
         && !recalculate.has(file)
    ) {
      continue;
    }

    const { status, message } = statuses.get(file)!;

    const result =
      run.get(file);

    const text =
      await readFile(
        file,
        'utf8');

    const current =
      parseDocument(text).status;

    if (
      (status === 'NOT RUN'
       || options.existingOnly)
       && current.result === null
    ) {
      continue;
    }

    const updated =
      writeStatus(
        text,
        { result:
            { status,
              note:
                result?.note
            ?? (node.kind === 'test'
              ? current.result?.note ?? ''
              : message) },
          coverage: current.coverage,
          execution:
            result === undefined
          ? current.execution
          : { title:
                path.basename(
                  result.execution,
                  '.md'),
              url:
                relativeUrl(
                  file,
                  result.execution) } });

    if (updated !== text) {
      await writeMarkdown(
        file,
        updated);

      changed.push(file);
    }
  }

  return changed;
}
