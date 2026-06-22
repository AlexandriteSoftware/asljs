import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { fileURLToPath }
  from 'node:url';
import { type Read }
  from '../commands/read.js';

export interface Envelope {
  instruction: string;
  files: EnvelopeFile[];
}

export interface Command {
  command: string;
}

export interface EnvelopeFile {
  path: string;
  type: 'text' | 'binary';
  content?: string;
  complete?: boolean;
  update?: Read;
}

export async function loadEnvelope(
    filePath: string
  ): Promise<Envelope>
{
  try {
    const content =
      await fs.readFile(
        filePath,
        'utf-8');

    const json =
      JSON.parse(
        content);

    const envelope =
      json as Envelope;

    if ('commands' in envelope) {
      delete (envelope as unknown as { commands?: unknown }).commands;
    }

    return envelope;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }

    return {
      instruction:
        await loadInstruction(),
      files: []
    };
  }
}

async function loadInstruction(
  ): Promise<string>
{
  const instructionPath =
    path.join(
      path.dirname(
        fileURLToPath(import.meta.url)),
      '../../src/files/Instruction.txt');

  return fs.readFile(
    instructionPath,
    'utf-8');
}

export async function saveEnvelope(
    envelope: Envelope,
    filePath: string
  ): Promise<void>
{
  await fs.mkdir(
    path.dirname(filePath),
    { recursive: true });

  await fs.writeFile(
    filePath,
    `${JSON.stringify(envelope, null, 2)}\n`,
    'utf-8');
}
