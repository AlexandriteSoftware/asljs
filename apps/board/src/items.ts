import { findMarkdownFiles,
         parseMarkdown,
         plainText,
         toDisplayPath }
  from 'asljs-mdcli';
import { readFile,
         stat }
  from 'node:fs/promises';
import path
  from 'node:path';

export type ItemKind = 'idea' | 'plan' | 'task' | 'result';

export const ITEM_KINDS: readonly ItemKind[] =
  Object.freeze(
    [ 'idea',
      'plan',
      'task',
      'result' ]);

/**
 * The folder of each kind of item; it is also the column of the board.
 */
export const FOLDERS: Readonly<Record<ItemKind, string>> =
  Object.freeze(
    { idea: 'Ideas',
      plan: 'Plans',
      task: 'Tasks',
      result: 'Results' });

export const ARCHIVE = 'Archive';

/**
 * The kind with its article, e.g. `an idea`.
 */
export function aKind(
    kind: ItemKind
  ): string
{
  return kind === 'idea'
    ? 'an idea'
    : `a ${kind}`;
}

const PREFIXES: Readonly<Record<string, ItemKind>> =
  Object.freeze(
    { I: 'idea',
      P: 'plan',
      T: 'task',
      R: 'result' });

const ID =
  /^([IPTR])(\d+)(?:-(\d+))?$/;

const FILE_NAME =
  /^([IPTR]\d+(?:-\d+)?)(?:\s+(.*))?\.md$/i;

/**
 * An item's id: `I<n>` an idea, `P<n>` its plan, `T<n>-<m>` a task of the
 * plan, `R<n>-<m>` the result of that task.
 */
export interface ItemId
{
  id: string;
  kind: ItemKind;
  n: number;

  /**
   * The task number of a task or result; `null` for an idea or plan.
   */
  m: number | null;
}

export interface Item extends ItemId
{
  /**
   * Absolute path of the file.
   */
  path: string;

  /**
   * The text after the id in the level 1 heading, or in the file name when
   * there is no heading.
   */
  subject: string;

  text: string;
}

/**
 * The items of a board folder, from its `Ideas`, `Plans`, `Tasks` and
 * `Results` folders; `Archive` is not part of it.
 */
export interface Board
{
  folder: string;
  items: Item[];

  /**
   * What is wrong with the files: an item in the wrong folder, an id used
   * twice.
   */
  problems: string[];
}

/**
 * Reads an id such as `I19` or `T19-2`; `null` for any other text.
 */
export function parseId(
    text: string
  ): ItemId | null
{
  const match =
    ID.exec(
      text.trim());

  if (!match) {
    return null;
  }

  const kind =
    PREFIXES[match[1]];

  const hasTask = match[3] !== undefined;

  if (
    hasTask
    !== (kind === 'task'
         || kind === 'result')
  ) {
    return null;
  }

  return { id: match[0],
           kind,
           n:
             Number(match[2]),
           m:
             hasTask
      ? Number(match[3])
      : null };
}

/**
 * The id a file name starts with, e.g. `I19` for `I19 Track articles.md`;
 * `null` for any other name.
 */
export function getItemId(
    file: string
  ): ItemId | null
{
  const match =
    FILE_NAME.exec(
      path.basename(file));

  return match
    ? parseId(
      match[1].toUpperCase())
    : null;
}

/**
 * Loads the items of the board folder.
 */
export async function loadBoard(
    folder: string
  ): Promise<Board>
{
  const board: Board =
    { folder,
      items: [ ],
      problems: [ ] };

  const seen = new Map<string, string>();

  for (const kind of ITEM_KINDS) {
    const root =
      path.join(
        folder,
        FOLDERS[kind]);

    if (!(await stat(root).catch(() => null))?.isDirectory()) {
      continue;
    }

    for (const file of await findMarkdownFiles(root)) {
      const id =
        getItemId(file);

      if (id === null) {
        continue;
      }

      const shown =
        toDisplayPath(
          folder,
          file);

      if (id.kind !== kind) {
        board.problems.push(
          `${shown}: ${aKind(id.kind)} in ${FOLDERS[kind]}; move it to ${
            FOLDERS[id.kind]
          }.`);

        continue;
      }

      const other =
        seen.get(id.id);

      if (other !== undefined) {
        board.problems.push(
          `${shown}: ${id.id} is also ${other}; ids must be unique.`);

        continue;
      }

      seen.set(
        id.id,
        shown);

      board.items.push(
        await readItem(
          file,
          id));
    }
  }

  board.items.sort(compareItems);

  return board;
}

/**
 * The item a target names: an id such as `I19`, a `.md` name, or a path
 * relative to the board folder.
 */
export function findItem(
    board: Board,
    target: string
  ): Item
{
  const id =
    parseId(target);

  const resolved =
    path.resolve(
      board.folder,
      target);

  const name =
    path.basename(target)
    .toLowerCase();

  const item =
    board.items.find(
      candidate =>
      id !== null
        ? candidate.id === id.id
        : candidate.path === resolved
          || path.basename(candidate.path).toLowerCase() === name);

  if (!item) {
    throw new Error(
      `${target}: no idea, plan, task or result of the board has this ${
        id === null
          ? 'name'
          : 'id'
      }.`);
  }

  return item;
}

/**
 * The items of idea `n`: the idea, its plan, its tasks and their results.
 */
export function itemsOf(
    board: Board,
    n: number
  ): { idea: Item | null; plan: Item | null; tasks: Item[]; results: Item[]; }
{
  const of =
    (
    kind: ItemKind
  ): Item[] =>
    board.items.filter(
      item =>
        item.n === n
        && item.kind === kind);

  return { idea: of('idea')[0] ?? null,
           plan: of('plan')[0] ?? null,
           tasks:
             of('task'),
           results:
             of('result') };
}

/**
 * The path of a new item, `<folder>/<Kind folder>/<id> <subject>.md`.
 */
export function itemPath(
    folder: string,
    kind: ItemKind,
    id: string,
    subject: string
  ): string
{
  return path.join(
    folder,
    FOLDERS[kind],
    `${id} ${toFileSubject(subject)}.md`);
}

/**
 * A subject fit for a file name: characters a file name cannot hold
 * replaced by spaces, and spaces collapsed.
 */
export function toFileSubject(
    subject: string
  ): string
{
  return subject
    .replace(
      /[\\/:*?"<>|\r\n]+/g,
      ' ')
    .replace(
      /\s+/g,
      ' ')
    .trim()
    .replace(
      /\.+$/,
      '');
}

export function compareItems(
    a: ItemId,
    b: ItemId
  ): number
{
  return ITEM_KINDS.indexOf(a.kind) - ITEM_KINDS.indexOf(b.kind)
    || a.n - b.n
    || (a.m ?? 0) - (b.m ?? 0);
}

async function readItem(
    file: string,
    id: ItemId
  ): Promise<Item>
{
  const text =
    await readFile(
      file,
      'utf8');

  const heading =
    parseMarkdown(text).children.find(
      node =>
      node.type === 'heading'
      && node.depth === 1);

  const title =
    heading === undefined
    ? path.basename(
      file,
      '.md')
    : plainText(heading).trim();

  return { ...id,
           path: file,
           subject:
             title
      .replace(
        new RegExp(
          `^${id.id}\\b\\s*`,
          'i'),
        '')
      .trim(),
           text };
}
