import fs
  from 'node:fs';
import os
  from 'node:os';
import path
  from 'node:path';

export class TmpDir
{
  constructor(
    logger)
  {
    this.logger = logger;

    this.path =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          `part-test-`));

    this.logger?.trace(
      `TmpDir created: ${this.path}`);
  }

  resolve(
    ...segments)
  {
    return path.resolve(
      this.path,
      ...segments);
  }

  mkdir(
    ...segments)
  {
    const dirPath =
      this.resolve(
        ...segments);

    this.logger?.trace(
      `mkdir: ${dirPath}`);

    fs.mkdirSync(
      dirPath,
      { recursive: true });

    return dirPath;
  }

  writeText(
    filePath,
    content)
  {
    const resolvedFilePath =
      this.resolve(
        filePath);

    this.logger?.trace(
      `writeText: ${resolvedFilePath}`);

    fs.mkdirSync(
      path.dirname(
        resolvedFilePath),
      { recursive: true });

    fs.writeFileSync(
      resolvedFilePath,
      content,
      'utf8');
  }

  readText(
    filePath)
  {
    const resolvedFilePath =
      this.resolve(
        filePath);

    this.logger?.trace(
      `readText: ${resolvedFilePath}`);

    return fs.readFileSync(
      resolvedFilePath,
      'utf8');
  }

  stat(
    path)
  {
    const resolvedPath =
      this.resolve(
        path);

    this.logger?.trace(
      `stat: ${resolvedPath}`);

    return fs.statSync(
      resolvedPath);
  }

  cleanup()
  {
    this.logger?.trace(
      `cleanup: ${this.path}`);

    fs.rmSync(
      this.path,
      {
        recursive: true,
        force: true,
      });
  }
}