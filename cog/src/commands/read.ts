import fs
  from 'node:fs/promises';
import { type Envelope,
         type EnvelopeFile,
         type Command }
  from '../model/envelope.js';

const textDecoder =
  new TextDecoder(
    'utf-8',
    { fatal: true });

export interface Read
  extends Command
{
  path: string;
}

export async function read(
    envelope: Envelope,
    command: Read
  ): Promise<void>
{
  const file =
    await getEnvelopeFile(
      command.path);

  envelope.commands
    .push(
      command);

  const fileIndex =
    envelope.files
      .findIndex(
        file =>
          file.path === command.path);

  if (fileIndex === -1) {
    envelope.files
      .push(
        file);
  } else {
    envelope.files[fileIndex] =
      file;
  }
}

async function getEnvelopeFile(
    filePath: string
  ): Promise<EnvelopeFile>
{
  let content: string;

  const data =
    await fs.readFile(
      filePath);

  try {
    content = textDecoder.decode(data);
  } catch {
    return { path: filePath, type: "binary" };
  }

  return {
    path: filePath,
    type: "text",
    content,
    complete: true
  };
}
