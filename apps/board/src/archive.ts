import { toDisplayPath }
  from 'asljs-mdcli';
import { mkdir,
         rename,
         stat }
  from 'node:fs/promises';
import path
  from 'node:path';
import { Io }
  from './io.js';
import { ARCHIVE,
         findItem,
         FOLDERS,
         itemsOf,
         loadBoard,
         toFileSubject }
  from './items.js';

/**
 * Moves an idea and everything that belongs to it - its plan, tasks and
 * results - to `Archive/I<n> <subject>/`, each in a folder of its kind.
 */
export async function execArchive(
    io: Io,
    options: { target: string; }
  ): Promise<number>
{
  const board =
    await loadBoard(io.cwd);

  const item =
    findItem(
      board,
      options.target);

  const related =
    itemsOf(
      board,
      item.n);

  const subject =
    (related.idea ?? related.plan ?? item).subject;

  const destination =
    path.join(
      io.cwd,
      ARCHIVE,
      `I${item.n} ${toFileSubject(subject)}`.trim());

  if (await stat(destination).catch(() => null)) {
    throw new Error(
      `${
        toDisplayPath(
          io.cwd,
          destination)
      } already exists.`);
  }

  const items =
    [ related.idea,
      related.plan,
      ...related.tasks,
      ...related.results ]
    .filter(
      found => found !== null);

  for (const found of items) {
    const file =
      path.join(
        destination,
        FOLDERS[found.kind],
        path.basename(found.path));

    await mkdir(
      path.dirname(file),
      { recursive: true });

    await rename(
      found.path,
      file);

    io.stdout.write(
      `Archived ${
        toDisplayPath(
          io.cwd,
          found.path)
      } -> ${
        toDisplayPath(
          io.cwd,
          file)
      }\n`);
  }

  return 0;
}
