import { type AgentSpec,
         toDisplayPath,
         writeMarkdown }
  from 'asljs-mdcli';
import { ask,
         CONVENTIONS,
         describe,
         getCommand,
         toDocument,
         verdict }
  from './ask.js';
import { Io }
  from './io.js';
import { aKind,
         findItem,
         Item,
         itemsOf,
         loadBoard }
  from './items.js';
import { countOpen }
  from './questions.js';

export interface DevelopOptions
{
  /**
   * The idea, plan or task: an id, a `.md` name or a path.
   */
  target: string;

  /**
   * What the user asks for, e.g. `add user specific goals`.
   */
  guidance?: string;

  ai?: AgentSpec;
}

const GOALS: Readonly<Record<string, string>> =
  Object.freeze(
    { idea:
        'an idea that can be planned: what is wanted and why, what is known, and what is still to decide',
      plan:
        'a plan that can be broken into tasks: the goal, the approach, and steps that are concrete actions',
      task:
        'a task one person or agent can carry out and check: what to do, where, and how to know it is done' });

/**
 * Develops an idea, plan or task: an AI agent reads it, the documents it
 * belongs with and the user's answers to its open questions, and rewrites
 * it, more complete and with the questions that are still open.
 */
export async function execDevelop(
    io: Io,
    options: DevelopOptions
  ): Promise<number>
{
  const board =
    await loadBoard(io.cwd);

  const item =
    findItem(
      board,
      options.target);

  if (item.kind === 'result') {
    throw new Error(
      `${item.id} is a result; develop its task instead.`);
  }

  const command =
    await getCommand(
      io,
      options.ai,
      'read');

  const related =
    itemsOf(
      board,
      item.n);

  const document =
    toDocument(
      (await ask(
        io,
        command,
        buildPrompt(
          io,
          item,
          related,
          options.guidance))).answer,
      item.id);

  await writeMarkdown(
    item.path,
    document);

  io.stdout.write(
    `Developed ${
      toDisplayPath(
        io.cwd,
        item.path)
    } - ${countOpen(document)} open questions\n`);

  return 0;
}

function buildPrompt(
    io: Io,
    item: Item,
    related: ReturnType<typeof itemsOf>,
    guidance: string | undefined
  ): string
{
  return [ `Develop ${aKind(item.kind)} of a planning board into ${GOALS[item.kind]}.`,
           '',
           ...CONVENTIONS,
           '',
           ...describe(
             io,
             'The document',
             item),
           ...item.kind === 'idea'
      ? [ ]
      : describe(
        io,
        'Its idea',
        related.idea),
           ...item.kind === 'task'
      ? describe(
        io,
        'Its plan',
        related.plan)
      : [ ],
           ...guidance === undefined || guidance.trim() === ''
      ? [ ]
      : [ '',
          `The user asks: ${guidance.trim()}` ],
           '',
           'Rewrite the document:',
           `- keep the first line exactly: \`# ${item.id} ${item.subject}\`;`,
           '- keep what is still right, make what is vague concrete, and do what the user asks;',
           '- fold every answered question into the text and drop it, keep the questions',
           '  that are still open, and add the questions you cannot settle from the',
           '  documents; leave `## Open questions` out when nothing is open.',
           '',
           'You may read files to find facts; do not change any file. Write the whole new',
           'document, as markdown, and nothing else before the verdict.',
           ...verdict(
             'why you could not develop it') ]
    .join('\n')
    + '\n';
}
