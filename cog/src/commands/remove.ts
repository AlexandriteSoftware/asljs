import fs
  from 'node:fs/promises';
import { type Envelope }
  from '../model/envelope.js';
import { type Command } from '../model/command.js';
import { type RollbackFeed }
  from '../model/rollback.js';

export interface Remove
  extends Command
{
  path: string;
}

export async function remove(
    envelope: Envelope,
    command: Remove,
    rollbackFeed?: RollbackFeed
  ): Promise<void>
{
  await rollbackFeed?.saveFileState(
    command.path);

  await fs.rm(
    command.path,
    { force: true });

  const fileIndex =
    envelope.files
      .findIndex(
        file =>
          file.path === command.path);

  if (fileIndex !== -1) {
    envelope.files.splice(
      fileIndex,
      1);
  }
}

export async function rollbackRemove(
    rollbackFeed: RollbackFeed
  ): Promise<void>
{
  await rollbackFeed.rollbackLast();
}
