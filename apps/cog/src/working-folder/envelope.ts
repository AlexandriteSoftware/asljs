import { type ContextFile }
  from '../context.js';

export interface Envelope
{
  instruction: string;
  task?: string;
  files: EnvelopeFile[];
}

export type EnvelopeFile = ContextFile;

export class EnvelopeBuilder
{
}
