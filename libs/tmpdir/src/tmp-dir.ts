import { type Logger,
         NullLoggerProvider }
  from 'asljs-logging';
import fs
  from 'node:fs';
import fsp
  from 'node:fs/promises';
import os
  from 'node:os';
import path
  from 'node:path';

export interface TmpDirOptions
{
  tmpDir: string;
  prefix: string;
  keep: boolean;
}

export class TmpDir
{
  #logger: Logger;
  #disposed: boolean;

  public readonly path: string;

  constructor(
    options?: Partial<TmpDirOptions>
  );

  constructor(
    logger?: Logger,
    options?: Partial<TmpDirOptions>
  );

  constructor(
    loggerOrOptions?: Logger | Partial<TmpDirOptions>,
    options: Partial<TmpDirOptions> = {}
  )
  {
    const logger =
      isLogger(loggerOrOptions)
      ? loggerOrOptions
      : undefined;

    const resolvedOptions =
      isLogger(loggerOrOptions)
      ? options
      : (loggerOrOptions ?? options);

    this.#logger =
      logger
      ?? new NullLoggerProvider()
        .getLogger();

    const tmpDir =
      resolvedOptions.tmpDir
      ?? os.tmpdir();

    const prefix =
      resolvedOptions.prefix
      ?? 'asljs-tmpdir-';

    this.path =
      fs.mkdtempSync(
        path.join(
          tmpDir,
          prefix));

    this.#logger.trace(
      `constructor() { this.path=${this.path} }`);

    this.#disposed = false;
  }

  resolve(
    ...segments: string[]
  ): string
  {
    this.#throwIfDisposed();

    const segmentsAreValid =
      segments.every(
        item => !path.isAbsolute(item));

    if (!segmentsAreValid) {
      throw new Error(
        'All path segments must be relative');
    }

    const resolvedPath =
      path.resolve(
        this.path,
        ...segments);

    const relativePath =
      path.relative(
        this.path,
        resolvedPath);

    if (
      relativePath === '..'
      || relativePath.startsWith(
        `..${path.sep}`)
      || path.isAbsolute(relativePath)
    ) {
      throw new Error(
        'Resolved path must stay within the temporary directory');
    }

    return resolvedPath;
  }

  async mkdir(
    directoryPath: string
  ): Promise<string>
  {
    this.#logger.trace(
      `mkdir(${directoryPath})`);

    const resolvedDirectoryPath =
      this.resolve(
        directoryPath);

    await fsp.mkdir(
      resolvedDirectoryPath,
      { recursive: true });

    return resolvedDirectoryPath;
  }

  async write(
    filePath: string,
    content: Buffer
  ): Promise<string>
  {
    this.#logger.trace(
      `write(${filePath}, ...)`);

    this.#throwIfDisposed();

    const resolvedFilePath =
      this.resolve(
        filePath);

    await fsp.mkdir(
      path.dirname(
        resolvedFilePath),
      { recursive: true });

    await fsp.writeFile(
      resolvedFilePath,
      content);

    return resolvedFilePath;
  }

  async writeText(
    filePath: string,
    content: string
  ): Promise<string>
  {
    this.#logger.trace(
      `writeText(${filePath}, ...)`);

    this.#throwIfDisposed();

    const resolvedFilePath =
      this.resolve(
        filePath);

    await fsp.mkdir(
      path.dirname(
        resolvedFilePath),
      { recursive: true });

    await fsp.writeFile(
      resolvedFilePath,
      content,
      'utf8');

    return resolvedFilePath;
  }

  async readText(
    filePath: string
  ): Promise<string>
  {
    this.#logger.trace(
      `readText(${filePath})`);

    this.#throwIfDisposed();

    const resolvedFilePath =
      this.resolve(
        filePath);

    return await fsp.readFile(
      resolvedFilePath,
      'utf8');
  }

  async stat(
    path: string
  ): Promise<fs.Stats>
  {
    this.#logger.trace(
      `stat(${path})`);

    this.#throwIfDisposed();

    const resolvedPath =
      this.resolve(
        path);

    return await fsp.stat(
      resolvedPath);
  }

  async cleanup(): Promise<void>
  {
    this.#logger.trace(
      `cleanup()`);

    await this.#cleanup();
  }

  cleanupSync(): void
  {
    this.#logger.trace(
      `cleanupSync()`);

    this.#cleanupSync();
  }

  [Symbol.dispose](): void
  {
    this.cleanupSync();
  }

  async [Symbol.asyncDispose](): Promise<void>
  {
    await this.#cleanup();
  }

  #throwIfDisposed(): void
  {
    if (this.#disposed) {
      throw new Error(
        `TmpDir instance has been disposed`);
    }
  }

  async #cleanup(): Promise<void>
  {
    if (this.#disposed) {
      return;
    }

    try {
      await fsp.rm(
        this.path,
        { recursive: true,
          force: true });
    } catch (error) {
      this.#logger.error(
        `cleanup error: %s`,
        error);
    }

    this.#disposed = true;
  }

  #cleanupSync(): void
  {
    if (this.#disposed) {
      return;
    }

    try {
      fs.rmSync(
        this.path,
        { recursive: true,
          force: true });
    } catch (error) {
      this.#logger.error(
        `cleanupSync() error: %s`,
        error);
    }

    this.#disposed = true;
  }
}

function isLogger(
    value: Logger | Partial<TmpDirOptions> | undefined
  ): value is Logger
{
  if (value === undefined) {
    return false;
  }

  if (value === null) {
    return false;
  }

  if (
    typeof value
    !== 'object'
  ) {
    return false;
  }

  const candidate =
    value as Partial<Logger>;

  return typeof candidate.trace === 'function'
    && typeof candidate.debug === 'function'
    && typeof candidate.information === 'function'
    && typeof candidate.warning === 'function'
    && typeof candidate.error === 'function';
}
