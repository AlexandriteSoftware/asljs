import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { Envelope }
  from '../envelope/envelope.js';
import { Command }
  from '../model/command.js';
import { RollbackFeed }
  from '../model/rollback.js';

export interface Write extends Command
{
  path: string;
  content: string;
}

export async function write(
    envelope: Envelope,
    command: Write,
    rollbackFeed?: RollbackFeed
  ): Promise<void>
{
  await rollbackFeed?.saveFileState(
    command.path
  );

  await fs.mkdir(
    path.dirname(
      command.path
    ),
    { recursive: true }
  );

  await fs.writeFile(
    command.path,
    command.content,
    'utf-8'
  );
}

export async function rollbackWrite(
    rollbackFeed: RollbackFeed
  ): Promise<void>
{
  await rollbackFeed.rollbackLast();
}
