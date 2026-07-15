import { ReadParameters }
  from '../commands/read.js';

export interface Envelope
{
  instruction: string;
  files: EnvelopeFile[];
}

export interface EnvelopeFile
{
  path: string;
  type: 'text' | 'binary';
  content?: string;
  complete?: boolean;
  update?: ReadParameters;
}
