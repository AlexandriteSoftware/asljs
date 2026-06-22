import fs
  from 'node:fs/promises';
import { type Envelope,
         type Command }
  from '../model/envelope.js';

export interface Remove
  extends Command
{
  path: string;
}

export async function remove(
    envelope: Envelope,
    command: Remove
  ): Promise<void>
{
  await fs.rm(
    command.path,
    { force: true });

  envelope.commands
    .push(
      command);

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
