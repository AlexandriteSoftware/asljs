import { toDisplayPath }
  from 'asljs-mdcli';
import { readStatus }
  from './exec.js';
import { Io }
  from './io.js';
import { Board,
         FOLDERS,
         Item,
         ITEM_KINDS,
         ItemKind,
         itemsOf,
         loadBoard }
  from './items.js';
import { countOpen }
  from './questions.js';

/**
 * An item as the board shows it.
 */
export interface Card
{
  id: string;
  kind: ItemKind;
  subject: string;

  /**
   * The path relative to the board folder, with `/` separators.
   */
  path: string;

  /**
   * Where the item stands: for an idea `NEW` or `PLANNED`, for a plan `NEW`
   * or `TASKS`, for a task `TODO` or the status of its result, for a result
   * its status.
   */
  status: string;

  openQuestions: number;
}

/**
 * The cards of the board, column by column: Ideas, Plans, Tasks, Results.
 */
export function toCards(
    board: Board
  ): Record<ItemKind, Card[]>
{
  const columns =
    Object.fromEntries(
      ITEM_KINDS.map(
        kind => [ kind,
                  [ ] as Card[] ])) as unknown as Record<ItemKind, Card[]>;

  for (const item of board.items) {
    columns[item.kind].push(
      { id: item.id,
        kind: item.kind,
        subject: item.subject,
        path:
          toDisplayPath(
            board.folder,
            item.path),
        status:
          getStatus(
            board,
            item),
        openQuestions:
          countOpen(item.text) });
  }

  return columns;
}

/**
 * Prints the board, column by column, or as JSON with `json`. Problems with
 * the files go to standard error.
 */
export async function execList(
    io: Io,
    options: { json?: boolean; }
  ): Promise<number>
{
  const board =
    await loadBoard(io.cwd);

  for (const problem of board.problems) {
    io.stderr.write(
      `Error  ${problem}\n`);
  }

  const columns =
    toCards(board);

  if (options.json) {
    io.stdout.write(
      `${
        JSON.stringify(
          columns,
          null,
          2)
      }\n`);

    return 0;
  }

  for (const kind of ITEM_KINDS) {
    io.stdout.write(
      `${FOLDERS[kind]}\n`);

    for (const card of columns[kind]) {
      io.stdout.write(
        `  ${card.status.padEnd(7)}  ${card.path}${
          card.openQuestions === 0
            ? ''
            : ` - ${card.openQuestions} open questions`
        }\n`);
    }
  }

  return 0;
}

function getStatus(
    board: Board,
    item: Item
  ): string
{
  const related =
    itemsOf(
      board,
      item.n);

  switch (item.kind) {
    case 'idea':
      return related.plan === null
        ? 'NEW'
        : 'PLANNED';

    case 'plan':
      return related.tasks.length === 0
        ? 'NEW'
        : 'TASKS';

    case 'task': {
      const result =
        related.results.find(
          found => found.m === item.m);

      return (result === undefined
        ? null
        : readStatus(result.text))
        ?? 'TODO';
    }

    case 'result':
      return readStatus(item.text) ?? 'UNKNOWN';
  }
}
