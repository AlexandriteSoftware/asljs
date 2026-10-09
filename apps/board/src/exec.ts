import { type AgentSpec,
         askAgent,
         formatUrl,
         toDisplayPath,
         writeMarkdown }
  from 'asljs-mdcli';
import { mkdir,
         readFile }
  from 'node:fs/promises';
import path
  from 'node:path';
import { CONVENTIONS,
         describe,
         getCommand }
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
import { addQuestions }
  from './questions.js';

export type ResultStatus = 'DONE' | 'FAILED' | 'BLOCKED';

export interface ExecOptions
{
  /**
   * The plan: an id, a `.md` name or a path.
   */
  target: string;

  ai?: AgentSpec;
}

const STATUS_LINE =
  /^- Status:\s*(DONE|FAILED|BLOCKED)\b/m;

/**
 * The status a result records, or `null` for a document without one.
 */
export function readStatus(
    text: string
  ): ResultStatus | null
{
  return (STATUS_LINE.exec(text)?.[1] as ResultStatus | undefined) ?? null;
}

/**
 * Carries out the tasks of a plan one by one, in order: an AI agent that may
 * read and edit files and run commands does each task, and its report is
 * written to `Results/R<n>-<m> <subject>.md`. A task already `DONE` is
 * skipped. It stops at the first task that fails, or that is blocked: then
 * the agent's questions are added to the task's `## Open questions`, to be
 * answered before running it again. Returns 0 when every task is done.
 */
export async function execExec(
    io: Io,
    options: ExecOptions
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
      `${plan.id} is ${
        aKind(plan.kind)
      }; board exec carries out the tasks of a plan.`);
  }

  const related =
    itemsOf(
      board,
      plan.n);

  if (related.tasks.length === 0) {
    throw new Error(
      `${plan.id} has no tasks; make them with board tasks ${plan.id}.`);
  }

  const command =
    await getCommand(
      io,
      options.ai,
      'edit');

  const done: Item[] = [ ];

  for (const task of related.tasks) {
    const previous =
      related.results.find(
        result => result.m === task.m)
      ?? null;

    if (
      previous !== null
      && readStatus(previous.text)
         === 'DONE'
    ) {
      io.stdout.write(
        `DONE     ${
          display(
            io,
            task)
        } - earlier\n`);

      done.push(previous);

      continue;
    }

    const verdict =
      await askAgent(
        command,
        io.cwd,
        buildPrompt(
          io,
          task,
          plan,
          related.idea,
          done,
          previous));

    const status: ResultStatus =
      verdict.ok
      ? 'DONE'
      : verdict.blocked
      ? 'BLOCKED'
      : 'FAILED';

    const file =
      previous?.path
      ?? itemPath(
        io.cwd,
        'result',
        `R${task.n}-${task.m}`,
        task.subject);

    await mkdir(
      path.dirname(file),
      { recursive: true });

    await writeMarkdown(
      file,
      formatResult(
        task,
        file,
        status,
        verdict.message,
        verdict.answer,
        (io.now ?? (() => new Date()))().toISOString()));

    io.stdout.write(
      `${status.padEnd(7)}  ${
        display(
          io,
          task)
      }${
        verdict.message === ''
          ? ''
          : ` - ${verdict.message}`
      }\nResult   ${
        toDisplayPath(
          io.cwd,
          file)
      }\n`);

    if (status === 'BLOCKED') {
      const questions =
        Array.isArray(
          verdict.data?.questions)
        ? verdict.data.questions.filter(
          (question): question is string =>
            typeof question === 'string'
            && question.trim() !== '')
        : [ ];

      await writeMarkdown(
        task.path,
        addQuestions(
          await readFile(
            task.path,
            'utf8'),
          questions.length > 0
            ? questions
            : [ verdict.message ]));

      io.stdout.write(
        `Updated  ${
          display(
            io,
            task)
        } - answer its open questions, then run board exec ${plan.id} again\n`);
    }

    if (status !== 'DONE') {
      return 1;
    }

    done.push(
      { ...task,
        path: file });
  }

  return 0;
}

/**
 * A result document: the status, the task and the date, then the agent's
 * report.
 */
export function formatResult(
    task: Item,
    file: string,
    status: ResultStatus,
    message: string,
    report: string,
    date: string
  ): string
{
  const link =
    formatUrl(
      path.relative(
        path.dirname(file),
        task.path)
      .split(path.sep)
      .join('/'));

  return [ `# R${task.n}-${task.m} ${task.subject}`,
           '',
           `- Status: ${status}${
      message === ''
        ? ''
        : ` - ${
          message.replace(
            /\s+/g,
            ' ').trim()
        }`
    }`,
           `- Task: [${task.id} ${task.subject}][${task.id}]`,
           `- Date: ${date}`,
           ...report.trim() === ''
      ? [ ]
      : [ '',
          report.trim() ],
           '',
           `[${task.id}]: ${link}`,
           '' ]
    .join('\n');
}

function display(
    io: Io,
    item: Item
  ): string
{
  return toDisplayPath(
    io.cwd,
    item.path);
}

function buildPrompt(
    io: Io,
    task: Item,
    plan: Item,
    idea: Item | null,
    done: readonly Item[],
    previous: Item | null
  ): string
{
  return [ 'Carry out a task of a plan of a planning board.',
           '',
           ...CONVENTIONS,
           '',
           ...describe(
             io,
             'The task',
             task),
           ...describe(
             io,
             'Its plan',
             plan),
           ...describe(
             io,
             'Its idea',
             idea),
           ...done.flatMap(
             result =>
        describe(
          io,
          'Done earlier',
          result)),
           ...describe(
             io,
             'The result of the last attempt',
             previous),
           '',
           'You may read and edit files and run commands. Do what the task says, and',
           'use the answers in its `## Open questions`. When you cannot finish it without',
           'something only the user can give - a decision, a password, a payment, an',
           'action on a web site - do not guess: stop, and say what is needed.',
           '',
           'Then report, in markdown, what you did and what you found: the changes you',
           'made, with their paths, and anything the user should check. Write nothing',
           'else before the verdict. End with exactly one line of JSON, either',
           '{"result":"OK","message":""}',
           'or, when it went wrong,',
           '{"result":"Fail","message":"<what went wrong>"}',
           'or, when you need the user,',
           '{"result":"Blocked","message":"<what you need>","questions":["<a question for the user>"]}' ]
    .join('\n')
    + '\n';
}
