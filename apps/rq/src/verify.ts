import path
  from 'node:path';
import { AiAgent,
         checkCoverage,
         getAgentCommand }
  from './coverage.js';
import { runEvidence }
  from './evidence.js';
import { display,
         loadGraph,
         RqGraph }
  from './graph.js';
import { Io }
  from './io.js';

export interface VerifyOptions
{
  /**
   * The requirement file or folder to verify, relative to the working
   * directory.
   */
  target: string;

  /**
   * The agent that checks coverage; no AI check when absent.
   */
  ai?: AiAgent;
}

interface NodeResult
{
  ok: boolean;
  message: string;
}

/**
 * Verifies a requirement and everything it is implemented by: the graph
 * structure, the evidence steps, which are run and logged, and, with an AI
 * agent, that every requirement is fully covered. Returns the exit code.
 */
export async function execVerify(
    io: Io,
    options: VerifyOptions
  ): Promise<number>
{
  const graph =
    await loadGraph(
      path.resolve(
        io.cwd,
        options.target));

  const command =
    options.ai
    ? getAgentCommand(
      options.ai,
      io.env.RQ_AI_COMMAND)
    : null;

  const results = new Map<string, NodeResult | 'open'>();

  const verify =
    async (
        file: string
      ): Promise<NodeResult> =>
    {
    const known =
      results.get(file);

    if (known === 'open') {
      return { ok: false,
               message: 'in a cycle' };
    }

    if (known) {
      return known;
    }

    results.set(
      file,
      'open');

    const result =
      await verifyNode(
        io,
        graph,
        file,
        command,
        verify);

    results.set(
      file,
      result);

    return result;
  };

  if (graph.root !== '') {
    await verify(graph.root);
  }

  let failed = graph.errors.length > 0;

  for (const file of graph.nodes.keys()) {
    const result =
      results.get(file) as NodeResult;

    failed ||= !result.ok;

    io.stdout.write(
      `${
        result.ok
          ? 'OK  '
          : 'Fail'
      }  ${
        display(
          graph,
          file)
      }${
        result.message === ''
          ? ''
          : ` - ${result.message}`
      }\n`);
  }

  for (const error of graph.errors) {
    io.stdout.write(
      `Error  ${error}\n`);
  }

  return failed
    ? 1
    : 0;
}

async function verifyNode(
    io: Io,
    graph: RqGraph,
    file: string,
    command: string | null,
    verify: (file: string) => Promise<NodeResult>
  ): Promise<NodeResult>
{
  const node =
    graph.nodes.get(file)!;

  if (node.kind === 'evidence') {
    const entry =
      await runEvidence(
        node,
        io.now ?? (() => new Date()));

    return { ok: entry.status === 'Passed',
             message: entry.note };
  }

  if (node.children.length === 0) {
    return { ok: false,
             message:
               'links to no requirement or evidence' };
  }

  let failedChildren = 0;

  for (const child of node.children) {
    if (!(await verify(child)).ok) {
      failedChildren += 1;
    }
  }

  const messages: string[] = [ ];

  if (failedChildren > 0) {
    messages.push(
      `${failedChildren} of ${node.children.length} links failed`);
  }

  if (command !== null) {
    const verdict =
      await checkCoverage(
        graph,
        node,
        command);

    if (!verdict.covered) {
      messages.push(verdict.message);
    }
  }

  return { ok: messages.length === 0,
           message:
             messages.join('; ') };
}
