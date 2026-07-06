import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { fileURLToPath }
  from 'node:url';
import { Logger }
  from '../logger.js';
import { Envelope }
  from './envelope.js';

export class EnvelopeContainer {
  private readonly logger: Logger;

  public envelope: Envelope | null = null;

  constructor(
    logger: Logger)
  {
    this.logger =
      logger.scope(
        { instanceId: 'EnvelopeContainer' });
  }

  public async tryLoadEnvelope(
      filePath: string
    ): Promise<boolean>
  {
    this.logger.trace(
      'tryLoadEnvelope(%s)',
      filePath);

    try {
      await this._loadEnvelope(filePath);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  public async loadEnvelope(
      filePath: string
    ): Promise<Envelope>
  {
    this.logger.trace(
      'loadEnvelope(%s)',
      filePath);

    await this._loadEnvelope(filePath);

    if (this.envelope === null) {
      throw new Error(
        `Envelope is null after loading from ${filePath}`);
    }

    return this.envelope;
  }

  private async _loadEnvelope(
      filePath: string
    ): Promise<void>
  {
    try {
      const content = await fs.readFile(
        filePath,
        'utf-8');

      const json = JSON.parse(
        content);

      this.envelope =
        json as Envelope;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async initializeEnvelope(
    ): Promise<Envelope>
  {
    this.logger.trace(
      'initializeEnvelope()');

    const instruction =
      await this.loadInstruction();

    const envelope =
      { instruction,
        files: [] };

    this.envelope = envelope;

    return envelope;
  }

  async loadInstruction(
    ): Promise<string>
  {
    const instructionPath =
      path.join(
        path.dirname(
          fileURLToPath(
            import.meta.url)),
        '../../src/files/Instruction.txt');

    const instruction =
      await fs.readFile(
        instructionPath,
        'utf-8');

    return instruction;
  }

  async saveEnvelope(
      filePath: string
    ): Promise<void>
  {
    this.logger.trace(
      'saveEnvelope(%s)',
      filePath);

    const json =
      JSON.stringify(
        this.envelope,
        null,
        2);

    await fs.mkdir(
      path.dirname(filePath),
      { recursive: true });

    await fs.writeFile(
      filePath,
      json,
      'utf-8');
  }
}
