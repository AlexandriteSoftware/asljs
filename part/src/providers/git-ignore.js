import path
  from 'node:path';
import { readFileSync,
         statSync }
  from 'node:fs';
import ignore
  from 'ignore';

/**
 * @typedef
 *   { import('../logging.js')
 *       .Logger }
 *   Logger
 */

/**
 * @property {Logger} logger
 * @property {Array<{ path: string, matcher: ignore.Ignore }> } matchers
 * @property {Set<string>} visitedPaths
 */
export class GitIgnore
{
  /**
   * @param {Logger} logger 
   */
  constructor(
    logger)
  {
    this.logger = logger;

    this.matchers =
      /** @type {Array<{ path: string, matcher: ignore.Ignore }>} */([]);

    this.visitedPaths = new Set();
  }

  /**
   * @param {string} targetPath 
   * @returns {boolean}
   */
  isIgnored(
    targetPath)
  {
    if (!path.isAbsolute(targetPath)) {
      throw new Error(
        `Path must be absolute: ${targetPath}`);
    }

    const isDirectory =
      targetPath.endsWith(
        path.sep);

    const normalisedPath =
      path.normalize(
        targetPath);

    if (isDirectory) {
      this.loadMatchers(
        normalisedPath);
    } else {
      this.loadMatchers(
        path.dirname(
          normalisedPath));
    }

    for (const matcher of this.matchers) {
      const relativePath =
        toPosixPath(
          path.relative(
            matcher.path,
            normalisedPath));

      if (relativePath === ''
          || relativePath.startsWith('../'))
      {
        continue;
      }

    const testRelativePath =
      isDirectory
        ? relativePath + '/'
        : relativePath;


      if (
        matcher.matcher.ignores(
          testRelativePath))
      {
        return true;
      }
    }

    return false;
  }

  /**
   * @param {string[]} paths 
   * @returns {string[]}
   */
  filter(
    paths)
  {
    return paths.filter(
      filePath =>
        !this.isIgnored(filePath));
  }

  /**
   * @param {string} directoryPath
   */
  loadMatchers(
    directoryPath)
  {
    if (this.visitedPaths.has(directoryPath)) {
      return;
    }
    
    this.visitedPaths
      .add(
        directoryPath);

    const gitIgnorePath =
      path.join(
        directoryPath,
        '.gitignore');

    let gitIgnoreExists = false;

    try {
      statSync(gitIgnorePath);
      gitIgnoreExists = true;
    } catch (err) {
      const code =
        (/** @type {NodeJS.ErrnoException} */(err)).code;
      
      if (code !== 'ENOENT') {
        throw err;
      }
    }

    if (gitIgnoreExists) {
      const gitIgnoreContent =
        readFileSync(
          gitIgnorePath,
          'utf8');

      const matcher =
        ignore()
          .add(
            gitIgnoreContent);

      this.matchers.push(
        { path: directoryPath,
          matcher });
    }

    const parentPath =
      path.dirname(
        directoryPath);

    if (parentPath !== directoryPath) {
      this.loadMatchers(
        parentPath);
    }
  }
}

/**
 * @param {string} value 
 * @returns {string}
 */
function toPosixPath(
  value)
{
  return value.replaceAll(
    '\\',
    '/');
}