import fs
  from 'node:fs';
import os
  from 'node:os';
import path
  from 'node:path';

export interface Logger
{
  scope: (
    properties: Record<string, unknown>
  ) => Logger;
  trace: (...args: unknown[]) => void;
}

export class TmpDir
{
  readonly logger: Logger;
  readonly path: string;
  deleted: boolean;

  constructor(
      logger: Logger
    )
  {
    this.logger =
      logger.scope(
        { instanceId:
            'TmpDir' });

    this.path =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'cog-test-'));

    this.logger.trace(
      `constructor() { this.path=${this.path} }`);

    this.deleted =
      false;
  }

  resolve(
      ...segments: string[]
    ): string
  {
    const segmentsAreValid =
      segments.every(
        item =>
          !path.isAbsolute(
            item));

    if (!segmentsAreValid) {
      throw new Error(
        'All path segments must be relative');
    }

    return path.resolve(
      this.path,
      ...segments);
  }

  mkdir(
      directoryPath: string
    ): void
  {
    this.logger.trace(
      `mkdir(${directoryPath})`);

    const resolvedDirectoryPath =
      this.resolve(
        directoryPath);

    fs.mkdirSync(
      resolvedDirectoryPath,
      { recursive: true });
  }

  writeText(
      filePath: string,
      content: string
    ): void
  {
    this.logger.trace(
      `writeText(${filePath}, ...)`);

    const resolvedFilePath =
      this.resolve(
        filePath);

    fs.mkdirSync(
      path.dirname(
        resolvedFilePath),
      { recursive: true });

    fs.writeFileSync(
      resolvedFilePath,
      content,
      'utf8');
  }

  write(
      filePath: string,
      content: string | NodeJS.ArrayBufferView
    ): void
  {
    this.logger.trace(
      `write(${filePath}, ...)`);

    const resolvedFilePath =
      this.resolve(
        filePath);

    fs.mkdirSync(
      path.dirname(
        resolvedFilePath),
      { recursive: true });

    fs.writeFileSync(
      resolvedFilePath,
      content);
  }

  readText(
      filePath: string
    ): string
  {
    this.logger.trace(
      `readText(${filePath})`);

    const resolvedFilePath =
      this.resolve(
        filePath);

    return fs.readFileSync(
      resolvedFilePath,
      'utf8');
  }

  stat(
      filePath: string
    ): fs.Stats
  {
    this.logger.trace(
      `stat(${filePath})`);

    const resolvedPath =
      this.resolve(
        filePath);

    return fs.statSync(
      resolvedPath);
  }

  cleanup(
    ): void
  {
    this.logger.trace(
      'cleanup()');

    fs.rmSync(
      this.path,
      { recursive: true,
        force: true });

    this.deleted =
      true;
  }
}
