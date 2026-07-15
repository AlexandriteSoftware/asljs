import fs
  from 'node:fs';
import fsp
  from 'node:fs/promises';
import os
  from 'node:os';
import path
  from 'node:path';

export type TmpDirLogFunction = (
  message: string,
  ...params: any[]
) => void;

export interface TmpDirOptions
{
  trace: TmpDirLogFunction;
  error: TmpDirLogFunction;
  tmpDir: string;
  prefix: string;
  keep: boolean;
}

export function formatMessage(
  message: string,
  ...params: any[]
): string
{
  return message.replace(
    /%[sdo]/g,
    m =>
    {
      const param =
        params.shift();

      if (param === undefined) {
        switch (m) {
          case '%s':
            return String(param);
          case '%d':
            return String(
              Number(param)
            );
          case '%o':
            return JSON.stringify(param);
        }

        return m;
      }

      return param;
    }
  );
}

export function tmpDirConsoleLogFunction(
  message: string,
  ...params: any[]
): void
{
  console.error(
    formatMessage(
      message,
      ...params
    )
  );
}

export function tmpDirThrowErrorFunction(
  message: string,
  ...params: any[]
): void
{
  throw new Error(
    formatMessage(
      message,
      ...params
    )
  );
}

export class TmpDir
{
  #trace: TmpDirLogFunction;
  #error: TmpDirLogFunction;
  #disposed: boolean;

  public readonly path: string;

  constructor(
    options: Partial<TmpDirOptions> = {}
  )
  {
    this.#trace = options.trace
      ?? (() =>
      {});

    this.#error = options.error
      ?? tmpDirConsoleLogFunction;

    const tmpDir =
      options.tmpDir
      ?? os.tmpdir();

    const prefix =
      options.prefix
      ?? 'asljs-tmpdir-';

    this.path = fs.mkdtempSync(
      path.join(
        tmpDir,
        prefix
      )
    );

    this.#trace(
      `constructor() { this.path=${this.path} }`
    );

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
        'All path segments must be relative'
      );
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
        `..${path.sep}`
      )
      || path.isAbsolute(relativePath)
    ) {
      throw new Error(
        'Resolved path must stay within the temporary directory'
      );
    }

    return resolvedPath;
  }

  async mkdir(
    directoryPath: string
  ): Promise<string>
  {
    this.#trace(
      `mkdir(${directoryPath})`
    );

    const resolvedDirectoryPath =
      this.resolve(
        directoryPath);

    await fsp.mkdir(
      resolvedDirectoryPath,
      { recursive: true }
    );

    return resolvedDirectoryPath;
  }

  async write(
    filePath: string,
    content: Buffer
  ): Promise<string>
  {
    this.#trace(
      `write(${filePath}, ...)`
    );

    this.#throwIfDisposed();

    const resolvedFilePath =
      this.resolve(
        filePath);

    await fsp.mkdir(
      path.dirname(
        resolvedFilePath
      ),
      { recursive: true }
    );

    await fsp.writeFile(
      resolvedFilePath,
      content
    );

    return resolvedFilePath;
  }

  async writeText(
    filePath: string,
    content: string
  ): Promise<string>
  {
    this.#trace(
      `writeText(${filePath}, ...)`
    );

    this.#throwIfDisposed();

    const resolvedFilePath =
      this.resolve(
        filePath);

    await fsp.mkdir(
      path.dirname(
        resolvedFilePath
      ),
      { recursive: true }
    );

    await fsp.writeFile(
      resolvedFilePath,
      content,
      'utf8'
    );

    return resolvedFilePath;
  }

  async readText(
    filePath: string
  ): Promise<string>
  {
    this.#trace(
      `readText(${filePath})`
    );

    this.#throwIfDisposed();

    const resolvedFilePath =
      this.resolve(
        filePath);

    return await fsp.readFile(
      resolvedFilePath,
      'utf8'
    );
  }

  async stat(
    path: string
  ): Promise<fs.Stats>
  {
    this.#trace(
      `stat(${path})`
    );

    this.#throwIfDisposed();

    const resolvedPath =
      this.resolve(
        path);

    return await fsp.stat(
      resolvedPath
    );
  }

  async cleanup(): Promise<void>
  {
    this.#trace(
      `cleanup()`
    );

    await this.#cleanup();
  }

  cleanupSync(): void
  {
    this.#trace(
      `cleanupSync()`
    );

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
        `TmpDir instance has been disposed`
      );
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
        { recursive: true, force: true }
      );
    } catch (error) {
      this.#error(
        `cleanup error: %s`,
        error
      );
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
        { recursive: true, force: true }
      );
    } catch (error) {
      this.#error(
        `cleanupSync() error: %s`,
        error
      );
    }

    this.#disposed = true;
  }
}
