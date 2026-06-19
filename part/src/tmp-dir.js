import fs
  from 'node:fs';
import os
  from 'node:os';
import path
  from 'node:path';
import { getInstanceId }
  from './framework.js';

/**
 * @typedef
 *   { import('./logging.js')
 *       .Logger}
 * Logger
 */

export class TmpDir
{
  /**
   * @param {Logger} logger
   */
  constructor(
    logger)
  {
    this.logger =
      logger.scope(
        { instanceId:
            getInstanceId(
              'TmpDir') });

    this.path =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          `part-test-`));

    this.logger.trace(
      `constructor() { this.path=${this.path} }`);

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
      `mkdir(${directoryPath})`);

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
      `writeText(${filePath}, ...)`);

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
      `readText(${filePath})`);

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
      `stat(${path})`);

    const resolvedPath =
      this.resolve(
        path);

    return fs.statSync(
      resolvedPath);
  }

  cleanup()
  {
    this.logger.trace(
      `cleanup()`);

    fs.rmSync(
      this.path,
      {
        recursive: true,
        force: true,
      });
    
    this.deleted = true;
  }
}
