import { readFile }
  from 'node:fs/promises';
import { AgentSpec,
         askAgent,
         getAgentCommand,
         verdictInstructions }
  from './agent.js';
import { writeCoverageSection }
  from './coverage-section.js';
import { parseDocument }
  from './document.js';
import { RqGraph,
         RqNode }
  from './graph.js';
import { Io }
  from './io.js';
import { writeMarkdown }
  from './post-process.js';
import { display }
  from './query.js';
import { writeStatus }
  from './status-section.js';
import { selectTargets }
  from './targets.js';

export interface CoverageVerdict
{
  covered: boolean;
  message: string;

  /**
   * Markdown: why the requirement is fully covered, or what is missing and
   * what to add or change to cover it.
   */
  analysis: string;
}

/**
 * The analysis of a requirement that links to nothing, which `rq coverage`
 * writes without asking an agent.
 */
const NO_LINKS_ANALYSIS =
  'The requirement links to no requirement or test, so nothing covers its statements. Decompose it into sub-requirements with `rq add requirement`, or check it with tests added with `rq add test`, so that every statement is covered by at least one of them.';

export interface CoverageOptions
{
  /**
   * Requirement files, folders, `.md` names or ids, in the working folder.
   */
  targets: string[];

  /**
   * Also check every requirement below a requirement target; a folder target
   * always checks all its requirements.
   */
  recurse?: boolean;

  /**
   * The agent and model; the detected agent when absent.
   */
  ai?: AgentSpec;
}

/**
 * Asks an AI agent, for each requirement the targets select, whether the
 * requirements and tests it links to fully cover its statements, writes the
 * verdict to the `- Coverage:` item of its `## Status` section, and the
 * agent's analysis to its `## Coverage` section. A
 * requirement that links to nothing is incomplete without asking. Returns
 * the exit code: 0 when every checked requirement is complete and the graph
 * has no structure errors.
 */
export async function execCoverage(
    io: Io,
    options: CoverageOptions
  ): Promise<number>
{
  const command =
    await getAgentCommand(
      io,
      options.ai ?? {},
      'read');

  if (command === null) {
    throw new Error(
      'No AI agent found; install claude or copilot, or set RQ_AI_COMMAND.');
  }

  const { graph, selected } =
    await selectTargets(
      io.cwd,
      options.targets,
      { recurse: options.recurse });

  let failed = graph.errors.length > 0;

  for (const file of selected) {
    const node =
      graph.nodes.get(file)!;

    if (node.kind !== 'requirement') {
      continue;
    }

    const verdict =
      node.children.length === 0
      ? { covered: false,
          message:
            'links to no requirement or test',
          analysis: NO_LINKS_ANALYSIS }
      : await checkCoverage(
        graph,
        node,
        command);

    const coverage =
      { status:
          verdict.covered
        ? 'COMPLETE' as const
        : 'INCOMPLETE' as const,
        note: verdict.message };

    const text =
      await readFile(
        file,
        'utf8');

    const updated =
      writeCoverageSection(
        writeStatus(
          text,
          { ...parseDocument(text).status,
            coverage }),
        verdict.analysis
        || verdict.message
        || (verdict.covered
          ? 'The agent found every statement covered, and gave no reasons.'
          : 'The agent found the requirement not fully covered, and gave no reasons.'));

    if (updated !== text) {
      await writeMarkdown(
        file,
        updated);
    }

    failed ||= !verdict.covered;

    io.stdout.write(
      `${coverage.status.padEnd(10)}  ${
        display(
          io,
          file)
      }${
        coverage.note === ''
          ? ''
          : ` - ${coverage.note}`
      }\n`);
  }

  for (const error of graph.errors) {
    io.stdout.write(
      `Error       ${error}\n`);
  }

  return failed
    ? 1
    : 0;
}

/**
 * Asks an AI agent whether the children of a requirement fully cover its
 * statements. The command runs in the graph folder with the prompt on
 * standard input; the verdict is the last line of its output that is a JSON
 * object with `result` `OK` or `Fail`.
 */
export async function checkCoverage(
    graph: RqGraph,
    node: RqNode,
    command: string
  ): Promise<CoverageVerdict>
{
  const verdict =
    await askAgent(
      command,
      graph.folder,
      buildPrompt(
        graph,
        node));

  return { covered: verdict.ok,
           message: verdict.message,
           analysis: verdict.answer };
}

function buildPrompt(
    graph: RqGraph,
    node: RqNode
  ): string
{
  const lines =
    [ 'Check whether a requirement is fully covered by the requirements and',
      'tests it links to: whether its sub-requirements and its own tests,',
      'together, provide sufficient functional coverage. Every statement of',
      'the requirement must be implemented by at least one of them. Do not',
      'modify any file.',
      '',
      `Requirement: ${node.path}`,
      '',
      'Linked requirements and tests:',
      '',
      ...node.children.map(
        child => `- ${child} (${graph.nodes.get(child)?.kind ?? 'requirement'})`),
      '',
      'Read the files and decide. First write your analysis, in markdown',
      'without headings, for the people who maintain the requirement:',
      '',
      '- when it is fully covered, for each statement, the requirement or test',
      '  that covers it;',
      '- when it is not, each statement nothing covers, and what to do to cover',
      '  it: a test to add and what it should check, a sub-requirement to add',
      '  and its statement, or a change to the requirement or to what it links',
      '  to.',
      '',
      'Then end with the verdict.',
      ...verdictInstructions(
        'a short summary of what nothing covers') ];

  return `${lines.join('\n')}\n`;
}
