import fs
  from 'node:fs';
import os
  from 'node:os';
import path
  from 'node:path';
import { type Logger }
  from './logger.js';

let instanceCounter = 0;

/**
 * Represents a temporary directory that is cleaned up when no longer needed.
 * 
 * Example: basic usage
 * 
 * ```ts
 * const tmpDir = new TmpDir(logger);
 * 
 * tmpDir.writeText(
 *   'example.txt',
 *   'Hello, world!');
 * 
 * const content =
 *   tmpDir.readText('example.txt');
 * 
 * // Outputs: Hello, world!
 * console.log(content); 
 * 
 * // Cleans up the temporary directory
 * tmpDir.cleanup();
 * ```
 * 
 * Example: In tests
 * 
 * ```ts
 * import test from 'node:test';
 * 
 * test(
 *   'example test',
 *   ctx => {
 *     const tmpDir = new TmpDir(logger);
 * 
 *     test.after(
 *       () => {
 *         tmpDir.cleanup();
 *       });
 * 
 *     ...
 *   });
 * ```
 */
export class TmpDir
{
  readonly logger: Logger;
  readonly path: string;
  deleted: boolean;

  constructor(
      logger: Logger
    )
  {
    const instanceId =
      `TmpDir(${instanceCounter++})`;

    this.logger =
      logger.scope(
        { instanceId });

    this.path =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'cog-test-'));

    this.logger.trace(
      'constructor() { this.path=%s }',
      this.path);

    this.deleted = false;
  }

  resolve(
      ...segments: string[]
    ): string
  {
    this.logger.trace(
      'resolve(%s)',
      segments.join(', '));

    return this._resolve(
      ...segments);
  }

  mkdir(
      directoryPath: string
    ): void
  {
    this.logger.trace(
      'mkdir(%s)',
      directoryPath);

    const resolvedDirectoryPath =
      this._resolve(
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
      'writeText(%s, ...)',
      filePath);

    const resolvedFilePath =
      this._resolve(
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
      'write(%s, ...)',
      filePath);

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
      'readText(%s)',
      filePath);

    const resolvedFilePath =
      this._resolve(
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
      'stat(%s)',
      filePath);

    const resolvedPath =
      this._resolve(
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

    this.deleted = true;
  }

  isPathContained(
      filePath: string
    ): boolean
  {
    this.logger.trace(
      'isPathContained(%s)',
      filePath);

    if (!path.isAbsolute(filePath)) {
      throw new Error(
        'filePath must be absolute');
    }

    const normalised =
      path.normalize(
        filePath);

    if (normalised === filePath) {
      return true;
    }

    if (
      normalised.startsWith(
        this.path + path.sep))
    {
      return true;
    }

    return false;
  }

  _resolve(
      ...segments: string[]
    ): string
  {
    const segmentsAreValid =
      segments.every(
        item =>
          !path.isAbsolute(item));

    if (!segmentsAreValid) {
      throw new Error(
        'All path segments must be relative');
    }

    const resolvedPath =
      path.resolve(
        this.path,
        ...segments);

    if (!this.isPathContained(resolvedPath)) {
      throw new Error(
        'Resolved path is outside of the temporary directory');
    }

    return resolvedPath;
  }  
}
