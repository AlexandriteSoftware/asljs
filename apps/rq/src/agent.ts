import { Io }
  from './io.js';
import { runCommand }
  from './run-command.js';

export type AiAgent = 'claude' | 'copilot';

export const AI_AGENTS: readonly AiAgent[] =
  Object.freeze(
    [ 'claude',
      'copilot' ]);

/**
 * The agent and model `--ai` names; either may be absent, e.g. `--ai`,
 * `--ai=claude:fable`, `--ai=copilot` or `--ai=:fable`.
 */
export interface AgentSpec
{
  agent?: AiAgent;
  model?: string;
}

/**
 * What the agent may do: `read` - read and search files; `run` - also run
 * commands, still without editing files.
 */
export type AgentMode = 'read' | 'run';

export interface AgentVerdict
{
  ok: boolean;
  message: string;
}

const AGENT_COMMANDS: Readonly<Record<AiAgent, Record<AgentMode, string>>> =
  Object.freeze(
    { claude:
        { read:
            'claude -p --allowedTools Read,Grep,Glob',
          run:
            'claude -p --allowedTools Read,Grep,Glob,Bash --disallowedTools Edit,Write,NotebookEdit' },
      copilot:
        { read:
            'copilot -s --no-ask-user --allow-all-tools --deny-tool=write --deny-tool=shell',
          run:
            'copilot -s --no-ask-user --allow-all-tools --deny-tool=write' } });

/**
 * Reads an `--ai` value: `true` for a bare `--ai`, otherwise
 * `[<agent>][:<model>]`.
 */
export function parseAgentSpec(
    value: string | true
  ): AgentSpec
{
  if (value === true) {
    return {};
  }

  const [agent, ...model] =
    value.trim().split(':');

  if (
    agent !== ''
    && !AI_AGENTS.includes(
      agent as AiAgent)
  ) {
    throw new Error(
      `Unknown AI agent: ${agent}. Use ${AI_AGENTS.join(' or ')}.`);
  }

  return { ...agent === ''
      ? {}
      : { agent:
            agent as AiAgent },
           ...model.join(':').trim() === ''
      ? {}
      : { model:
            model.join(':').trim() } };
}

/**
 * The first agent of `AI_AGENTS` whose command runs, or `null` when none
 * does.
 */
export async function detectAgent(
    run: typeof runCommand = runCommand
  ): Promise<AiAgent | null>
{
  for (const agent of AI_AGENTS) {
    const version =
      await run(
        `${agent} --version`,
        process.cwd())
      .catch(
        () => null);

    if (version?.code === 0) {
      return agent;
    }
  }

  return null;
}

/**
 * The command line of the agent: `RQ_AI_COMMAND` when set, otherwise the
 * agent the spec names, or the detected one, with its model. `null` when no
 * agent is named and none is found.
 */
export async function getAgentCommand(
    io: Io,
    spec: AgentSpec,
    mode: AgentMode
  ): Promise<string | null>
{
  const override =
    io.env.RQ_AI_COMMAND;

  if (override) {
    return override;
  }

  const agent =
    spec.agent
    ?? await (io.detectAgent ?? detectAgent)();

  if (agent === null) {
    return null;
  }

  return `${AGENT_COMMANDS[agent][mode]}${
    spec.model === undefined
      ? ''
      : ` --model ${
        /^[\w.:-]+$/.test(spec.model)
          ? spec.model
          : JSON.stringify(spec.model)
      }`
  }`;
}

/**
 * Runs the agent in `cwd` with the prompt on standard input. The verdict is
 * the last line of its output that is a JSON object with `result` `OK` or
 * `Fail`; `output` is everything it printed, and `answer` what it wrote to
 * standard output before the verdict.
 */
export async function askAgent(
    command: string,
    cwd: string,
    prompt: string
  ): Promise<AgentVerdict & { output: string; answer: string; }>
{
  let run;

  try {
    run =
      await runCommand(
        command,
        cwd,
        prompt);
  } catch (error) {
    return { ok: false,
             message:
               `AI agent failed to start: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`,
             output: '',
             answer: '' };
  }

  const output =
    `${run.stdout}${run.stderr}`;

  if (run.code !== 0) {
    return { ok: false,
             message:
               `AI agent exited with code ${run.code}: ${
        (run.stderr || run.stdout).trim()
      }`,
             output,
             answer: '' };
  }

  return { ...parseVerdict(run.stdout),
           output,
           answer:
             withoutVerdict(run.stdout) };
}

/**
 * The output without its last verdict line: what the agent wrote before
 * its verdict.
 */
function withoutVerdict(
    output: string
  ): string
{
  const lines =
    output.split(/\r?\n/);

  const index =
    lines.findLastIndex(
      line =>
      isVerdict(
        line.trim()));

  return (index < 0
    ? lines
    : lines.slice(
      0,
      index))
    .join('\n')
    .trim();
}

function isVerdict(
    line: string
  ): boolean
{
  try {
    const value =
      JSON.parse(line);

    return value?.result === 'OK'
      || value?.result === 'Fail';
  } catch {
    return false;
  }
}

/**
 * The lines that end a prompt: how to answer.
 */
export function verdictInstructions(
    failure: string
  ): string[]
{
  return [ 'Answer with exactly one line of JSON as the last line of your',
           'output, either',
           '{"result":"OK","message":""}',
           'or',
           `{"result":"Fail","message":"<${failure}>"}` ];
}

function parseVerdict(
    output: string
  ): AgentVerdict
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
      return { ok: true,
               message: '' };
    }

    if (value?.result === 'Fail') {
      return { ok: false,
               message:
                 typeof value.message === 'string'
            && value.message !== ''
          ? value.message
          : 'The agent reported a failure.' };
    }
  }

  return { ok: false,
           message:
             `AI agent gave no verdict: ${
      output.trim().slice(
        0,
        200)
    }` };
}
