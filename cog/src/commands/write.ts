import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { type Envelope,
         type Command }
  from '../model/envelope.js';

export interface Write
  extends Command
{
  path: string;
  content: string;
}

export async function write(
    envelope: Envelope,
    command: Write
  ): Promise<void>
{
  await fs.mkdir(
    path.dirname(
      command.path),
    { recursive: true });

  await fs.writeFile(
    command.path,
    command.content,
    'utf-8');

  envelope.commands
    .push(
      command);
}
