import { type AgentSpec,
         toDisplayPath,
         writeMarkdown }
  from 'asljs-mdcli';
import { mkdir }
  from 'node:fs/promises';
import path
  from 'node:path';
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
         itemPath,
         itemsOf,
         loadBoard }
  from './items.js';
import { countOpen }
  from './questions.js';

export interface PlanOptions
{
  /**
   * The idea: an id, a `.md` name or a path.
   */
  target: string;

  guidance?: string;
  ai?: AgentSpec;
}

/**
 * Writes the plan of an idea, `Plans/P<n> <subject>.md`: an AI agent turns
 * the idea into a goal, an approach and steps, with the questions that are
 * still open.
 */
export async function execPlan(
    io: Io,
    options: PlanOptions
  ): Promise<number>
{
  const board =
    await loadBoard(io.cwd);

  const idea =
    findItem(
      board,
      options.target);

  if (idea.kind !== 'idea') {
    throw new Error(
      `${idea.id} is ${aKind(idea.kind)}; a plan is made from an idea.`);
  }

  const existing =
    itemsOf(
      board,
      idea.n).plan;

  if (existing !== null) {
    throw new Error(
      `${idea.id} already has a plan, ${
        toDisplayPath(
          io.cwd,
          existing.path)
      }; develop it with board develop P${idea.n}.`);
  }

  const command =
    await getCommand(
      io,
      options.ai,
      'read');

  const id = `P${idea.n}`;

  const document =
    toDocument(
      (await ask(
        io,
        command,
        buildPrompt(
          io,
          idea,
          id,
          options.guidance))).answer,
      id);

  const file =
    itemPath(
      io.cwd,
      'plan',
      id,
      idea.subject);

  await mkdir(
    path.dirname(file),
    { recursive: true });

  await writeMarkdown(
    file,
    document);

  const ideaQuestions =
    countOpen(idea.text);

  io.stdout.write(
    `Created ${
      toDisplayPath(
        io.cwd,
        file)
    } - ${countOpen(document)} open questions\n${
      ideaQuestions === 0
        ? ''
        : `Note: ${idea.id} still has ${ideaQuestions} open questions.\n`
    }`);

  return 0;
}

function buildPrompt(
    io: Io,
    idea: Item,
    id: string,
    guidance: string | undefined
  ): string
{
  return [ 'Write the plan of an idea of a planning board.',
           '',
           ...CONVENTIONS,
           '',
           ...describe(
             io,
             'The idea',
             idea),
           ...guidance === undefined || guidance.trim() === ''
      ? [ ]
      : [ '',
          `The user asks: ${guidance.trim()}` ],
           '',
           'The plan:',
           `- starts with the line \`# ${id} ${idea.subject}\`;`,
           '- `## Goal` - what is true when the plan is done;',
           '- `## Approach` - how it gets there, and why this way;',
           '- `## Steps` - a numbered list of concrete actions, in order, each of which',
           '  can become a task that one person or agent can do and check;',
           '- `## Open questions` - what the idea leaves open and the plan needs, as',
           '  above; leave it out when nothing is open.',
           '',
           'You may read files to find facts; do not change any file. Write the whole',
           'plan, as markdown, and nothing else before the verdict.',
           ...verdict(
             'why you could not plan it') ]
    .join('\n')
    + '\n';
}
