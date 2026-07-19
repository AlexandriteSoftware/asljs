import fs
  from 'node:fs/promises';
import { Command }
  from './command.js';

export interface Patch
{
  task: string;
  commands: Command[];
}

export async function loadPatch(
    filePath: string
  ): Promise<Patch>
{
  const content =
    await fs.readFile(
      filePath,
      'utf-8');

  const json =
    JSON.parse(
      content);

  const patch =
    json as Patch;

  return patch;
}
