import fs
  from 'node:fs';
import os
  from 'node:os';
import path
  from 'node:path';

export class TmpDir
{
  /**
   * @param {import('./logging.js').Logger} logger
   */
  constructor(
    logger)
  {
    this.logger = logger;

    this.path =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          `part-test-`));

    this.ctx = `TmpDir[${this.path}]`;

    this.logger.trace(
      `${this.ctx}.constructor()`);

    this.deleted = false;
  }

  /**
   * @param {string[]} segments
   */
  resolve(
    ...segments)
  {
    const segmentsAreValid =
      segments.every(
        item => !path.isAbsolute(item));

    if (!segmentsAreValid) {
      throw new Error(
        'All path segments must be relative');
    }

    return path.resolve(
      this.path,
      ...segments);
  }

  /**
   * @param {string} directoryPath
   */
  mkdir(
    directoryPath)
  {
    this.logger.trace(
      `${this.ctx}.mkdir(${directoryPath})`);

    const resolvedDirectoryPath =
      this.resolve(
        directoryPath);

    fs.mkdirSync(
      resolvedDirectoryPath,
      { recursive: true });
  }

  /**
   * @param {string} filePath
   * @param {string} content
   */
  writeText(
    filePath,
    content)
  {
    this.logger.trace(
      `${this.ctx}.writeText(${filePath}, ...)`);

    const resolvedFilePath =
      path.resolve(
        this.path,
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

  /**
   * @param {string} filePath
   */
  readText(
    filePath)
  {
    this.logger.trace(
      `${this.ctx}.readText(${filePath})`);

    const resolvedFilePath =
      this.resolve(
        filePath);

    return fs.readFileSync(
      resolvedFilePath,
      'utf8');
  }

  /**
   * @param {string} path
   */
  stat(
    path)
  {
    this.logger.trace(
      `${this.ctx}.stat(${path})`);

    const resolvedPath =
      this.resolve(
        path);

    return fs.statSync(
      resolvedPath);
  }

  cleanup()
  {
    this.logger.trace(
      `${this.ctx}.cleanup()`);

    fs.rmSync(
      this.path,
      {
        recursive: true,
        force: true,
      });
    
    this.deleted = true;
  }
}
