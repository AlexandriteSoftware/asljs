import { read,
         type ReadParameters }
  from '../commands/read.js';
import { type Remove,
         remove }
  from '../commands/remove.js';
import { type Write,
         write }
  from '../commands/write.js';
import { type RollbackFeed }
  from '../model/rollback.js';
import { type Envelope }
  from '../working-folder/envelope.js';
import { type Tool }
  from './tool.js';

export const envelopeData = 'envelope';

export const rollbackFeedData = 'rollbackFeed';

export class EnvelopeTool implements Tool
{
  readonly name = 'envelope';

  async addFiles(
    envelope: Envelope,
    parameters: ReadParameters,
    rollbackFeed?: RollbackFeed
  ): Promise<void>
  {
    await read(
      envelope,
      parameters,
      rollbackFeed);
  }

  async writeFile(
    envelope: Envelope,
    parameters: Write,
    rollbackFeed?: RollbackFeed
  ): Promise<void>
  {
    await write(
      envelope,
      parameters,
      rollbackFeed);
  }

  async removeFile(
    envelope: Envelope,
    parameters: Remove,
    rollbackFeed?: RollbackFeed
  ): Promise<void>
  {
    await remove(
      envelope,
      parameters,
      rollbackFeed);
  }

  setInstruction(
    envelope: Envelope,
    instruction: string
  ): void
  {
    envelope.instruction = instruction;
  }

  setTask(
    envelope: Envelope,
    task: string
  ): void
  {
    envelope.task = task;
  }

  getUpdateParameters(
    envelope: Envelope
  ): ReadParameters[]
  {
    return envelope.files
      .map(
        file => file.update)
      .filter(
        (parameters): parameters is ReadParameters => parameters !== undefined);
  }
}
