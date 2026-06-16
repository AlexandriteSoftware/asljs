import path
  from 'node:path';
import { GitIgnore }
  from './gitIgnore.js';
import { glob }
  from 'glob';

export class FilesystemLocationResolver
{
  constructor(
    logger,
    rootPath)
  {
    this.logger = logger;

    this.rootPath =
      path.normalize(
        path.resolve(rootPath));

    this.gitIgnore =
      new GitIgnore(
        this.logger);
  }

  async resolve(
    basePath,
    patterns,
    excludePatterns = [],
    filters = [])
  {
    this.logger.trace(
      `FilesystemLocationResolver.resolve(${
        JSON.stringify(basePath)
      }, ${
        JSON.stringify(patterns)
      }, ${
        JSON.stringify(
          excludePatterns)
      }, ${
        JSON.stringify(filters)
      })`);

    const normalisedBasePath =
      path.normalize(
        path.resolve(basePath));

    const filesOnly =
      patterns.every(
        pattern => !pattern.endsWith('/'));
    
    const directoriesOnly =
      patterns.every(
        pattern => pattern.endsWith('/'));

    if (
      !filesOnly
      && !directoriesOnly)
    {
      throw new Error(
        `Patterns must be either all files or all directories`);
    }

    const matches =
      new Set();

    const rootPathPatterns =
      patterns
        .filter(
          pattern => pattern.startsWith('/'))
        .map(
          pattern => pattern.slice(1));
    
    if (rootPathPatterns.length > 0) {
      const rootPathMatches =
        await glob(
          rootPathPatterns,
          {
            cwd: this.rootPath,
            absolute: true,
            nodir: filesOnly
          });

      for (const match of rootPathMatches) {
        matches.add(match);
      }
    }

    const basePathPatterns =
      patterns
        .filter(
          pattern => !pattern.startsWith('/'));

    if (basePathPatterns.length > 0) {
      const basePathMatches =
        await glob(
          basePathPatterns,
          {
            cwd: normalisedBasePath,
            absolute: true,
            nodir: filesOnly
          });

      this.logger.trace(
        `FilesystemLocationResolver.resolve() => ${basePathMatches.length} in ${normalisedBasePath}`);

      for (const match of basePathMatches) {
        matches.add(match);
      }
    }

    const rootExcludePatterns =
      excludePatterns
        .filter(
          pattern => pattern.startsWith('/'))
        .map(
          pattern => pattern.slice(1));

    if (rootExcludePatterns.length > 0) {
      const rootExcludeMatches =
        await glob(
          rootExcludePatterns,
          {
            cwd: this.rootPath,
            absolute: true,
            nodir: filesOnly
          });

      for (const match of rootExcludeMatches) {
        matches.delete(match);
      }
    }

    const basePathExcludePatterns =
      excludePatterns
        .filter(
          pattern => !pattern.startsWith('/'));

    if (basePathExcludePatterns.length > 0) {
      const basePathExcludeMatches =
        await glob(
          basePathExcludePatterns,
          {
            cwd: normalisedBasePath,
            absolute: true,
            nodir: filesOnly
          });

      for (const match of basePathExcludeMatches) {
        matches.delete(match);
      }
    }

    let result =
      [...matches];

    for (const filter of filters) {
      switch (filter.name) {
        case 'GitIgnore':
          result =
            await this.gitIgnore
              .filter(
                result);
          break;
        default:
          throw new Error(
            `Unknown filter: ${filter.name}`);
      }
    }

    result.sort(
      (a, b) =>
        a.localeCompare(b));

    this.logger.trace(
      `FilesystemLocationResolver.resolve() => ${result.length} matches`);

    return result;
  }
}
