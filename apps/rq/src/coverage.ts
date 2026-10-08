import { RqGraph,
         RqNode }
  from './graph.js';
import { runCommand }
  from './run-command.js';

export type AiAgent = 'claude' | 'copilot';

export const AI_AGENTS: readonly AiAgent[] =
  Object.freeze(
    [ 'claude',
      'copilot' ]);

/**
 * Commands that read the prompt from standard input and may read, but not
 * change, the files.
 */
const AGENT_COMMANDS: Readonly<Record<AiAgent, string>> =
  Object.freeze(
    { claude:
        'claude -p --allowedTools Read,Grep,Glob',
      copilot:
        'copilot -s --no-ask-user --allow-all-tools --deny-tool=write --deny-tool=shell' });

export interface CoverageVerdict
{
  covered: boolean;
  message: string;
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
  let run;

  try {
    run =
      await runCommand(
        command,
        graph.folder,
        buildPrompt(
          graph,
          node));
  } catch (error) {
    return { covered: false,
             message:
               `AI agent failed to start: ${
        error instanceof Error
          ? error.message
          : String(error)
      }` };
  }

  if (run.code !== 0) {
    return { covered: false,
             message:
               `AI agent exited with code ${run.code}: ${
        (run.stderr || run.stdout).trim()
      }` };
  }

  return parseVerdict(run.stdout);
}

export function getAgentCommand(
    agent: AiAgent,
    override: string | undefined
  ): string
{
  return override
    || AGENT_COMMANDS[agent];
}

function buildPrompt(
    graph: RqGraph,
    node: RqNode
  ): string
{
  const lines =
    [ 'Check whether a requirement is fully covered by the requirements and',
      'evidence it links to. Every statement of the requirement must be',
      'implemented by at least one of them. Do not modify any file.',
      '',
      `Requirement: ${node.path}`,
      '',
      'Linked requirements and evidence:',
      '',
      ...node.children.map(
        (
            child
          ) =>
        {
        const childNode =
          graph.nodes.get(child);

        return `- ${child} (${childNode?.kind ?? 'requirement'})`;
      }),
      '',
      'Read the files and decide. Answer with exactly one line of JSON and',
      'nothing else, either',
      '{"result":"OK","message":""}',
      'or',
      '{"result":"Fail","message":"<the statements nothing covers>"}' ];

  return `${lines.join('\n')}\n`;
}

function parseVerdict(
    output: string
  ): CoverageVerdict
{
  const lines =
    output
    .split('\n')
    .map(
      line => line.trim())
    .filter(
      line => line !== '')
    .reverse();

  for (const line of lines) {
    let value;

    try {
      value =
        JSON.parse(line);
    } catch {
      continue;
    }

    if (value?.result === 'OK') {
      return { covered: true,
               message: '' };
    }

    if (value?.result === 'Fail') {
      return { covered: false,
               message:
                 typeof value.message === 'string'
            && value.message !== ''
          ? value.message
          : 'The requirement is not fully covered.' };
    }
  }

  return { covered: false,
           message:
             `AI agent gave no verdict: ${
      output.trim().slice(
        0,
        200)
    }` };
}
