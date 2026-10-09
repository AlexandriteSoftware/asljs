import { type AgentSpec,
         parseMarkdown,
         plainText,
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

export interface TasksOptions
{
  /**
   * The plan: an id, a `.md` name or a path.
   */
  target: string;

  ai?: AgentSpec;
}

/**
 * A task as the agent wrote it.
 */
export interface DraftTask
{
  subject: string;
  body: string;
}

/**
 * Writes the tasks of a plan, `Tasks/T<n>-<m> <subject>.md` from 1 in the
 * order they are to be carried out: an AI agent breaks the plan into tasks.
 */
export async function execTasks(
    io: Io,
    options: TasksOptions
  ): Promise<number>
{
  const board =
    await loadBoard(io.cwd);

  const plan =
    findItem(
      board,
      options.target);

  if (plan.kind !== 'plan') {
    throw new Error(
      `${plan.id} is ${aKind(plan.kind)}; tasks are made from a plan.`);
  }

  const related =
    itemsOf(
      board,
      plan.n);

  if (related.tasks.length > 0) {
    throw new Error(
      `${plan.id} already has ${related.tasks.length} tasks; develop them with board develop T${plan.n}-<m>.`);
  }

  const command =
    await getCommand(
      io,
      options.ai,
      'read');

  const drafts =
    readTasks(
      (await ask(
        io,
        command,
        buildPrompt(
          io,
          plan,
          related.idea))).answer);

  if (drafts.length === 0) {
    throw new Error(
      'The agent wrote no task: no "## <subject>" heading in its answer.');
  }

  for (const [index, draft] of drafts.entries()) {
    const id =
      `T${plan.n}-${index + 1}`;

    const file =
      itemPath(
        io.cwd,
        'task',
        id,
        draft.subject);

    await mkdir(
      path.dirname(file),
      { recursive: true });

    await writeMarkdown(
      file,
      `# ${id} ${draft.subject}\n${
        draft.body === ''
          ? ''
          : `\n${draft.body}\n`
      }`);

    io.stdout.write(
      `Created ${
        toDisplayPath(
          io.cwd,
          file)
      }\n`);
  }

  return 0;
}

/**
 * The tasks of an answer: one per level 2 heading, the heading its subject
 * and the text up to the next level 1 or 2 heading its body, with its
 * headings a level up, so that a task's `### Open questions` becomes the
 * document's `## Open questions`.
 */
export function readTasks(
    answer: string
  ): DraftTask[]
{
  const nodes =
    parseMarkdown(answer).children;

  const tasks: DraftTask[] = [ ];

  for (const [index, node] of nodes.entries()) {
    if (
      node.type !== 'heading'
      || node.depth !== 2
    ) {
      continue;
    }

    const next =
      nodes.findIndex(
        (
        other,
        position
      ) =>
        position > index
        && other.type === 'heading'
        && other.depth <= 2);

    const end =
      next < 0
      ? answer.length
      : nodes[next].position!.start.offset!;

    const subject =
      plainText(node).replace(
        /\s+/g,
        ' ').trim();

    if (subject === '') {
      continue;
    }

    const start =
      node.position!.end.offset!;

    const raised =
      nodes
      .slice(
        index + 1,
        next < 0
          ? nodes.length
          : next)
      .filter(
        other => other.type === 'heading')
      .map(
        other =>
          answer.indexOf(
            '#',
            other.position!.start.offset!))
      .reverse()
      .reduce(
        (
          body,
          offset
        ) =>
          body.slice(
            0,
            offset - start)
          + body.slice(
            offset - start + 1),
        answer.slice(
          start,
          end));

    tasks.push(
      { subject,
        body:
          raised.trim() });
  }

  return tasks;
}

function buildPrompt(
    io: Io,
    plan: Item,
    idea: Item | null
  ): string
{
  return [ 'Break the plan of a planning board into tasks.',
           '',
           ...CONVENTIONS,
           '',
           ...describe(
             io,
             'The plan',
             plan),
           ...describe(
             io,
             'Its idea',
             idea),
           '',
           'Write the tasks in the order they are to be carried out. Each task is',
           'something one person or agent can do and check: what to do, where, and how',
           'to know it is done; it may have its own `### Open questions`. Write each',
           'task as a level 2 heading with its subject, `## <subject>`, followed by its',
           'description, with no level 1 or 2 heading inside, and nothing else before',
           'the verdict.',
           '',
           'You may read files to find facts; do not change any file.',
           ...verdict(
             'why you could not break it into tasks') ]
    .join('\n')
    + '\n';
}
