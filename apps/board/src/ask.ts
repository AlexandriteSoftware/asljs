import { type AgentMode,
         type AgentSpec,
         type AgentVerdict,
         askAgent,
         getAgentCommand,
         toDisplayPath,
         verdictInstructions }
  from 'asljs-mdcli';
import { Io }
  from './io.js';
import { FOLDERS,
         Item }
  from './items.js';

/**
 * The environment variable that replaces the agent's command line.
 */
export const OVERRIDE = 'BOARD_AI_COMMAND';

/**
 * The conventions every prompt states, so that what the agent writes fits
 * the board.
 */
export const CONVENTIONS =
  [ 'The board is a folder of markdown documents:',
    `- \`${FOLDERS.idea}/I<n> <subject>.md\` - an idea;`,
    `- \`${FOLDERS.plan}/P<n> <subject>.md\` - the plan of idea n;`,
    `- \`${FOLDERS.task}/T<n>-<m> <subject>.md\` - task m of plan n;`,
    `- \`${FOLDERS.result}/R<n>-<m> <subject>.md\` - the result of task m.`,
    '',
    'A document starts with a level 1 heading, `# <id> <subject>`. What is not',
    'settled goes in a `## Open questions` section: one list item per',
    'question, `- <question>`; the user answers with a nested item,',
    '`  - Answer: <answer>`.',
    '',
    'Nobody answers while you work: do not ask the user anything. What you',
    'cannot settle goes where this prompt says.' ];

/**
 * The command line of the agent for `mode`, or an error when there is none.
 */
export async function getCommand(
    io: Io,
    spec: AgentSpec | undefined,
    mode: AgentMode
  ): Promise<string>
{
  const command =
    await getAgentCommand(
      io,
      spec ?? {},
      mode,
      OVERRIDE);

  if (command === null) {
    throw new Error(
      `No AI agent found; install claude or copilot, or set ${OVERRIDE}.`);
  }

  return command;
}

/**
 * Asks the agent, in the board folder, and fails when it does not answer
 * with `OK`.
 */
export async function ask(
    io: Io,
    command: string,
    prompt: string
  ): Promise<AgentVerdict & { answer: string; }>
{
  const verdict =
    await askAgent(
      command,
      io.cwd,
      prompt);

  if (!verdict.ok) {
    throw new Error(
      verdict.message);
  }

  return verdict;
}

/**
 * The agent's answer as a document: the text before its verdict, without a
 * fence around the whole of it; an error unless it starts with
 * `# <id>`.
 */
export function toDocument(
    answer: string,
    id: string
  ): string
{
  const fenced =
    /^```(?:markdown|md)?\s*\n([\s\S]*?)\n```\s*$/.exec(
      answer.trim());

  const text =
    (fenced?.[1] ?? answer).trim();

  if (!new RegExp(`^# ${id}\\b`).test(text)) {
    throw new Error(
      `The agent's document does not start with "# ${id}": ${
        text.slice(
          0,
          120)
      }`);
  }

  return `${text}\n`;
}

/**
 * A line of a prompt naming a document, relative to the board folder.
 */
export function describe(
    io: Io,
    label: string,
    item: Item | null
  ): string[]
{
  return item === null
    ? [ ]
    : [ `${label}: ${
      toDisplayPath(
        io.cwd,
        item.path)
    }` ];
}

export function verdict(
    failure: string
  ): string[]
{
  return verdictInstructions(failure);
}
