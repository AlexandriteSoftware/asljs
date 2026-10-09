import { type Logger,
         NullLogger }
  from 'asljs-logging';
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
 * commands, still without editing files; `edit` - also edit files.
 */
export type AgentMode = 'read' | 'run' | 'edit';

/**
 * Where `getAgentCommand` looks: the environment, for the override, and how
 * to detect an agent when none is named.
 */
export interface AgentSource
{
  env: Record<string, string | undefined>;

  /**
   * Finds the agent to use when none is named; `detectAgent` when absent.
   */
  detectAgent?: () => Promise<AiAgent | null>;

  /**
   * Where the choice of the agent is logged; nothing is logged when absent.
   */
  logger?: Logger;
}

export interface AgentVerdict
{
  ok: boolean;
  message: string;

  /**
   * The agent could not finish without more from the user: its verdict was
   * `Blocked`. `ok` is then false.
   */
  blocked?: boolean;

  /**
   * The verdict line as it was parsed, with any other fields the prompt asked
   * for, e.g. `questions`.
   */
  data?: Record<string, unknown>;
}

const AGENT_COMMANDS: Readonly<Record<AiAgent, Record<AgentMode, string>>> =
  Object.freeze(
    { claude:
        { read:
            'claude -p --allowedTools Read,Grep,Glob',
          run:
            'claude -p --allowedTools Read,Grep,Glob,Bash --disallowedTools Edit,Write,NotebookEdit',
          edit:
            'claude -p --allowedTools Read,Grep,Glob,Bash,Edit,Write' },
      copilot:
        { read:
            'copilot -s --no-ask-user --allow-all-tools --deny-tool=write --deny-tool=shell',
          run:
            'copilot -s --no-ask-user --allow-all-tools --deny-tool=write',
          edit:
            'copilot -s --no-ask-user --allow-all-tools' } });

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
    run: typeof runCommand = runCommand,
    logger: Logger = new NullLogger()
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
      logger.debug(
        { agent },
        'agent detected');

      return agent;
    }
  }

  logger.debug('no agent detected');

  return null;
}

/**
 * The command line of the agent: the `override` environment variable when
 * set, e.g. `RQ_AI_COMMAND`, otherwise the agent the spec names, or the
 * detected one, with its model. `null` when no agent is named and none is
 * found.
 */
export async function getAgentCommand(
    io: AgentSource,
    spec: AgentSpec,
    mode: AgentMode,
    override: string
  ): Promise<string | null>
{
  const logger =
    io.logger ?? new NullLogger();

  const command = io.env[override];

  if (command) {
    logger.debug(
      { variable: override },
      'agent command from the environment');

    return command;
  }

  const agent =
    spec.agent
    ?? await detect(
      io,
      logger);

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

async function detect(
    io: AgentSource,
    logger: Logger
  ): Promise<AiAgent | null>
{
  if (io.detectAgent !== undefined) {
    return await io.detectAgent();
  }

  return await detectAgent(
    runCommand,
    logger);
}

/**
 * Runs the agent in `cwd` with the prompt on standard input. The verdict is
 * the last line of its output that is a JSON object with `result` `OK`,
 * `Fail` or `Blocked`; `output` is everything it printed, and `answer` what it wrote to
 * standard output before the verdict.
 */
export async function askAgent(
    command: string,
    cwd: string,
    prompt: string,
    logger: Logger = new NullLogger()
  ): Promise<AgentVerdict & { output: string; answer: string; }>
{
  logger.debug(
    { command,
      cwd },
    'agent started');

  logger.trace(
    { prompt },
    'agent prompt');

  const started =
    Date.now();

  let run;

  try {
    run =
      await runCommand(
        command,
        cwd,
        prompt);
  } catch (error) {
    logger.debug(
      error as Error,
      'agent failed to start');

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

  logger.debug(
    { code: run.code,
      milliseconds:
        Date.now() - started },
    'agent exited');

  logger.trace(
    { stdout: run.stdout,
      stderr: run.stderr },
    'agent output');

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
      || value?.result === 'Fail'
      || value?.result === 'Blocked';
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
               message: '',
               data: value };
    }

    if (
      value?.result === 'Fail'
      || value?.result === 'Blocked'
    ) {
      return { ok: false,
               message:
                 typeof value.message === 'string'
            && value.message !== ''
          ? value.message
          : value.result === 'Blocked'
          ? 'The agent needs more from the user.'
          : 'The agent reported a failure.',
               ...value.result === 'Blocked'
          ? { blocked: true }
          : {},
               data: value };
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
